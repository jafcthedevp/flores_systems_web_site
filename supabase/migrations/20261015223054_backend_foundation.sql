-- Flujo imperativo. Versión sincronizada con el historial de migraciones MCP.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from public, anon, authenticated;
grant select on public.admin_users to authenticated;
grant all on public.admin_users to service_role;
create policy admin_self_read on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  reference uuid not null unique default gen_random_uuid(),
  idempotency_key uuid not null unique,
  fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
  contact_name text not null check (length(btrim(contact_name)) between 1 and 80),
  business_name text not null check (length(btrim(business_name)) between 1 and 120),
  business_type text not null check (business_type in ('veterinaria','restaurante','tienda_bodega','mercado_puesto','spa','colegio','ropa','otro')),
  service text not null check (service in ('sitio_web','sistema_administrativo','ambos','orientacion')),
  description text not null check (length(btrim(description)) between 10 and 2000),
  email text check (length(email) <= 254 and email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  preferred_channel text not null check (preferred_channel in ('correo','whatsapp')),
  budget text check (budget in ('menos_1000','1000_3000','3000_6000','mas_6000','por_definir')),
  timeframe text check (timeframe in ('urgente','1_3_meses','3_6_meses','por_definir')),
  consent_version text,
  consent_at timestamptz,
  source text not null default 'formulario_web' check (source in ('formulario_web','whatsapp','correo','prospeccion','otro')),
  status text not null default 'nuevo' check (status in ('nuevo','en_conversacion','cotizado','cerrado')),
  follow_up_at timestamptz,
  quoted_amount numeric(12,2) check (quoted_amount >= 0),
  currency text not null default 'PEN' check (currency = 'PEN'),
  quoted_at timestamptz,
  outcome text check (outcome in ('ganado','perdido','desistido')),
  close_reason text check (length(close_reason) <= 1000),
  version integer not null default 1 check (version > 0),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (email is not null or phone is not null),
  check ((preferred_channel = 'correo' and email is not null) or (preferred_channel = 'whatsapp' and phone is not null)),
  check (source <> 'formulario_web' or (consent_version is not null and consent_at is not null)),
  check ((status = 'cerrado' and outcome is not null) or (status <> 'cerrado' and outcome is null and close_reason is null)),
  check (status <> 'cotizado' or quoted_at is not null)
);
create index quote_created_idx on public.quote_requests(created_at desc, id desc);
create index quote_status_created_idx on public.quote_requests(status, created_at desc, id desc);
create index quote_source_created_idx on public.quote_requests(source, created_at desc, id desc);
create index quote_follow_up_idx on public.quote_requests(follow_up_at) where status <> 'cerrado' and follow_up_at is not null;
create index quote_author_idx on public.quote_requests(created_by) where created_by is not null;

create table public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.quote_requests(id),
  channel text not null default 'email' check (channel = 'email'),
  recipient text not null check (length(recipient) <= 254 and recipient ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 20000),
  status text not null default 'pending' check (status in ('pending','processing','accepted','exhausted')),
  attempts integer not null default 0 check (attempts between 0 and 5),
  next_attempt_at timestamptz not null default now(),
  locked_until timestamptz,
  lease_token uuid,
  first_attempt_at timestamptz,
  provider_id text,
  last_error_code text check (length(last_error_code) <= 100),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(request_id, channel, recipient),
  check ((status = 'processing') = (locked_until is not null and lease_token is not null)),
  check (status <> 'accepted' or (provider_id is not null and sent_at is not null))
);
create index jobs_due_idx on public.notification_jobs(next_attempt_at, created_at) where status in ('pending','processing');

create table public.request_notes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.quote_requests(id),
  body text not null check (length(btrim(body)) between 1 and 4000),
  author_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
create index notes_request_idx on public.request_notes(request_id, created_at);
create index notes_author_idx on public.request_notes(author_id);
create table public.request_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.quote_requests(id),
  old_status text,
  new_status text not null,
  old_outcome text,
  new_outcome text,
  close_reason text,
  author_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index history_request_idx on public.request_status_history(request_id, created_at);
create index history_author_idx on public.request_status_history(author_id) where author_id is not null;

create table private.rate_limits (
  key text not null check (key ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  hits integer not null check (hits > 0),
  primary key (key, window_start)
);
alter table private.rate_limits enable row level security;
grant all on private.rate_limits to service_role;

alter table public.quote_requests enable row level security;
alter table public.notification_jobs enable row level security;
alter table public.request_notes enable row level security;
alter table public.request_status_history enable row level security;
revoke all on public.quote_requests, public.notification_jobs, public.request_notes, public.request_status_history from public, anon, authenticated;
grant all on public.quote_requests, public.notification_jobs, public.request_notes, public.request_status_history to service_role;
grant select on public.quote_requests, public.notification_jobs, public.request_notes, public.request_status_history to authenticated;
grant insert on public.quote_requests, public.request_notes to authenticated;
grant update (status, follow_up_at, quoted_amount, quoted_at, outcome, close_reason) on public.quote_requests to authenticated;

create policy requests_admin_read on public.quote_requests for select to authenticated
  using ((select exists(select 1 from public.admin_users where user_id = (select auth.uid()))));
create policy requests_admin_insert on public.quote_requests for insert to authenticated
  with check (source <> 'formulario_web' and created_by = (select auth.uid()) and status = 'nuevo' and (select exists(select 1 from public.admin_users where user_id = (select auth.uid()))));
create policy requests_admin_update on public.quote_requests for update to authenticated
  using ((select exists(select 1 from public.admin_users where user_id = (select auth.uid()))))
  with check ((select exists(select 1 from public.admin_users where user_id = (select auth.uid()))));
create policy jobs_admin_read on public.notification_jobs for select to authenticated
  using ((select exists(select 1 from public.admin_users where user_id = (select auth.uid()))));
create policy notes_admin_read on public.request_notes for select to authenticated
  using ((select exists(select 1 from public.admin_users where user_id = (select auth.uid()))));
create policy notes_admin_insert on public.request_notes for insert to authenticated
  with check (author_id = (select auth.uid()) and (select exists(select 1 from public.admin_users where user_id = (select auth.uid()))));
create policy history_admin_read on public.request_status_history for select to authenticated
  using ((select exists(select 1 from public.admin_users where user_id = (select auth.uid()))));

create function private.touch_quote() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := now(); new.version := old.version + 1;
  return new;
end; $$;
create trigger quote_touch before update on public.quote_requests for each row execute function private.touch_quote();

-- Único SECURITY DEFINER de auditoría: solo se activa desde DML autorizado sobre solicitudes.
-- No se concede INSERT de historial al administrador; notas/historial son inmutables.
create function private.audit_quote() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is not null and not exists(select 1 from public.admin_users where user_id = auth.uid()) then
    raise exception 'UNAUTHORIZED' using errcode = '42501';
  end if;
  if tg_op = 'INSERT' then
    insert into public.request_status_history(request_id,new_status,new_outcome,close_reason,author_id)
      values(new.id,new.status,new.outcome,new.close_reason,auth.uid());
  elsif old.status is distinct from new.status or old.outcome is distinct from new.outcome or old.close_reason is distinct from new.close_reason then
    insert into public.request_status_history(request_id,old_status,new_status,old_outcome,new_outcome,close_reason,author_id)
      values(new.id,old.status,new.status,old.outcome,new.outcome,new.close_reason,auth.uid());
  end if;
  return new;
end; $$;
create trigger quote_audit after insert or update on public.quote_requests for each row execute function private.audit_quote();
revoke all on function private.audit_quote(), private.touch_quote() from public, anon, authenticated, service_role;

create function public.submit_quote_request(p_input jsonb, p_fingerprint text, p_rate_key text, p_recipient text, p_payload jsonb)
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
  insert into public.quote_requests(idempotency_key,fingerprint,contact_name,business_name,business_type,service,description,email,phone,preferred_channel,budget,timeframe,consent_version,consent_at)
    values((p_input->>'idempotency_key')::uuid,p_fingerprint,p_input->>'contact_name',p_input->>'business_name',p_input->>'business_type',p_input->>'service',p_input->>'description',p_input->>'email',p_input->>'phone',p_input->>'preferred_channel',p_input->>'budget',p_input->>'timeframe',p_input->>'consent_version',now())
    returning * into request;
  insert into public.notification_jobs(request_id,recipient,payload) values(request.id,p_recipient,p_payload);
  return jsonb_build_object('code','created','reference',request.reference);
end; $$;

create function public.update_quote_request(p_input jsonb) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare changed public.quote_requests;
begin
  if not exists(select 1 from public.admin_users where user_id = auth.uid()) then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  update public.quote_requests set status = p_input->>'status', follow_up_at = (p_input->>'follow_up_at')::timestamptz,
    quoted_amount = (p_input->>'quoted_amount')::numeric, quoted_at = (p_input->>'quoted_at')::timestamptz,
    outcome = p_input->>'outcome', close_reason = p_input->>'close_reason'
    where id = (p_input->>'id')::uuid and version = (p_input->>'version')::integer returning * into changed;
  if not found then raise exception 'STALE_VERSION' using errcode = '40001'; end if;
  return jsonb_build_object('id',changed.id,'version',changed.version);
end; $$;

create function public.create_manual_request(p_input jsonb) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare request public.quote_requests;
begin
  if not exists(select 1 from public.admin_users where user_id = auth.uid()) then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  insert into public.quote_requests(idempotency_key,fingerprint,contact_name,business_name,business_type,service,description,email,phone,preferred_channel,budget,timeframe,source,created_by)
    values(gen_random_uuid(),repeat('0',64),p_input->>'contact_name',p_input->>'business_name',p_input->>'business_type',p_input->>'service',p_input->>'description',p_input->>'email',p_input->>'phone',p_input->>'preferred_channel',p_input->>'budget',p_input->>'timeframe',p_input->>'source',auth.uid()) returning * into request;
  return jsonb_build_object('id',request.id,'reference',request.reference);
end; $$;
create function public.add_request_note(p_request_id uuid, p_body text) returns uuid language plpgsql security invoker set search_path = '' as $$
declare note_id uuid;
begin
  insert into public.request_notes(request_id,body) values(p_request_id,btrim(p_body)) returning id into note_id;
  return note_id;
end; $$;
create function public.crm_counters() returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('nuevo',count(*) filter(where status = 'nuevo'),'en_conversacion',count(*) filter(where status = 'en_conversacion'),
    'cotizado',count(*) filter(where status = 'cotizado'),'cerrado',count(*) filter(where status = 'cerrado'),
    'seguimientos_pendientes',count(*) filter(where status <> 'cerrado' and follow_up_at <= now())) from public.quote_requests;
$$;

create function public.claim_notification_jobs(p_limit integer default 10)
returns setof public.notification_jobs language plpgsql security invoker set search_path = '' as $$
begin
  update public.notification_jobs set status = 'exhausted', lease_token = null, locked_until = null, last_error_code = 'retry_window_exhausted'
    where status in ('pending','processing') and (locked_until is null or locked_until < now())
      and (attempts >= 5 or first_attempt_at < now() - interval '20 hours');
  return query with due as (
    select id from public.notification_jobs where status in ('pending','processing') and next_attempt_at <= now()
      and (locked_until is null or locked_until < now()) and attempts < 5
      order by next_attempt_at, created_at limit greatest(1,least(p_limit,10)) for update skip locked
  ) update public.notification_jobs j set status = 'processing', attempts = attempts + 1,
    lease_token = gen_random_uuid(), locked_until = now() + interval '3 minutes', first_attempt_at = coalesce(first_attempt_at,now())
    from due where j.id = due.id returning j.*;
end; $$;

create function public.finish_notification_job(p_job_id uuid,p_lease_token uuid,p_provider_id text default null,p_error_code text default null)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.notification_jobs set
    status = case when p_provider_id is not null then 'accepted' when attempts >= 5 or first_attempt_at < now() - interval '20 hours' then 'exhausted' else 'pending' end,
    next_attempt_at = now() + make_interval(secs => least(3600,(60 * power(3,attempts - 1))::integer)),
    provider_id = p_provider_id, sent_at = case when p_provider_id is not null then now() end,
    last_error_code = case when p_provider_id is not null then null else left(coalesce(p_error_code,'provider_unavailable'),100) end,
    lease_token = null, locked_until = null
    where id = p_job_id and status = 'processing' and lease_token = p_lease_token and locked_until > now();
  return found;
end; $$;

-- Elevación acotada: administradores solo pueden reencolar un aviso agotado dentro de la ventana segura.
create function public.retry_notification(p_job_id uuid) returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  if not exists(select 1 from public.admin_users where user_id = auth.uid()) then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  return private.retry_notification_authorized(p_job_id);
end; $$;
create function private.retry_notification_authorized(p_job_id uuid) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.admin_users where user_id = auth.uid()) then raise exception 'UNAUTHORIZED' using errcode = '42501'; end if;
  update public.notification_jobs set status = 'pending',attempts = 0,next_attempt_at = now(),last_error_code = null
    where id = p_job_id and status = 'exhausted' and first_attempt_at > now() - interval '20 hours';
  if not found then raise exception 'RECONCILE_PROVIDER_OR_INVALID_STATE' using errcode = '22023'; end if;
  return true;
end; $$;
grant usage on schema private to authenticated;
revoke all on function private.retry_notification_authorized(uuid) from public, anon, service_role;
grant execute on function private.retry_notification_authorized(uuid) to authenticated;

revoke all on function public.submit_quote_request(jsonb,text,text,text,jsonb),public.claim_notification_jobs(integer),public.finish_notification_job(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.submit_quote_request(jsonb,text,text,text,jsonb),public.claim_notification_jobs(integer),public.finish_notification_job(uuid,uuid,text,text) to service_role;
revoke all on function public.update_quote_request(jsonb),public.create_manual_request(jsonb),public.add_request_note(uuid,text),public.crm_counters(),public.retry_notification(uuid) from public, anon;
grant execute on function public.update_quote_request(jsonb),public.create_manual_request(jsonb),public.add_request_note(uuid,text),public.crm_counters(),public.retry_notification(uuid) to authenticated;

comment on table public.quote_requests is 'Oportunidades privadas; recepción pública solo por RPC de service_role. Moneda PEN, fechas UTC.';
comment on table public.notification_jobs is 'Aceptado significa aceptado por Resend, no entregado. Payload inmutable para idempotencia de 24h; corte automático a 20h.';
