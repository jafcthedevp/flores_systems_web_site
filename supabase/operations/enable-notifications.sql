-- Ejecutar solo después de configurar la Edge Function y guardar en Vault el
-- MISMO secreto privado NOTIFICATION_CRON_SECRET, nombre flores_notification_cron_secret.
-- No pegar secretos en este archivo ni en una migración versionada.
begin;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
do $$ begin
  if not exists(select 1 from vault.decrypted_secrets where name = 'flores_notification_cron_secret' and length(decrypted_secret) >= 32) then
    raise exception 'Configura primero flores_notification_cron_secret en Vault';
  end if;
end $$;
select cron.schedule('flores-send-notifications', '* * * * *', $job$
  select net.http_post(
    url := 'https://shonvjevhinvllfjndbq.supabase.co/functions/v1/send-notifications',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'flores_notification_cron_secret')),
    body := '{}'::jsonb, timeout_milliseconds := 10000
  );
$job$);
select cron.schedule('flores-clean-operational-logs', '15 8 * * *', $job$
  delete from private.rate_limits where window_start < now() - interval '2 days';
  delete from cron.job_run_details where end_time < now() - interval '7 days'
    and jobid in (select jobid from cron.job where jobname like 'flores-%');
$job$);
commit;
