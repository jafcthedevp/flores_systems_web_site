import { describe, expect, it } from 'vitest';
import { processNotifications, validSchedulerSecret, type Job } from '../supabase/functions/_shared/notifications';
const job: Job = { id: 'job-1', lease_token: 'lease-1', payload: { from: 'avisos@example.com', to: ['admin@example.com'], subject: 'Prueba', html: '<p>Prueba</p>' } };
describe('procesador privado de avisos', () => {
  it('rechaza secreto ausente, corto o incorrecto y acepta el secreto privado exacto', () => {
    const secret = 's'.repeat(48);
    expect(validSchedulerSecret(secret, secret)).toBe(true);
    expect(validSchedulerSecret('sb_publishable_public', secret)).toBe(false);
    expect(validSchedulerSecret(null, secret)).toBe(false);
    expect(validSchedulerSecret('corto', 'corto')).toBe(false);
  });
  it('conserva payload y clave estable tras una respuesta ambigua del proveedor', async () => {
    const sent: unknown[] = [], finished: unknown[] = [];
    let attempt = 0;
    const deps = {
      claim: async () => [job],
      send: async (message: unknown, key: string) => { sent.push({ message, key }); if (++attempt === 1) throw new Error('network'); return { id: 'provider-1' }; },
      finish: async (_j: Job, id: string | null, code: string | null) => { finished.push({ id, code }); return true; },
    };
    expect((await processNotifications(deps)).failed).toBe(1);
    expect((await processNotifications(deps)).accepted).toBe(1);
    expect(sent[0]).toEqual(sent[1]);
    expect(finished).toEqual([{ id: null, code: 'provider_unavailable' }, { id: 'provider-1', code: null }]);
  });
  it('si falla el registro posterior al envío no declara el trabajo confirmado', async () => {
    expect(await processNotifications({ claim: async () => [job], send: async () => ({ id: 'provider-1' }), finish: async () => { throw new Error('db'); } })).toEqual({ claimed: 1, accepted: 0, failed: 0, unresolved: 1 });
  });
});
