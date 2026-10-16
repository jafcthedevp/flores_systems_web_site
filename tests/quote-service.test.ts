import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({ createPrivilegedClient: () => ({ rpc }) }));
import { submitQuote } from '@/lib/services/quote-requests';
const input = { idempotency_key: randomUUID(), contact_name: 'Ana', business_name: 'Mi negocio', business_type: 'otro', service: 'orientacion', description: 'Quiero organizar mis procesos', preferred_channel: 'correo', email: 'ana@example.com', phone: null, budget: null, timeframe: null, consent: true, website: '' };
describe('recepción exclusiva del servidor', () => {
  beforeEach(() => {
    vi.stubEnv('QUOTE_RATE_LIMIT_ENABLED', 'true');
    vi.stubEnv('TRUSTED_IP_HEADER', 'x-real-ip');
    vi.stubEnv('RATE_LIMIT_HMAC_SECRET', 'a'.repeat(48));
    vi.stubEnv('NOTIFICATION_TO', 'admin@example.com');
    vi.stubEnv('NOTIFICATION_FROM', 'avisos@example.com');
    vi.stubEnv('APP_URL', 'https://example.com');
    rpc.mockReset().mockResolvedValue({ data: { code: 'created', reference: randomUUID() }, error: null });
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
  it('no toca la base de datos si faltan controles del hosting o están desactivados', async () => {
    expect(await submitQuote(input, new Headers())).toEqual({ ok: false, code: 'unavailable' });
    expect(await submitQuote(input, new Headers({ 'x-real-ip': '1.2.3.4, 5.6.7.8' }))).toEqual({ ok: false, code: 'unavailable' });
    vi.stubEnv('QUOTE_RATE_LIMIT_ENABLED', 'false');
    expect(await submitQuote(input, new Headers({ 'x-real-ip': '203.0.113.1' }))).toEqual({ ok: false, code: 'unavailable' });
    expect(rpc).not.toHaveBeenCalled();
  });
  it('rechaza campos internos y consentimiento falso antes de abrir el cliente privilegiado', async () => {
    expect((await submitQuote({ ...input, status: 'cerrado' }, new Headers())).ok).toBe(false);
    expect((await submitQuote({ ...input, consent: false }, new Headers())).ok).toBe(false);
    expect(rpc).not.toHaveBeenCalled();
  });
  it('envía solo el hash de IP y datos controlados por el servidor', async () => {
    expect((await submitQuote(input, new Headers({ 'x-real-ip': '203.0.113.1' }))).ok).toBe(true);
    const [name, args] = rpc.mock.calls[0];
    expect(name).toBe('submit_quote_request');
    expect(args.p_rate_key).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(args)).not.toContain('203.0.113.1');
    expect(args.p_input).toMatchObject({ consent_version: '2026-10-15' });
    expect(args.p_input).not.toHaveProperty('status');
    expect(args.p_recipient).toBe('admin@example.com');
    expect(args.p_payload.html).toContain(args.p_input.reference);
    expect(args.p_payload.html).toContain(`https://example.com/admin/solicitudes/${args.p_input.id}`);
  });
  it.each(['conflict', 'rate_limited'] as const)('mapea %s sin revelar información de otras solicitudes', async code => {
    rpc.mockResolvedValue({ data: { code, retry_after: 300 }, error: null });
    const result = await submitQuote(input, new Headers({ 'x-real-ip': '203.0.113.1' }));
    expect(result).toMatchObject({ ok: false, code });
    expect(result).not.toHaveProperty('reference');
  });
  it('solo confirma después del commit y oculta mensajes internos', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    rpc.mockResolvedValue({ data: null, error: { code: '23514', message: 'private database details' } });
    expect(await submitQuote(input, new Headers({ 'x-real-ip': '203.0.113.1' }))).toEqual({ ok: false, code: 'unavailable' });
  });
});
