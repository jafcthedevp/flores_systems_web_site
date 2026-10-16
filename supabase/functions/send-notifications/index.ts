import { createClient } from '@supabase/supabase-js';
import { NotificationMailer } from '../_shared/mailer.ts';
import { processNotifications, validSchedulerSecret, type Job } from '../_shared/notifications.ts';

Deno.serve(async (request: Request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { Allow: 'POST' } });
  const expected = Deno.env.get('NOTIFICATION_CRON_SECRET');
  if (!expected || expected.length < 32) return new Response('Not configured', { status: 503 });
  if (!validSchedulerSecret(request.headers.get('x-cron-secret'), expected)) return new Response('Unauthorized', { status: 401 });
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
    const key = Deno.env.get('SUPABASE_SECRET_KEY') || keys.default;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!key || !resendKey) return new Response('Not configured', { status: 503 });
    const client = createClient(Deno.env.get('SUPABASE_URL')!, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const resend = new NotificationMailer(resendKey);
    const result = await processNotifications({
      async claim() {
        const { data, error } = await client.rpc('claim_notification_jobs', { p_limit: 5 });
        if (error) throw new Error('claim_failed');
        return (data ?? []) as Job[];
      },
      async send(message, idempotencyKey) {
        const { data, error } = await resend.emails.send(message, { idempotencyKey });
        return data?.id && !error ? { id: data.id } : { error: 'provider_rejected' };
      },
      async finish(job, providerId, errorCode) {
        const { data, error } = await client.rpc('finish_notification_job', { p_job_id: job.id, p_lease_token: job.lease_token, p_provider_id: providerId, p_error_code: errorCode });
        if (error) throw new Error('ack_failed');
        return data === true;
      },
    });
    console.log('notification_batch', result); // Solo contadores: sin correos, tokens ni cuerpos.
    return Response.json(result, { status: result.unresolved ? 503 : 200 });
  } catch {
    console.error('notification_processor_unavailable');
    return new Response('Temporarily unavailable', { status: 503 });
  }
});
