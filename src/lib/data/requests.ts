import 'server-only';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { STATUSES, SOURCES } from '@/lib/contracts/quote-requests';
const filters = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  status: z.enum(STATUSES).optional(), source: z.enum(SOURCES).optional(),
  search: z.string().trim().max(120).default(''),
  from: z.iso.date().optional(), to: z.iso.date().optional(), pending: z.boolean().default(false),
}).refine(f => !f.from || !f.to || f.from <= f.to, { message: 'El rango de fechas es inválido.' });
export async function listRequests(input: unknown) {
  const { client } = await requireAdmin();
  const f = filters.parse(input);
  let query = client.from('quote_requests').select('id,reference,contact_name,business_name,email,phone,status,source,follow_up_at,created_at,version', { count: 'exact' });
  if (f.status) query = query.eq('status', f.status);
  if (f.source) query = query.eq('source', f.source);
  if (f.from) query = query.gte('created_at', `${f.from}T00:00:00-05:00`);
  if (f.to) {
    const end = new Date(`${f.to}T00:00:00-05:00`);
    end.setUTCDate(end.getUTCDate() + 1);
    query = query.lt('created_at', end.toISOString());
  }
  if (f.pending) query = query.neq('status', 'cerrado').lte('follow_up_at', new Date().toISOString());
  if (f.search) {
    // PostgREST .or usa gramática propia: eliminar delimitadores y comodines antes de interpolar.
    const search = f.search.replace(/[^\p{L}\p{N}@+ ._-]/gu, '').replace(/[%_]/g, '').trim();
    if (search) query = query.or(['contact_name', 'business_name', 'email', 'phone'].map(k => `${k}.ilike.%${search}%`).join(','));
  }
  const { data, error, count } = await query.order('created_at', { ascending: false }).order('id', { ascending: false }).range((f.page - 1) * 25, f.page * 25 - 1);
  if (error) throw new Error('No se pudieron consultar las solicitudes.');
  return { rows: data ?? [], count: count ?? 0, page: f.page, pageSize: 25, pages: Math.max(1, Math.ceil((count ?? 0) / 25)) };
}
export async function getRequest(id: string) {
  z.uuid().parse(id);
  const { client } = await requireAdmin();
  const [request, notes, history, notifications] = await Promise.all([
    client.from('quote_requests').select('*').eq('id', id).maybeSingle(),
    client.from('request_notes').select('*').eq('request_id', id).order('created_at', { ascending: true }),
    client.from('request_status_history').select('*').eq('request_id', id).order('created_at', { ascending: true }),
    client.from('notification_jobs').select('id,status,attempts,next_attempt_at,last_error_code,provider_id,sent_at').eq('request_id', id),
  ]);
  if ([request, notes, history, notifications].some(r => r.error)) throw new Error('No se pudo consultar el detalle.');
  return { request: request.data, notes: notes.data ?? [], history: history.data ?? [], notifications: notifications.data ?? [] };
}
export async function getCounters() {
  const { client } = await requireAdmin();
  const { data, error } = await client.rpc('crm_counters');
  if (error) throw new Error('No se pudieron consultar los contadores.');
  return data;
}
