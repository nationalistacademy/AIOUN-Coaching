alter table public.quiz_attempts
  add column if not exists max_score numeric,
  add column if not exists percentage numeric;

update public.quiz_attempts a
set max_score = totals.max_score,
    percentage = case when totals.max_score > 0 then round((a.score / totals.max_score) * 100, 2) else null end
from (
  select q.id as quiz_id, coalesce(sum(qq.points), 0)::numeric as max_score
  from public.quizzes q
  left join public.quiz_questions qq on qq.quiz_id = q.id
  group by q.id
) totals
where totals.quiz_id = a.quiz_id and a.max_score is null;

create index if not exists quiz_attempts_student_quiz_submitted_idx
  on public.quiz_attempts (student_id, quiz_id, submitted_at desc);

create or replace function private.submit_quiz_attempt(p_quiz_id uuid, p_answers jsonb)
returns table(attempt_id uuid, score numeric, max_score numeric, percentage numeric)
language plpgsql
security definer
set search_path to 'pg_catalog', 'public', 'private'
as $function$
declare
  v_user_id uuid := auth.uid();
  v_attempt_id uuid;
  v_score numeric := 0;
  v_max numeric := 0;
  v_answer jsonb;
  v_question_id uuid;
  v_answer_value jsonb;
  v_correct jsonb;
  v_points numeric;
  v_is_correct boolean;
  v_seen_questions uuid[] := array[]::uuid[];
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_quiz_id is null or jsonb_typeof(coalesce(p_answers, '[]'::jsonb)) <> 'array' then
    raise exception 'Invalid quiz submission';
  end if;
  if not exists (
    select 1 from public.quizzes q
    join public.courses c on c.id=q.course_id
    join public.enrollments e on e.course_id=q.course_id
    where q.id=p_quiz_id and q.published=true and c.published=true
      and e.student_id=v_user_id and e.status='active'
  ) then raise exception 'Quiz is not available for this student'; end if;
  select coalesce(sum(q.points),0) into v_max from public.quiz_questions q where q.quiz_id=p_quiz_id;
  if v_max <= 0 then raise exception 'Quiz has no scorable questions'; end if;
  insert into public.quiz_attempts(quiz_id,student_id,score,max_score,percentage,submitted_at)
  values(p_quiz_id,v_user_id,0,v_max,0,now()) returning id into v_attempt_id;
  for v_answer in select value from jsonb_array_elements(coalesce(p_answers,'[]'::jsonb)) loop
    begin v_question_id := (v_answer->>'question_id')::uuid;
    exception when others then raise exception 'Invalid question id'; end;
    if v_question_id = any(v_seen_questions) then raise exception 'Duplicate answer for a question'; end if;
    v_seen_questions := array_append(v_seen_questions,v_question_id);
    v_answer_value := v_answer->'answer';
    select q.points,k.correct_answer into v_points,v_correct
      from public.quiz_questions q join private.quiz_question_keys k on k.question_id=q.id
      where q.id=v_question_id and q.quiz_id=p_quiz_id;
    if not found then raise exception 'Question does not belong to this quiz or has no answer key'; end if;
    v_is_correct := v_answer_value = v_correct;
    if v_is_correct then v_score := v_score + v_points; end if;
    insert into public.quiz_answers(attempt_id,question_id,answer,is_correct,points_awarded)
    values(v_attempt_id,v_question_id,v_answer_value,v_is_correct,case when v_is_correct then v_points else 0 end);
  end loop;
  update public.quiz_attempts
    set score=v_score, max_score=v_max, percentage=round((v_score/v_max)*100,2)
    where id=v_attempt_id and student_id=v_user_id;
  attempt_id:=v_attempt_id; score:=v_score; max_score:=v_max;
  percentage:=round((v_score/v_max)*100,2); return next;
end;
$function$;

revoke all on function private.submit_quiz_attempt(uuid,jsonb) from public, anon, authenticated;
grant execute on function private.submit_quiz_attempt(uuid,jsonb) to authenticated;
