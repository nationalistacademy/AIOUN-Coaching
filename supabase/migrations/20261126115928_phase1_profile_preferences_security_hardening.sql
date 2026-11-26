-- AIOU Coaching Phase 1: profile preferences, least-privilege access,
-- question-bank answer-key protection, RLS plan caching, and FK indexes.
-- Applied to project tjfqkawhojobdartjoki on 2026-11-26.
-- Idempotent so it can also be replayed by a future environment.

begin;

alter table public.profiles
  add column if not exists theme text not null default 'Orangutan Orange',
  add column if not exists notify_email boolean not null default true,
  add column if not exists notify_sms boolean not null default true,
  add column if not exists notify_app boolean not null default true;

alter table public.profiles drop constraint if exists profiles_theme_check;
alter table public.profiles
  add constraint profiles_theme_check
  check (theme = any (array[
    'Orangutan Orange', 'Colorate Gray', 'Patina Green',
    'Brown Boots', 'Cyan Blue', 'AIOU Blue'
  ]));

revoke all on table public.profiles from anon;
revoke insert, delete, truncate, references, trigger on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
revoke update on table public.profiles from authenticated;
grant update (
  full_name, programme, phone_number, postal_address,
  guardian_name, guardian_phone, guardian_relation, nic_number,
  avatar_path, theme, notify_email, notify_sms, notify_app, updated_at
) on table public.profiles to authenticated;

drop policy if exists questions_read_published on public.question_bank;
create policy questions_read_published
  on public.question_bank
  for select to authenticated
  using (is_published = true or (select private.is_admin()));

revoke select on table public.question_bank from anon, authenticated;
grant select (
  id, course_code, question, options, difficulty, source_url,
  is_published, created_at
) on table public.question_bank to authenticated;

drop policy if exists profiles_read_self_or_admin on public.profiles;
create policy profiles_read_self_or_admin on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists profiles_update_self_or_admin on public.profiles;
create policy profiles_update_self_or_admin on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (
    (id = (select auth.uid()) and role = 'student')
    or (select private.is_admin())
  );

drop policy if exists semesters_owner_all on public.semesters;
create policy semesters_owner_all on public.semesters
  for all to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()))
  with check (user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists records_owner_all on public.academic_records;
create policy records_owner_all on public.academic_records
  for all to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()))
  with check (user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists plans_owner_all on public.study_plans;
create policy plans_owner_all on public.study_plans
  for all to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()))
  with check (user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists attendance_owner_all on public.attendance_logs;
create policy attendance_owner_all on public.attendance_logs
  for all to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()))
  with check (user_id = (select auth.uid()) or (select private.is_admin()));

drop policy if exists submissions_owner_all on public.assignment_submissions;
create policy submissions_owner_all on public.assignment_submissions
  for all to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()))
  with check (user_id = (select auth.uid()) or (select private.is_admin()));

create index if not exists academic_records_semester_id_idx on public.academic_records(semester_id);
create index if not exists assignment_submissions_user_id_idx on public.assignment_submissions(user_id);
create index if not exists attendance_logs_user_id_idx on public.attendance_logs(user_id);
create index if not exists study_plans_user_id_idx on public.study_plans(user_id);

commit;
