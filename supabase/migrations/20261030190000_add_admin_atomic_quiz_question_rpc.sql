create or replace function public.create_quiz_question_with_key(
  p_quiz_id uuid,
  p_question text,
  p_options jsonb,
  p_correct_answer text,
  p_points integer default 1
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_question_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not coalesce(public.is_admin(), false) then
    raise exception 'Administrator or teacher access required' using errcode = '42501';
  end if;

  if p_quiz_id is null
     or nullif(btrim(p_question), '') is null
     or p_options is null
     or jsonb_typeof(p_options) <> 'array'
     or jsonb_array_length(p_options) < 2
     or nullif(btrim(p_correct_answer), '') is null
     or not (p_options @> jsonb_build_array(p_correct_answer))
     or coalesce(p_points, 0) < 1 then
    raise exception 'Invalid quiz question or answer options' using errcode = '22023';
  end if;

  if not exists (select 1 from public.quizzes q where q.id = p_quiz_id) then
    raise exception 'Quiz not found' using errcode = '23503';
  end if;

  insert into public.quiz_questions (quiz_id, question, options, points)
  values (p_quiz_id, btrim(p_question), p_options, p_points)
  returning id into v_question_id;

  insert into private.quiz_question_keys (question_id, correct_answer)
  values (v_question_id, to_jsonb(p_correct_answer));

  return v_question_id;
end;
$function$;

revoke all on function public.create_quiz_question_with_key(uuid, text, jsonb, text, integer) from public;
revoke all on function public.create_quiz_question_with_key(uuid, text, jsonb, text, integer) from anon;
revoke all on function public.create_quiz_question_with_key(uuid, text, jsonb, text, integer) from authenticated;
grant execute on function public.create_quiz_question_with_key(uuid, text, jsonb, text, integer) to authenticated;
