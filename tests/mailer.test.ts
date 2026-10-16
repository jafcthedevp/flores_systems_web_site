import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotificationMailer } from '../supabase/functions/_shared/mailer';
afterEach(() => vi.unstubAllGlobals());
describe('transporte del SDK de Resend', () => {
  it('envía la clave estable y limita la duración de la petición', async () => {
    const request = vi.fn(async () => Response.json({ id: 'provider-1' }));
    vi.stubGlobal('fetch', request);
    const mailer = new NotificationMailer('fake-test-key');
    const result = await mailer.emails.send({ from: 'avisos@example.com', to: ['admin@example.com'], subject: 'Prueba', html: '<p>Prueba</p>' }, { idempotencyKey: 'quote-notice/job-1' });
    expect(result.data?.id).toBe('provider-1');
    const [url, options] = request.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(new Headers(options.headers).get('Idempotency-Key')).toBe('quote-notice/job-1');
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });
  it('no devuelve ni registra errores que contengan direcciones del destinatario', async () => {
    vi.stubGlobal('fetch', async () => new Response('address: private@example.com', { status: 422 }));
    const result = await new NotificationMailer('fake-test-key').emails.send({ from: 'avisos@example.com', to: ['admin@example.com'], subject: 'Prueba', html: '<p>Prueba</p>' });
    expect(result.error?.message).toBe('provider_rejected');
    expect(JSON.stringify(result)).not.toContain('private@example.com');
  });
});
