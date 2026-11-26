-- AIOU Coaching: one-time admin-issued student registration codes.
-- Apply only after review. This file is a source/migration record; it has NOT been run on live.

create schema if not exists private;
grant usage on schema private to service_role;

create table if not exists private.student_registration_codes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  code_hash text not null unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  redeemed_by uuid references auth.users(id),
  redeemed_at timestamptz,
  revoked_at timestamptz,
  constraint student_registration_code_expiry_check check (expires_at > created_at)
);

create index if not exists student_registration_codes_student_idx
  on private.student_registration_codes(student_id, created_at desc);
create index if not exists student_registration_codes_active_idx
  on private.student_registration_codes(code_hash, expires_at)
  where redeemed_at is null and revoked_at is null;

revoke all on table private.student_registration_codes from public, anon, authenticated;
grant all on table private.student_registration_codes to service_role;

create or replace function private.issue_student_registration_code(
  p_student_id uuid, p_admin_id uuid, p_expires_days integer default 7
)
returns table(code text, expires_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare v_code text; v_expiry timestamptz;
begin
  if p_admin_id is null or not exists (
    select 1 from public.profiles p where p.id = p_admin_id and p.role = 'admin'
  ) then raise exception 'admin access required' using errcode = '42501'; end if;
  if p_expires_days is null or p_expires_days < 1 or p_expires_days > 30 then
    raise exception 'expiry must be between 1 and 30 days' using errcode = '22023';
  end if;
  perform 1 from public.students s where s.id = p_student_id and s.auth_user_id is null for update;
  if not found then raise exception 'student is already linked or does not exist' using errcode = 'P0002'; end if;
  update private.student_registration_codes set revoked_at = now()
   where student_id = p_student_id and redeemed_at is null and revoked_at is null;
  v_code := 'AIOU-' || upper(encode(extensions.gen_random_bytes(16), 'hex'));
  v_expiry := now() + make_interval(days => p_expires_days);
  insert into private.student_registration_codes(student_id, code_hash, created_by, expires_at)
  values (p_student_id, encode(extensions.digest(lower(v_code), 'sha256'), 'hex'), p_admin_id, v_expiry);
  return query select v_code, v_expiry;
end;
$$;

create or replace function private.validate_student_registration_code(p_code_hash text)
returns boolean language sql security definer set search_path = ''
as $$
  select exists (
    select 1 from private.student_registration_codes c
    join public.students s on s.id = c.student_id
    where c.code_hash = p_code_hash and c.expires_at > now()
      and c.redeemed_at is null and c.revoked_at is null and s.auth_user_id is null
  );
$$;

create or replace function private.redeem_student_registration_code(
  p_code_hash text, p_user_id uuid, p_email text
)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare v_code private.student_registration_codes%rowtype; v_student_id uuid;
begin
  if p_user_id is null or nullif(trim(p_email), '') is null then
    raise exception 'verified account required' using errcode = '42501';
  end if;
  select * into v_code from private.student_registration_codes c
   where c.code_hash = p_code_hash and c.expires_at > now()
     and c.redeemed_at is null and c.revoked_at is null for update;
  if not found then raise exception 'registration code invalid, expired, or already used' using errcode = '22023'; end if;
  update public.students s set auth_user_id = p_user_id, updated_at = now()
   where s.id = v_code.student_id and s.auth_user_id is null returning s.id into v_student_id;
  if v_student_id is null then raise exception 'student record already linked' using errcode = '22023'; end if;
  update private.student_registration_codes set redeemed_by = p_user_id, redeemed_at = now() where id = v_code.id;
  update public.profiles set
    student_id = (select s.roll_no from public.students s where s.id = v_student_id),
    programme = (select s.course from public.students s where s.id = v_student_id),
    full_name = (select s.full_name from public.students s where s.id = v_student_id),
    email = lower(trim(p_email)), updated_at = now()
   where id = p_user_id;
  return v_student_id;
end;
$$;

revoke all on function private.issue_student_registration_code(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function private.validate_student_registration_code(text) from public, anon, authenticated;
revoke all on function private.redeem_student_registration_code(text, uuid, text) from public, anon, authenticated;
grant execute on function private.issue_student_registration_code(uuid, uuid, integer) to service_role;
grant execute on function private.validate_student_registration_code(text) to service_role;
grant execute on function private.redeem_student_registration_code(text, uuid, text) to service_role;
