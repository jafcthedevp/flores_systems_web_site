-- Ejecutar con rol administrativo. No devuelve nombres, teléfonos ni correos.
select status, count(*) from public.notification_jobs group by status;
select count(*) as abandoned_jobs from public.notification_jobs where status = 'processing' and locked_until < now();
select count(*) as pending_over_two_minutes from public.notification_jobs where status = 'pending' and created_at < now() - interval '2 minutes';
-- Estas consultas requieren Cron/pg_net activados.
select status, return_message, start_time from cron.job_run_details
  where status = 'failed' and jobid in (select jobid from cron.job where jobname like 'flores-%')
  order by start_time desc limit 20;
-- Cron puede finalizar bien aunque el HTTP asíncrono falle: revisar también pg_net.
select status_code, count(*) as failed_http_requests from net._http_response
  where status_code >= 400 or timed_out or error_msg is not null group by status_code;
