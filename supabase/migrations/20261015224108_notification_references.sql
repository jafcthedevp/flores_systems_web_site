-- Versión sincronizada con MCP. Referencia y enlace del correo asignados en servidor.
create or replace function public.submit_quote_request(p_input jsonb, p_fingerprint text, p_rate_key text, p_recipient text, p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare existing public.quote_requests; request public.quote_requests; window_at timestamptz; hits_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_input->>'idempotency_key',0));
  select * into existing from public.quote_requests where idempotency_key = (p_input->>'idempotency_key')::uuid;
  if found then
    if existing.fingerprint <> p_fingerprint then return jsonb_build_object('code','conflict'); end if;
    return jsonb_build_object('code','replayed','reference',existing.reference);
  end if;
  if p_payload->'to' is distinct from jsonb_build_array(p_recipient) or coalesce(length(p_payload->>'from'),0) = 0 then
    raise exception 'INVALID_NOTIFICATION';
  end if;
  window_at := date_bin(interval '15 minutes', now(), timestamptz '2000-01-01 00:00:00+00');
  insert into private.rate_limits(key,window_start,hits) values(p_rate_key,window_at,1)
    on conflict(key,window_start) do update set hits = least(private.rate_limits.hits + 1,6)
    returning hits into hits_count;
  if hits_count > 5 then
    return jsonb_build_object('code','rate_limited','retry_after',ceil(extract(epoch from window_at + interval '15 minutes' - now()))::integer);
  end if;
  insert into public.quote_requests(id,reference,idempotency_key,fingerprint,contact_name,business_name,business_type,service,description,email,phone,preferred_channel,budget,timeframe,consent_version,consent_at)
    values(coalesce((p_input->>'id')::uuid,gen_random_uuid()),coalesce((p_input->>'reference')::uuid,gen_random_uuid()),(p_input->>'idempotency_key')::uuid,p_fingerprint,p_input->>'contact_name',p_input->>'business_name',p_input->>'business_type',p_input->>'service',p_input->>'description',p_input->>'email',p_input->>'phone',p_input->>'preferred_channel',p_input->>'budget',p_input->>'timeframe',p_input->>'consent_version',now())
    returning * into request;
  insert into public.notification_jobs(request_id,recipient,payload) values(request.id,p_recipient,p_payload);
  return jsonb_build_object('code','created','reference',request.reference);
end; $$;
