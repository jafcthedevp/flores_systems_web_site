import { describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { quoteSchema, followupSchema } from '@/lib/contracts/quote-requests';
import { escapeHtml } from '@/lib/services/notification-template';
const valid = { idempotency_key: randomUUID(), contact_name: ' Ana ', business_name: 'Mi tienda', business_type: 'tienda_bodega', service: 'ambos', description: 'Necesito controlar mis ventas', preferred_channel: 'correo', email: ' ANA@EXAMPLE.COM ', phone: '', budget: null, timeframe: null, consent: true, website: '' };
describe('contrato público', () => {
  it('normaliza sin cambiar la intención del envío', () => {
    expect(quoteSchema.parse(valid)).toMatchObject({ contact_name: 'Ana', email: 'ana@example.com', phone: null });
    expect(quoteSchema.parse({ ...valid, phone: '0051 (986) 132-628', preferred_channel: 'whatsapp' }).phone).toBe('+51986132628');
  });
  it.each([{ email: '', phone: '' }, { preferred_channel: 'whatsapp', phone: '' }, { consent: false }, { status: 'cerrado' }, { website: 'bot' }, { description: 'x'.repeat(2001) }, { business_type: 'arbitrario' }, { phone: '986132628' }])('rechaza entradas inválidas o campos internos: %j', patch => {
    expect(quoteSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });
  it('escapa el HTML enviado por contactos', () => { expect(escapeHtml('<script>"hola"&</script>')).toBe('&lt;script&gt;&quot;hola&quot;&amp;&lt;/script&gt;'); });
  it('exige resultado al cerrar y lo limpia al reabrir', () => {
    const update = { id: randomUUID(), version: 1, status: 'cerrado', follow_up_at: null, quoted_amount: '100.99', quoted_at: null, outcome: null, close_reason: null };
    expect(followupSchema.safeParse(update).success).toBe(false);
    expect(followupSchema.safeParse({ ...update, outcome: 'ganado' }).success).toBe(true);
    expect(followupSchema.safeParse({ ...update, status: 'nuevo', outcome: 'ganado' }).success).toBe(false);
    expect(followupSchema.safeParse({ ...update, status: 'nuevo', quoted_amount: '0.001' }).success).toBe(false);
  });
});
