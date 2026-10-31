-- Starter original MCQs for three verified AIOU BBA subjects.
-- Answer keys remain in the private schema and are never exposed to students.
alter table public.quiz_questions add column if not exists topic text;
create index if not exists quiz_questions_quiz_topic_idx on public.quiz_questions (quiz_id, topic);

do $seed$
declare
  c record;
  v_quiz_id uuid;
  v_question_id uuid;
  item record;
begin
  for c in
    select id, slug, title from public.courses
    where slug in (
      'aiou-bba-functional-english-9382',
      'aiou-bba-financial-accounting-5418',
      'aiou-bba-fundamentals-business-5402'
    )
  loop
    select id into v_quiz_id from public.quizzes
    where course_id = c.id and title = 'Starter MCQ Practice' limit 1;

    if v_quiz_id is null then
      insert into public.quizzes(course_id,title,description,published)
      values(c.id,'Starter MCQ Practice','Original starter questions for practice. Review the official course book for complete coverage.',true)
      returning id into v_quiz_id;
    end if;

    if exists(select 1 from public.quiz_questions where quiz_id = v_quiz_id) then
      v_quiz_id := null;
      continue;
    end if;

    if c.slug = 'aiou-bba-functional-english-9382' then
      for item in select * from (values
        ('Which sentence has correct subject–verb agreement?','["The students studies daily.","The students study daily.","The students studying daily.","The students has study daily."]'::jsonb,'The students study daily.','Grammar'),
        ('Choose the closest meaning of “concise”.','["Unclear","Brief and clear","Very emotional","Repeated"]'::jsonb,'Brief and clear','Vocabulary'),
        ('Which is the best topic sentence for a paragraph about time management?','["I bought a new notebook yesterday.","Time management helps students use study hours effectively.","Some clocks are digital.","My friend likes tea."]'::jsonb,'Time management helps students use study hours effectively.','Academic Writing'),
        ('Which punctuation mark normally ends a direct question?','["Comma","Colon","Question mark","Semicolon"]'::jsonb,'Question mark','Punctuation'),
        ('In formal email, which opening is most appropriate when the recipient’s name is unknown?','["Hey buddy,","Dear Sir or Madam,","Yo!","What’s up"]'::jsonb,'Dear Sir or Madam,','Professional Communication')
      ) as t(question,options,answer,topic)
      loop
        insert into public.quiz_questions(quiz_id,question,options,points,sort_order,topic)
        values(v_quiz_id,item.question,item.options,1,(select count(*) from public.quiz_questions where quiz_id=v_quiz_id),item.topic)
        returning id into v_question_id;
        insert into private.quiz_question_keys(question_id,correct_answer)
        values(v_question_id,to_jsonb(item.answer::text));
      end loop;

    elsif c.slug = 'aiou-bba-financial-accounting-5418' then
      for item in select * from (values
        ('Which financial statement reports assets, liabilities, and equity at a point in time?','["Income statement","Statement of financial position","Cash budget","Sales journal"]'::jsonb,'Statement of financial position','Financial Statements'),
        ('The basic accounting equation is:','["Assets = Liabilities + Equity","Assets = Revenue − Expenses","Equity = Assets + Liabilities","Liabilities = Assets + Revenue"]'::jsonb,'Assets = Liabilities + Equity','Accounting Equation'),
        ('Under accrual accounting, revenue is generally recorded when it is:','["Always received in cash","Earned, subject to applicable recognition rules","Budgeted","Paid to suppliers"]'::jsonb,'Earned, subject to applicable recognition rules','Accrual Accounting'),
        ('A business purchases equipment for cash. Which is the usual immediate effect?','["Equipment increases and cash decreases","Equipment and liabilities both increase","Revenue increases","Owner equity automatically increases"]'::jsonb,'Equipment increases and cash decreases','Double-Entry Effects'),
        ('Which account normally carries a debit balance?','["Accounts payable","Service revenue","Cash","Owner capital"]'::jsonb,'Cash','Ledger Accounts')
      ) as t(question,options,answer,topic)
      loop
        insert into public.quiz_questions(quiz_id,question,options,points,sort_order,topic)
        values(v_quiz_id,item.question,item.options,1,(select count(*) from public.quiz_questions where quiz_id=v_quiz_id),item.topic)
        returning id into v_question_id;
        insert into private.quiz_question_keys(question_id,correct_answer)
        values(v_question_id,to_jsonb(item.answer::text));
      end loop;

    elsif c.slug = 'aiou-bba-fundamentals-business-5402' then
      for item in select * from (values
        ('Which is a core function of a business?','["Creating and delivering value to customers","Eliminating all risk","Avoiding customer feedback","Operating without resources"]'::jsonb,'Creating and delivering value to customers','Business Fundamentals'),
        ('A stakeholder is best described as:','["Only the business owner","A person or group affected by or able to affect an organization","Only a direct competitor","A product sold by a firm"]'::jsonb,'A person or group affected by or able to affect an organization','Stakeholders'),
        ('Which example best represents entrepreneurship?','["Repeating a task without change","Identifying an opportunity and organizing resources to pursue it","Avoiding every customer need","Recording attendance only"]'::jsonb,'Identifying an opportunity and organizing resources to pursue it','Entrepreneurship'),
        ('What is the primary purpose of market research?','["To understand customers and market conditions","To guarantee every product succeeds","To remove accounting records","To replace all business planning"]'::jsonb,'To understand customers and market conditions','Market Research'),
        ('Which resource category includes employee knowledge and skills?','["Human resources","Only physical inventory","Financial liabilities","Natural disasters"]'::jsonb,'Human resources','Business Resources')
      ) as t(question,options,answer,topic)
      loop
        insert into public.quiz_questions(quiz_id,question,options,points,sort_order,topic)
        values(v_quiz_id,item.question,item.options,1,(select count(*) from public.quiz_questions where quiz_id=v_quiz_id),item.topic)
        returning id into v_question_id;
        insert into private.quiz_question_keys(question_id,correct_answer)
        values(v_question_id,to_jsonb(item.answer::text));
      end loop;
    end if;
    v_quiz_id := null;
  end loop;
end
$seed$;
