import 'server-only';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import { z } from 'zod';
import { quoteSchema, PRIVACY_VERSION, type ActionResult } from '@/lib/contracts/quote-requests';
import { requiredEnv } from '@/lib/env';
import { createPrivilegedClient } from '@/lib/supabase/admin';
import { notificationPayload } from './notification-template';
const receiptSchema = z.object({ code: z.enum(['created', 'replayed', 'conflict', 'rate_limited']), reference: z.uuid().optional(), retry_after: z.number().optional() });
export async function submitQuote(input: unknown, requestHeaders: Headers): Promise<ActionResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: 'invalid', errors: z.flattenError(parsed.error).fieldErrors };
  let stage = 'configuration';
  try {
    if (process.env.QUOTE_RATE_LIMIT_ENABLED !== 'true') {
      console.error('quote_service_unavailable', { stage, reason: 'intake_disabled' });
      return { ok: false, code: 'unavailable' };
    }
    const ipHeader = requiredEnv('TRUSTED_IP_HEADER').toLowerCase();
    stage = 'client_ip';
    // No interpretar cadenas x-forwarded-for controladas por el cliente: el hosting debe fijar un único IP.
    const ip = requestHeaders.get(ipHeader)?.trim();
    if (!ip || !isIP(ip)) {
      console.error('quote_service_unavailable', { stage, reason: ip ? 'invalid_client_ip' : 'missing_client_ip' });
      return { ok: false, code: 'unavailable' };
    }
    stage = 'configuration';
    const secret = requiredEnv('RATE_LIMIT_HMAC_SECRET');
    if (secret.length < 32) throw new Error('INVALID_RATE_SECRET');
    const rateKey = createHmac('sha256', secret).update(ip).digest('hex');
    const { idempotency_key } = parsed.data;
    const contact = {
      contact_name: parsed.data.contact_name, business_name: parsed.data.business_name,
      business_type: parsed.data.business_type, service: parsed.data.service,
      description: parsed.data.description, email: parsed.data.email, phone: parsed.data.phone,
      preferred_channel: parsed.data.preferred_channel, budget: parsed.data.budget, timeframe: parsed.data.timeframe,
    };
    const fingerprint = createHash('sha256').update(JSON.stringify({ ...contact, consent: true })).digest('hex');
    const requestId = randomUUID(), reference = randomUUID();
    const appUrl = new URL(requiredEnv('APP_URL'));
    if (appUrl.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(appUrl.hostname)) throw new Error('INVALID_APP_URL');
    stage = 'supabase_client';
    const client = createPrivilegedClient();
    stage = 'commit';
    const { data, error } = await client.rpc('submit_quote_request', {
      p_input: { ...contact, id: requestId, reference, idempotency_key, consent_version: PRIVACY_VERSION },
      p_fingerprint: fingerprint, p_rate_key: rateKey,
      p_recipient: requiredEnv('NOTIFICATION_TO'),
      p_payload: notificationPayload(parsed.data, requiredEnv('NOTIFICATION_FROM'), requiredEnv('NOTIFICATION_TO'), {
        reference, dashboardUrl: new URL(`/admin/solicitudes/${requestId}`, appUrl).href,
      }),
    });
    if (error) { console.error('quote_commit_failed', { code: error.code }); return { ok: false, code: 'unavailable' }; }
    stage = 'receipt';
    const receipt = receiptSchema.parse(data);
    if (receipt.code === 'conflict') return { ok: false, code: 'conflict' };
    if (receipt.code === 'rate_limited') return { ok: false, code: 'rate_limited', retryAfter: receipt.retry_after };
    if (!receipt.reference) {
      console.error('quote_service_unavailable', { stage, reason: 'missing_reference' });
      return { ok: false, code: 'unavailable' };
    }
    return { ok: true, reference: receipt.reference };
  } catch (error) {
    // Solo nombres de variables y códigos propios: nunca errores crudos, IPs o datos de contacto.
    const message = error instanceof Error ? error.message : '';
    const variable = /^Falta configurar ([A-Z][A-Z0-9_]*)$/.exec(message)?.[1];
    const reason = variable ? 'missing_env' :
      message === 'INVALID_RATE_SECRET' ? 'invalid_rate_secret' :
      message === 'INVALID_APP_URL' ? 'invalid_app_url' : 'exception';
    console.error('quote_service_unavailable', { stage, reason, ...(variable ? { variable } : {}) });
    return { ok: false, code: 'unavailable' };
  }
}
