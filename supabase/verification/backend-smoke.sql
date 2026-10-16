-- Verificación remota reversible. No envía correos ni conserva solicitudes.
begin;
select set_config('request.jwt.claim.sub','',true);
select set_config('request.jwt.claims','{"role":"service_role"}',true);
set local role service_role;
do $$
declare
  input jsonb := jsonb_build_object('id',gen_random_uuid(),'reference',gen_random_uuid(),'idempotency_key',gen_random_uuid(),'contact_name','Verificación backend','business_name','Negocio de prueba','business_type','otro','service','orientacion','description','Verificación transaccional del backend','email','test@example.invalid','preferred_channel','correo','consent_version','2026-10-15');
  payload jsonb := '{"from":"test@example.invalid","to":["admin@example.invalid"],"subject":"Prueba reversible","html":"<p>Prueba</p>"}';
  first_receipt jsonb; second_receipt jsonb; request_count integer;
begin
  first_receipt := public.submit_quote_request(input,repeat('a',64),repeat('b',64),'admin@example.invalid',payload);
  if first_receipt->>'code' <> 'created' then raise exception 'CREATE_FAILED'; end if;
  if first_receipt->>'reference' <> input->>'reference' or not exists(select 1 from public.quote_requests where id = (input->>'id')::uuid and reference = (input->>'reference')::uuid) then raise exception 'REFERENCE_MAPPING_FAILED'; end if;
  second_receipt := public.submit_quote_request(input,repeat('a',64),repeat('b',64),'admin@example.invalid',payload);
  if second_receipt->>'code' <> 'replayed' or second_receipt->>'reference' <> first_receipt->>'reference' then raise exception 'IDEMPOTENCY_FAILED'; end if;
  second_receipt := public.submit_quote_request(input,repeat('c',64),repeat('b',64),'admin@example.invalid',payload);
  if second_receipt->>'code' <> 'conflict' then raise exception 'CONFLICT_FAILED'; end if;
  select count(*) into request_count from public.quote_requests;
  begin
    perform public.submit_quote_request((input - 'id' - 'reference') || jsonb_build_object('idempotency_key',gen_random_uuid()),repeat('a',64),repeat('d',64),'invalid','{"from":"test@example.invalid","to":["invalid"]}');
    raise exception 'CONSTRAINT_NOT_ENFORCED';
  exception when check_violation then null;
  end;
  if (select count(*) from public.quote_requests) <> request_count then raise exception 'ATOMIC_ROLLBACK_FAILED'; end if;
  if (select count(*) from public.notification_jobs where request_id = (input->>'id')::uuid) <> 1 then raise exception 'QUEUE_ATOMICITY_FAILED'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','b0000000-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"b0000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.quote_requests) or exists(select 1 from public.notification_jobs) then raise exception 'RLS_LEAK'; end if;
  begin perform public.update_quote_request('{}'); raise exception 'AUTHORIZATION_NOT_ENFORCED'; exception when insufficient_privilege then null; end;
  begin perform public.claim_notification_jobs(1); raise exception 'QUEUE_GRANT_NOT_ENFORCED'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin perform 1 from public.quote_requests; raise exception 'ANON_READ_NOT_BLOCKED'; exception when insufficient_privilege then null; end;
  begin perform public.submit_quote_request('{}',repeat('a',64),repeat('b',64),'admin@example.invalid','{}'); raise exception 'ANON_WRITE_NOT_BLOCKED'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'ok: atomicity, idempotency, conflict, RLS, anonymous access; transaction rolled back' as verification;
