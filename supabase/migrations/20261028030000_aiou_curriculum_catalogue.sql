-- Add explicit AIOU curriculum metadata while preserving the existing LMS course/quiz model.
alter table public.courses
  add column if not exists academic_level text,
  add column if not exists programme text,
  add column if not exists semester integer,
  add column if not exists course_code text,
  add column if not exists subject_area text,
  add column if not exists source_url text;

create index if not exists courses_curriculum_lookup_idx
  on public.courses (academic_level, programme, semester);

create unique index if not exists courses_course_code_unique_idx
  on public.courses (course_code)
  where course_code is not null;

comment on column public.courses.academic_level is 'School/intermediate/associate/undergraduate/postgraduate level in the AIOU coaching catalogue.';
comment on column public.courses.programme is 'Programme name, e.g. BBA, BS Computer Science, Matric General.';
comment on column public.courses.semester is 'Official semester number when the subject belongs to a semester-based programme.';
comment on column public.courses.course_code is 'Official AIOU course code; null when not verified from an official source.';
comment on column public.courses.source_url is 'Official curriculum or study-material source used to verify course metadata.';

-- Seed only verified BBA subjects/codes visible on the official AIOU BBA programme page.
-- This is a starter catalogue, not a claim that every AIOU programme has been imported.
insert into public.courses
  (title, slug, description, published, academic_level, programme, semester, course_code, subject_area, source_url)
values
  ('Functional English', 'aiou-bba-functional-english-9382', 'AIOU BBA/Associate Degree in Business Administration — Semester 1. Official code 9382.', true, 'undergraduate', 'BBA / Associate Degree in Business Administration', 1, '9382', 'English', 'https://aiou.edu.pk/bba-program'),
  ('Basics of Environmental Sciences', 'aiou-bba-environmental-sciences-9389', 'AIOU BBA/Associate Degree in Business Administration — Semester 1. Official code 9389.', true, 'undergraduate', 'BBA / Associate Degree in Business Administration', 1, '9389', 'Environmental Science', 'https://aiou.edu.pk/bba-program'),
  ('Quantitative Reasoning-I', 'aiou-bba-quantitative-reasoning-9424', 'AIOU BBA/Associate Degree in Business Administration — Semester 1. Official code 9424.', true, 'undergraduate', 'BBA / Associate Degree in Business Administration', 1, '9424', 'Quantitative Reasoning', 'https://aiou.edu.pk/bba-program'),
  ('Financial Accounting', 'aiou-bba-financial-accounting-5418', 'AIOU BBA/Associate Degree in Business Administration — Semester 1. Official code 5418.', true, 'undergraduate', 'BBA / Associate Degree in Business Administration', 1, '5418', 'Accounting', 'https://aiou.edu.pk/bba-program'),
  ('Fundamentals of Business', 'aiou-bba-fundamentals-business-5402', 'AIOU BBA/Associate Degree in Business Administration — Semester 1. Official code 5402.', true, 'undergraduate', 'BBA / Associate Degree in Business Administration', 1, '5402', 'Business', 'https://aiou.edu.pk/bba-program'),
  ('Expository Writing', 'aiou-bba-expository-writing-9381', 'AIOU BBA — Semester 2. Official code 9381.', true, 'undergraduate', 'BBA', 2, '9381', 'English', 'https://aiou.edu.pk/bba-program'),
  ('Application of Information and Communication Technologies', 'aiou-bba-ict-9384', 'AIOU BBA — Semester 2. Official code 9384.', true, 'undergraduate', 'BBA', 2, '9384', 'Information Technology', 'https://aiou.edu.pk/bba-program'),
  ('Principles of Marketing', 'aiou-bba-principles-marketing-8407', 'AIOU BBA — Semester 2. Official code 8407.', true, 'undergraduate', 'BBA', 2, '8407', 'Marketing', 'https://aiou.edu.pk/bba-program'),
  ('Advanced Accounting', 'aiou-bba-advanced-accounting-5419', 'AIOU BBA — Semester 2. Official code 5419.', true, 'undergraduate', 'BBA', 2, '5419', 'Accounting', 'https://aiou.edu.pk/bba-program'),
  ('Principles of Management', 'aiou-bba-principles-management-5414', 'AIOU BBA — Semester 2. Official code 5414.', true, 'undergraduate', 'BBA', 2, '5414', 'Management', 'https://aiou.edu.pk/bba-program'),
  ('Entrepreneurship', 'aiou-bba-entrepreneurship-5026', 'AIOU BBA — Semester 3. Official code 5026.', true, 'undergraduate', 'BBA', 3, '5026', 'Entrepreneurship', 'https://aiou.edu.pk/bba-program'),
  ('Human Resource Management', 'aiou-bba-hrm-8425', 'AIOU BBA — Semester 3. Official code 8425.', true, 'undergraduate', 'BBA', 3, '8425', 'Human Resources', 'https://aiou.edu.pk/bba-program'),
  ('Business Law', 'aiou-bba-business-law-5413', 'AIOU BBA — Semester 4. Official code 5413.', true, 'undergraduate', 'BBA', 4, '5413', 'Business Law', 'https://aiou.edu.pk/bba-program'),
  ('Introduction to Business Finance', 'aiou-bba-business-finance-8594', 'AIOU BBA — Semester 4. Official code 8594.', true, 'undergraduate', 'BBA', 4, '8594', 'Finance', 'https://aiou.edu.pk/bba-program'),
  ('Cost Accounting', 'aiou-bba-cost-accounting-5410', 'AIOU BBA — Semester 4. Official code 5410.', true, 'undergraduate', 'BBA', 4, '5410', 'Accounting', 'https://aiou.edu.pk/bba-program')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  academic_level = excluded.academic_level,
  programme = excluded.programme,
  semester = excluded.semester,
  course_code = excluded.course_code,
  subject_area = excluded.subject_area,
  source_url = excluded.source_url;
