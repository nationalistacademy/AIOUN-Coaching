update public.courses set source_url='https://www.aiou.edu.pk/bba-program'
where course_code in ('9381','9384','5414','5419','9389') and (source_url is null or source_url='');

with bank(course_code,question,o1,o2,o3,o4,answer,topic) as (
values
('9381','Which sentence is grammatically correct?','She do her work carefully.','She does her work carefully.','She doing her work carefully.','She done her work carefully.','She does her work carefully.','Grammar — subject-verb agreement'),
('9381','What is the main purpose of a topic sentence?','Introduce the paragraph main idea','List every reference','Repeat only the conclusion','Provide unrelated background','Introduce the paragraph main idea','Paragraph structure'),
('9381','Which transition best signals contrast?','Furthermore','For example','However','Therefore','However','Cohesion and transitions'),
('9384','Which component executes instructions and calculations?','CPU','Monitor','Keyboard','Speaker','CPU','Computer hardware'),
('9384','Which password practice is safest?','Reuse one password everywhere','Share it with classmates','Use a unique long password','Write it in a public profile','Use a unique long password','Cybersecurity'),
('9384','Which application is suited to calculations in rows and columns?','Spreadsheet','Media player','Image viewer','Text-to-speech tool','Spreadsheet','Productivity software'),
('5414','Which management function sets objectives and decides how to achieve them?','Planning','Controlling','Staffing only','Auditing only','Planning','Management functions'),
('5414','Which leadership approach invites team participation in decisions?','Democratic','Autocratic only','No leadership','Leadership is unnecessary','Democratic','Leadership'),
('5414','Control compares actual performance against what?','Planned standards or objectives','Competitors slogans','Office furniture','Employee hobbies','Planned standards or objectives','Controlling'),
('5419','Under accrual accounting, revenue is generally recognised when it is what?','Earned, subject to applicable rules','Cash is always withdrawn','A budget is drafted','A supplier is selected','Earned, subject to applicable rules','Accrual accounting'),
('5419','Which account is normally a current asset?','Accounts receivable','Share capital','Long-term loan payable','Retained earnings','Accounts receivable','Financial statements'),
('5419','Depreciation allocates depreciable asset cost over its what?','Useful life','Purchase order number','Invoice colour','Bank branch','Useful life','Depreciation'),
('9389','Which is a renewable energy source?','Solar energy','Coal','Petroleum','Natural gas','Solar energy','Renewable resources'),
('9389','What is a major cause of human-driven climate change?','Greenhouse gas emissions','Moon phases','Earth daily rotation','Ocean tides alone','Greenhouse gas emissions','Climate change'),
('9389','Which action best supports waste reduction?','Reuse and recycle materials','Burn mixed plastic outdoors','Dump waste into waterways','Use disposable items for every task','Reuse and recycle materials','Waste management')
), new_quizzes as (
 insert into public.quizzes(course_id,title,description,published)
 select c.id,'AIOU Syllabus Practice — '||c.course_code,'Original practice questions aligned to the course title in AIOU official BBA scheme of study. Verify against current course materials.',true
 from public.courses c where c.course_code in ('9381','9384','5414','5419','9389') and c.published=true
 and not exists(select 1 from public.quizzes z where z.course_id=c.id and z.title='AIOU Syllabus Practice — '||c.course_code)
 returning id,course_id,title
), qbank as (
 select b.*,c.id as course_id,z.id as quiz_id from bank b join public.courses c on c.course_code=b.course_code
 join public.quizzes z on z.course_id=c.id and z.title='AIOU Syllabus Practice — '||b.course_code
), inserted as (
 insert into public.quiz_questions(quiz_id,question,options,sort_order,points,topic)
 select quiz_id,question,jsonb_build_array(o1,o2,o3,o4),row_number() over(partition by quiz_id order by question)::int,1,topic
 from qbank where not exists(select 1 from public.quiz_questions q where q.quiz_id=qbank.quiz_id and q.question=qbank.question)
 returning id,quiz_id,question
)
insert into private.quiz_question_keys(question_id,correct_answer)
select i.id,to_jsonb(b.answer) from inserted i join qbank b on b.quiz_id=i.quiz_id and b.question=i.question
on conflict(question_id) do nothing;
