-- Add optional topic labels so student progress can identify weak subject areas.
alter table public.quiz_questions
  add column if not exists topic text;

create index if not exists quiz_questions_quiz_topic_idx
  on public.quiz_questions (quiz_id, topic);
