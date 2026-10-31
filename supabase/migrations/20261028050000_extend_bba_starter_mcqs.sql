-- Extend the original starter bank to quantitative reasoning and marketing.
do $seed$
declare c record; v_quiz_id uuid; v_question_id uuid; item record;
begin
  for c in select id,slug from public.courses where slug in ('aiou-bba-quantitative-reasoning-9424','aiou-bba-principles-marketing-8407') loop
    select id into v_quiz_id from public.quizzes where course_id=c.id and title='Starter MCQ Practice' limit 1;
    if v_quiz_id is null then
      insert into public.quizzes(course_id,title,description,published)
      values(c.id,'Starter MCQ Practice','Original starter questions for practice. Review the official course book for complete coverage.',true)
      returning id into v_quiz_id;
    end if;
    if exists(select 1 from public.quiz_questions where quiz_id=v_quiz_id) then v_quiz_id:=null; continue; end if;
    if c.slug='aiou-bba-quantitative-reasoning-9424' then
      for item in select * from (values
        ('A shop reduces a Rs. 2,000 item by 15%. What is the sale price?','["Rs. 1,500","Rs. 1,650","Rs. 1,700","Rs. 1,850"]'::jsonb,'Rs. 1,700','Percentages'),
        ('If 3 notebooks cost Rs. 240, what is the cost of 5 notebooks at the same rate?','["Rs. 300","Rs. 360","Rs. 400","Rs. 450"]'::jsonb,'Rs. 400','Ratio and Proportion'),
        ('The mean of 4, 6, 8, and 10 is:','["6","7","8","9"]'::jsonb,'7','Descriptive Statistics'),
        ('Solve: 2x + 6 = 18.','["x = 4","x = 5","x = 6","x = 12"]'::jsonb,'x = 6','Algebra'),
        ('A value rises from 50 to 60. What is the percentage increase?','["10%","15%","20%","25%"]'::jsonb,'20%','Percentages')
      ) as t(question,options,answer,topic) loop
        insert into public.quiz_questions(quiz_id,question,options,points,sort_order,topic) values(v_quiz_id,item.question,item.options,1,(select count(*) from public.quiz_questions where quiz_id=v_quiz_id),item.topic) returning id into v_question_id;
        insert into private.quiz_question_keys(question_id,correct_answer) values(v_question_id,to_jsonb(item.answer::text));
      end loop;
    elsif c.slug='aiou-bba-principles-marketing-8407' then
      for item in select * from (values
        ('The traditional marketing mix is commonly described as:','["2 Ps","3 Ps","4 Ps","7 Cs"]'::jsonb,'4 Ps','Marketing Mix'),
        ('Which of the following is one of the traditional 4 Ps?','["Product","Payroll","Policy","Productivity only"]'::jsonb,'Product','Marketing Mix'),
        ('Market segmentation means:','["Dividing a market into groups with similar needs or characteristics","Selling one product to everyone without research","Removing all product choices","Setting accounting standards"]'::jsonb,'Dividing a market into groups with similar needs or characteristics','Segmentation'),
        ('A target market is:','["Every person in a country","The customer group a firm chooses to serve","Only the firm’s employees","A company’s suppliers only"]'::jsonb,'The customer group a firm chooses to serve','Targeting'),
        ('Which activity is primarily used to learn about customer needs before launching a product?','["Market research","Depreciation","Bank reconciliation","Inventory write-off"]'::jsonb,'Market research','Market Research')
      ) as t(question,options,answer,topic) loop
        insert into public.quiz_questions(quiz_id,question,options,points,sort_order,topic) values(v_quiz_id,item.question,item.options,1,(select count(*) from public.quiz_questions where quiz_id=v_quiz_id),item.topic) returning id into v_question_id;
        insert into private.quiz_question_keys(question_id,correct_answer) values(v_question_id,to_jsonb(item.answer::text));
      end loop;
    end if;
    v_quiz_id:=null;
  end loop;
end
$seed$;
