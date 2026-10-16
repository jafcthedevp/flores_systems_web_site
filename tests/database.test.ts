import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
const adminId = 'a0000000-0000-4000-8000-000000000001';
const otherId = 'a0000000-0000-4000-8000-000000000002';
let db: PGlite;
async function role(role: 'service_role' | 'anon' | 'authenticated', uid?: string) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub','${uid ?? ''}',false); set role ${role};`);
}
async function submit(key = randomUUID(), fingerprint = 'a'.repeat(64), rateKey = 'b'.repeat(64), recipient = 'admin@example.com') {
  const input = { idempotency_key: key, contact_name: 'Prueba', business_name: 'Veterinaria demo', business_type: 'veterinaria', service: 'ambos', description: 'Necesito una solución administrativa', email: 'cliente@example.com', phone: null, preferred_channel: 'correo', budget: null, timeframe: null, consent_version: '2026-10-15' };
  const result = await db.query<{ result: { code: string; reference?: string } }>('select public.submit_quote_request($1::jsonb,$2,$3,$4,$5::jsonb) as result', [JSON.stringify(input), fingerprint, rateKey, recipient, JSON.stringify({ from: 'avisos@example.com', to: [recipient], html: '<p>Prueba</p>' })]);
  return result.rows[0].result;
}
describe('PostgreSQL real en memoria: transacciones, RLS y cola', () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      grant usage on schema public to anon,authenticated,service_role;
      create schema auth; create table auth.users(id uuid primary key);
      grant usage on schema auth to anon,authenticated,service_role;
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      insert into auth.users values('${adminId}'),('${otherId}');`);
    for (const file of (await readdir('supabase/migrations')).filter(f => f.endsWith('.sql')).sort()) {
      await db.exec(await readFile(`supabase/migrations/${file}`, 'utf8'));
    }
    await db.exec(`insert into public.admin_users(user_id) values('${adminId}')`);
  });
  beforeEach(async () => {
    await db.exec("reset role; select set_config('request.jwt.claim.sub','',false); truncate public.quote_requests cascade; truncate private.rate_limits;");
    await role('service_role');
  });
  afterAll(async () => { await db?.close(); });
  it('guarda una solicitud y un aviso; reintenta sin duplicar y detecta conflicto', async () => {
    const key = randomUUID();
    const first = await submit(key);
    expect(first.code).toBe('created');
    expect(await submit(key)).toEqual({ ...first, code: 'replayed' });
    expect(await submit(key, 'c'.repeat(64))).toEqual({ code: 'conflict' });
    const rows = await db.query<{ quotes: number; jobs: number; history: number }>('select (select count(*)::int from public.quote_requests) as quotes,(select count(*)::int from public.notification_jobs) as jobs,(select count(*)::int from public.request_status_history) as history');
    expect(rows.rows[0]).toEqual({ quotes: 1, jobs: 1, history: 1 });
  });
  it('si falla el aviso revierte solicitud e historial', async () => {
    await expect(submit(randomUUID(), 'a'.repeat(64), 'b'.repeat(64), 'invalido')).rejects.toThrow();
    expect((await db.query<{ n: number }>('select count(*)::int n from public.quote_requests')).rows[0].n).toBe(0);
  });
  it('limita compartidamente a 5 envíos y admite nuevas oportunidades del mismo contacto', async () => {
    for (let i = 0; i < 5; i++) expect((await submit()).code).toBe('created');
    expect((await submit()).code).toBe('rate_limited');
    expect((await submit(randomUUID(), 'a'.repeat(64), 'c'.repeat(64))).code).toBe('created');
  });
  it('un visitante no lee ni inserta ni llama RPC privilegiadas', async () => {
    await submit();
    await role('anon');
    await expect(db.query('select * from public.quote_requests')).rejects.toThrow(/permission denied/);
    await expect(submit()).rejects.toThrow(/permission denied/);
    await expect(db.query('select * from public.notification_jobs')).rejects.toThrow(/permission denied/);
  });
  it('una segunda cuenta no ve filas, no toma privilegios ni modifica solicitudes', async () => {
    await submit();
    await role('authenticated', otherId);
    expect((await db.query('select * from public.quote_requests')).rows).toHaveLength(0);
    expect((await db.query('select * from public.notification_jobs')).rows).toHaveLength(0);
    await expect(db.query('insert into public.admin_users(user_id) values($1)', [otherId])).rejects.toThrow(/permission denied/);
    await expect(db.query("select public.update_quote_request('{}')")).rejects.toThrow(/UNAUTHORIZED/);
    await expect(db.query('select public.claim_notification_jobs(1)')).rejects.toThrow(/permission denied/);
    await expect(db.query('select private.retry_notification_authorized($1)', [randomUUID()])).rejects.toThrow(/UNAUTHORIZED/);
  });
  it('el administrador cambia estado e historial atómicamente, cierra y reabre con versión', async () => {
    await submit();
    const id = (await db.query<{ id: string }>('select id from public.quote_requests')).rows[0].id;
    await role('authenticated', adminId);
    const update = { id, version: 1, status: 'cerrado', outcome: 'ganado', close_reason: 'Aprobado', follow_up_at: null, quoted_amount: '3000.50', quoted_at: new Date().toISOString() };
    await db.query('select public.update_quote_request($1)', [JSON.stringify(update)]);
    await expect(db.query('select public.update_quote_request($1)', [JSON.stringify(update)])).rejects.toThrow(/STALE_VERSION/);
    await db.query('select public.update_quote_request($1)', [JSON.stringify({ ...update, version: 2, status: 'en_conversacion', outcome: null, close_reason: null })]);
    const history = await db.query<{ new_status: string; new_outcome: string | null }>('select new_status,new_outcome from public.request_status_history order by created_at,id');
    expect(history.rows.some(h => h.new_status === 'cerrado' && h.new_outcome === 'ganado')).toBe(true);
    expect(history.rows).toHaveLength(3);
    const before = await db.query('select version,status from public.quote_requests');
    await expect(db.query('select public.update_quote_request($1)', [JSON.stringify({ ...update, version: 3, outcome: null })])).rejects.toThrow();
    expect((await db.query('select version,status from public.quote_requests')).rows).toEqual(before.rows);
  });
  it('notas e historial no permiten edición ni eliminación, y las notas guardan autor', async () => {
    await submit();
    const id = (await db.query<{ id: string }>('select id from public.quote_requests')).rows[0].id;
    await role('authenticated', adminId);
    await db.query('select public.add_request_note($1,$2)', [id, 'Primera conversación']);
    expect((await db.query<{ author_id: string }>('select author_id from public.request_notes')).rows[0].author_id).toBe(adminId);
    await expect(db.query("update public.request_notes set body = 'Cambio'")).rejects.toThrow(/permission denied/);
    await expect(db.query('delete from public.request_status_history')).rejects.toThrow(/permission denied/);
    await expect(db.query('delete from public.quote_requests')).rejects.toThrow(/permission denied/);
  });
  it('reclama con exclusión y no acepta confirmaciones de un bloqueo antiguo', async () => {
    await submit();
    const first = (await db.query<{ id: string; lease_token: string }>('select * from public.claim_notification_jobs(1)')).rows[0];
    expect((await db.query('select * from public.claim_notification_jobs(1)')).rows).toHaveLength(0);
    await db.query("update public.notification_jobs set locked_until = now() - interval '1 second' where id = $1", [first.id]);
    const second = (await db.query<{ id: string; lease_token: string }>('select * from public.claim_notification_jobs(1)')).rows[0];
    expect(second.lease_token).not.toBe(first.lease_token);
    expect((await db.query<{ ok: boolean }>('select public.finish_notification_job($1,$2,$3,null) ok', [first.id, first.lease_token, 'stale'])).rows[0].ok).toBe(false);
    expect((await db.query<{ ok: boolean }>('select public.finish_notification_job($1,$2,$3,null) ok', [second.id, second.lease_token, 'provider-1'])).rows[0].ok).toBe(true);
    expect((await db.query<{ status: string }>('select status from public.notification_jobs')).rows[0].status).toBe('accepted');
  });
  it('aplica espera creciente, permite reintento manual y corta la ventana de 20h', async () => {
    await submit();
    const job = (await db.query<{ id: string; lease_token: string }>('select * from public.claim_notification_jobs(1)')).rows[0];
    await db.query('select public.finish_notification_job($1,$2,null,$3)', [job.id, job.lease_token, 'provider_unavailable']);
    expect((await db.query('select * from public.claim_notification_jobs(1)')).rows).toHaveLength(0);
    await db.query("update public.notification_jobs set status = 'exhausted' where id = $1", [job.id]);
    await role('authenticated', adminId);
    await db.query('select public.retry_notification($1)', [job.id]);
    await role('service_role');
    await db.query("update public.notification_jobs set first_attempt_at = now() - interval '21 hours' where id = $1", [job.id]);
    expect((await db.query('select * from public.claim_notification_jobs(1)')).rows).toHaveLength(0);
    await role('authenticated', adminId);
    await expect(db.query('select public.retry_notification($1)', [job.id])).rejects.toThrow(/RECONCILE_PROVIDER/);
  });
  it('creación manual registra origen y autor sin generar un aviso web', async () => {
    await role('authenticated', adminId);
    await db.query('select public.create_manual_request($1)', [JSON.stringify({ contact_name: 'Anthony', business_name: 'Bodega demo', business_type: 'tienda_bodega', service: 'sitio_web', description: 'Contacto de prospección comercial', email: null, phone: '+51986132628', preferred_channel: 'whatsapp', budget: null, timeframe: null, source: 'prospeccion' })]);
    expect((await db.query<{ created_by: string; source: string }>('select created_by,source from public.quote_requests')).rows[0]).toEqual({ created_by: adminId, source: 'prospeccion' });
    expect((await db.query('select * from public.notification_jobs')).rows).toHaveLength(0);
  });
});
