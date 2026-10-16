import { z } from 'zod';

export const BUSINESS_TYPES = ['veterinaria', 'restaurante', 'tienda_bodega', 'mercado_puesto', 'spa', 'colegio', 'ropa', 'otro'] as const;
export const SERVICES = ['sitio_web', 'sistema_administrativo', 'ambos', 'orientacion'] as const;
export const BUDGETS = ['menos_1000', '1000_3000', '3000_6000', 'mas_6000', 'por_definir'] as const;
export const TIMEFRAMES = ['urgente', '1_3_meses', '3_6_meses', 'por_definir'] as const;
export const STATUSES = ['nuevo', 'en_conversacion', 'cotizado', 'cerrado'] as const;
export const SOURCES = ['formulario_web', 'whatsapp', 'correo', 'prospeccion', 'otro'] as const;
export const PRIVACY_VERSION = '2026-10-15';
const optionalEmail = z.preprocess(v => typeof v === 'string' ? v.trim().toLowerCase() || null : v, z.email().max(254).nullable());
export function normalizePhone(value: string) {
  const normalized = value.trim().replace(/[\s().-]/g, '');
  return normalized.startsWith('00') ? '+' + normalized.slice(2) : normalized;
}
const optionalPhone = z.preprocess(v => typeof v === 'string' ? normalizePhone(v) || null : v, z.string().regex(/^\+[1-9]\d{7,14}$/, 'Incluye el código de país, por ejemplo +51986132628.').nullable());
export const contactSchema = z.object({
  contact_name: z.string().trim().min(1).max(80),
  business_name: z.string().trim().min(1).max(120),
  business_type: z.enum(BUSINESS_TYPES), service: z.enum(SERVICES),
  description: z.string().trim().min(10).max(2000),
  preferred_channel: z.enum(['correo', 'whatsapp']),
  email: optionalEmail, phone: optionalPhone,
  budget: z.enum(BUDGETS).nullable(), timeframe: z.enum(TIMEFRAMES).nullable(),
}).superRefine((v, ctx) => {
  if (!v.email && !v.phone) ctx.addIssue({ code: 'custom', path: ['email'], message: 'Ingresa al menos una vía de contacto.' });
  if (v.preferred_channel === 'correo' && !v.email) ctx.addIssue({ code: 'custom', path: ['email'], message: 'El correo es obligatorio para este canal.' });
  if (v.preferred_channel === 'whatsapp' && !v.phone) ctx.addIssue({ code: 'custom', path: ['phone'], message: 'El teléfono es obligatorio para este canal.' });
});
export const quoteSchema = contactSchema.extend({
  idempotency_key: z.uuid(), consent: z.literal(true, { error: 'Debes autorizar el contacto por esta solicitud.' }),
  website: z.string().max(0, 'No se pudo enviar la solicitud.'),
}).strict();
export const followupSchema = z.object({
  id: z.uuid(), version: z.coerce.number().int().positive(), status: z.enum(STATUSES),
  follow_up_at: z.iso.datetime({ offset: true }).nullable(),
  quoted_amount: z.string().regex(/^\d{1,10}(\.\d{1,2})?$/).nullable(),
  quoted_at: z.iso.datetime({ offset: true }).nullable(),
  outcome: z.enum(['ganado', 'perdido', 'desistido']).nullable(),
  close_reason: z.string().trim().max(1000).nullable(),
}).strict().superRefine((v, ctx) => {
  if ((v.status === 'cerrado') !== (v.outcome !== null)) ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Indica un resultado solo al cerrar.' });
  if (v.status !== 'cerrado' && v.close_reason) ctx.addIssue({ code: 'custom', path: ['close_reason'], message: 'El motivo corresponde a una oportunidad cerrada.' });
  if (v.status === 'cotizado' && !v.quoted_at) ctx.addIssue({ code: 'custom', path: ['quoted_at'], message: 'Indica la fecha de cotización.' });
});
export type QuoteInput = z.infer<typeof quoteSchema>;
export type ActionResult = { ok: true; reference: string } | { ok: false; code: 'invalid' | 'rate_limited' | 'conflict' | 'unavailable' | 'unauthorized'; errors?: Record<string, string[]>; retryAfter?: number };
export function formToQuote(form: FormData) {
  const value = (name: string) => form.get(name);
  return {
    contact_name: value('contact_name'), business_name: value('business_name'), business_type: value('business_type'),
    service: value('service'), description: value('description'), preferred_channel: value('preferred_channel'),
    email: value('email') ?? null, phone: value('phone') ?? null,
    budget: value('budget') || null, timeframe: value('timeframe') || null,
    consent: value('consent') === 'on', idempotency_key: value('idempotency_key'), website: value('website') ?? '',
  };
}
