-- LMS security hardening: keep enrollment grants and quiz records server-controlled.

-- These helpers only need the caller's JWT and caller-visible enrollment rows.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $function$
  select coalesce(((select auth.jwt()) -> 'app_metadata' ->> 'role') in ('admin','teacher'), false);
$function$;

create or replace function public.is_enrolled(p_course_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $function$
  select exists (
    select 1
    from public.enrollments e
    where e.course_id = p_course_id
      and e.student_id = (select auth.uid())
      and e.status = 'active'
  );
$function$;

-- Only staff can create or change enrollment state.
drop policy if exists enrollments_own_insert on public.enrollments;
drop policy if exists enrollments_own_update on public.enrollments;
drop policy if exists enrollments_admin_insert on public.enrollments;
drop policy if exists enrollments_admin_update on public.enrollments;

create policy enrollments_admin_insert
on public.enrollments
for insert to authenticated
with check (public.is_admin());

create policy enrollments_admin_update
on public.enrollments
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Quiz attempts and answers are written only by the server-side grading RPC.
drop policy if exists attempts_own_insert on public.quiz_attempts;
drop policy if exists answers_own_insert on public.quiz_answers;

revoke insert on table public.quiz_attempts from authenticated;
revoke insert (quiz_id, student_id, submitted_at) on table public.quiz_attempts from authenticated;
revoke insert on table public.quiz_answers from authenticated;
revoke insert (attempt_id, question_id, answer) on table public.quiz_answers from authenticated;

-- Authenticated public RPC; internal grading routine remains in private schema.
create or replace function public.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns table(attempt_id uuid, score numeric, max_score numeric, percentage numeric)
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $function$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  return query select * from private.submit_quiz_attempt(p_quiz_id, p_answers);
end;
$function$;

grant usage on schema private to authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke execute on function public.is_enrolled(uuid) from public, anon;
grant execute on function public.is_enrolled(uuid) to authenticated;
revoke execute on function public.submit_quiz_attempt(uuid, jsonb) from public, anon;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;

-- Correct answers remain inaccessible to API roles; the grading routine owner retains access.
revoke all on table private.quiz_question_keys from public, anon, authenticated;
