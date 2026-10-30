update public.courses set source_url='https://www.aiou.edu.pk/bba-program'
where course_code in ('5026','5410','5413','8425','8594') and (source_url is null or source_url='');

insert into public.quizzes(course_id,title,description,published)
select c.id,'AIOU Syllabus Practice — '||c.course_code,
       'Original practice questions aligned to the course title in AIOU official BBA scheme of study. Verify against current course materials.',false
from public.courses c
where c.course_code in ('5026','5410','5413','8425','8594') and c.published=true
and not exists(select 1 from public.quizzes z where z.course_id=c.id and z.title='AIOU Syllabus Practice — '||c.course_code);

with bank(course_code,question,o1,o2,o3,o4,answer,topic) as (
values
('5026','A business opportunity is most useful when it addresses what?','A real customer need','Only the founder hobby','A product nobody wants','An unclear problem with no audience','A real customer need','Opportunity identification'),
('5026','A business plan commonly includes which element?','Market and financial planning','Personal passwords','Unrelated news articles','Only a company logo','Market and financial planning','Business planning'),
('5026','What is a common purpose of a minimum viable product?','Test key assumptions with limited resources','Guarantee instant profit','Avoid customer feedback','Replace all future planning','Test key assumptions with limited resources','Startup validation'),
('5410','A cost that changes in total with production volume is usually called what?','Variable cost','Fixed cost','Sunk cost in every case','Period-end balance','Variable cost','Cost behaviour'),
('5410','Prime cost commonly consists of direct materials and what?','Direct labour','Office rent only','Advertising only','Interest expense only','Direct labour','Cost classification'),
('5410','A cost sheet is primarily used to summarise what?','Costs incurred to produce a product or service','Employee birthdays','Shareholder voting only','Bank login attempts','Costs incurred to produce a product or service','Cost sheets'),
('5413','A valid contract generally requires offer, acceptance and what else among core elements?','Consideration where required by applicable law','A company logo','A social media account','A verbal slogan only','Consideration where required by applicable law','Contract fundamentals'),
('5413','Which intellectual property right commonly protects an original literary work?','Copyright','A parking permit','A bank statement','A delivery receipt','Copyright','Intellectual property'),
('5413','The main purpose of a contract is to establish what?','Legally relevant obligations and rights','A marketing colour palette','A staff lunch menu','An informal wish list only','Legally relevant obligations and rights','Contract fundamentals'),
('8425','Which activity is part of human resource planning?','Forecasting staffing needs','Choosing product packaging only','Preparing customer invoices only','Setting weather alerts','Forecasting staffing needs','HR planning'),
('8425','A structured interview helps an employer by doing what?','Asking candidates comparable job-related questions','Avoiding all job criteria','Guaranteeing every candidate the same score','Replacing the job description','Asking candidates comparable job-related questions','Recruitment and selection'),
('8425','Performance appraisal is mainly intended to assess what?','Work performance against relevant expectations','An employee private passwords','The weather at the office','A company logo design','Work performance against relevant expectations','Performance management'),
('8594','The time value of money means money today is generally worth what compared with the same amount later, assuming positive returns?','More, because it can earn a return','Always exactly the same','Less in every situation','Nothing at all','More, because it can earn a return','Time value of money'),
('8594','Which ratio is commonly used to assess short-term liquidity?','Current ratio','Gross margin only','Inventory turnover only','Earnings per share only','Current ratio','Financial ratios'),
('8594','Diversification primarily aims to reduce what?','Concentration risk','All possible risk to zero','Every operating cost','The need for financial records','Concentration risk','Risk and return')
), qbank as (
 select b.*,c.id as course_id,z.id as quiz_id from bank b
 join public.courses c on c.course_code=b.course_code
 join public.quizzes z on z.course_id=c.id and z.title='AIOU Syllabus Practice — '||b.course_code
), inserted as (
 insert into public.quiz_questions(quiz_id,question,options,sort_order,points,topic)
 select qb.quiz_id,qb.question,jsonb_build_array(qb.o1,qb.o2,qb.o3,qb.o4),
        row_number() over(partition by qb.quiz_id order by qb.question)::int,1,qb.topic
 from qbank qb
 where not exists(select 1 from public.quiz_questions q where q.quiz_id=qb.quiz_id and q.question=qb.question)
 returning id,quiz_id,question
)
insert into private.quiz_question_keys(question_id,correct_answer)
select i.id,to_jsonb(b.answer) from inserted i join qbank b on b.quiz_id=i.quiz_id and b.question=i.question
on conflict(question_id) do nothing;

update public.quizzes z set published=true
where z.title like 'AIOU Syllabus Practice — %'
and exists(select 1 from public.quiz_questions q join private.quiz_question_keys k on k.question_id=q.id where q.quiz_id=z.id);
