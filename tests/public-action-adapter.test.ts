import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
const { submit } = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock('@/app/actions/quote-requests', () => ({ submitQuoteRequest: submit }));
import { submitQuote } from '@/app/actions/quote';
const input = { name: 'Ana', business: 'Negocio de prueba', businessType: 'veterinaria', service: 'ambos', description: 'Necesito organizar mis citas', channel: 'correo', email: 'ana@example.com', phone: '', budget: '', timeline: '', consent: true };
beforeEach(() => submit.mockReset());
describe('adaptador público de la landing', () => {
  it('no elimina el campo trampa antes de validarlo en el servidor', async () => {
    expect((await submitQuote({ ...input, website: 'bot-filled' }, randomUUID())).status).toBe('invalid');
    expect(submit).not.toHaveBeenCalled();
  });
  it('solo comunica éxito con una referencia confirmada por el backend', async () => {
    const reference = randomUUID();
    submit.mockResolvedValue({ ok: true, reference });
    expect(await submitQuote(input, randomUUID())).toEqual({ status: 'success', reference });
    submit.mockResolvedValue({ ok: false, code: 'unavailable' });
    expect((await submitQuote(input, randomUUID())).status).toBe('temporary');
  });
});
