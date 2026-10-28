# Controlled LMS end-to-end test setup

This is for the connected Supabase project `ktmeipbspavgvgecqzwg` only. Use dedicated QA identities, never real students. Do not put passwords or a Supabase service-role/secret key in chat, source control, or test logs.

## Current seed fixtures

The Supabase database currently has five published BBA starter quizzes with five questions and private answer keys each.

- Test course: Financial Accounting (5418), course ID `ca0f145e-3163-4381-a9ed-7246d188becb`
- Test quiz: Starter MCQ Practice, quiz ID `44fb93fb-47bb-42ca-8939-1b922bb9a4a9`
- Unenrolled-course fixture: Fundamentals of Business (5402), course ID `3d270d70-55de-46a2-a65c-effbed6d0370`

## 1. Create isolated Auth identities

In Supabase Dashboard → Authentication → Users, create three confirmed, test-only users with unique email addresses you control:
- Student A
- Student B
- Staff QA

Set a strong unique password for each. Store credentials only in your password manager and GitHub Actions secrets/local environment. Do not use production accounts.

For the Staff QA user, set trusted **app metadata** `role=teacher` (or `role=admin`) using an authorized admin interface. Do not put role in user metadata; students can edit user metadata.

## 2. Enroll both test students

After creating the users, run the following in the Supabase SQL Editor. Replace the three example email addresses with the exact test-only addresses you created. This grants both students the test course and deliberately leaves the second course un-enrolled for Student A.

```sql
begin;

insert into public.enrollments (student_id, course_id, status)
select u.id, 'ca0f145e-3163-4381-a9ed-7246d188becb'::uuid, 'active'
from auth.users u
where lower(u.email) in ('qa-student-a@example.invalid', 'qa-student-b@example.invalid')
on conflict do nothing;

-- Confirm exactly two QA student enrollments exist before running E2E.
select u.email, e.course_id, e.status
from public.enrollments e
join auth.users u on u.id = e.student_id
where lower(u.email) in ('qa-student-a@example.invalid', 'qa-student-b@example.invalid')
order by u.email;

commit;
```

If the query does not return both students, stop and correct the fixture addresses. Do not disable RLS or grant broad privileges to make the test pass.

## 3. Configure the test runner

Set these environment variables locally or as repository/environment secrets in GitHub Actions:

- `LMS_TEST_SUPABASE_URL` — project API URL
- `LMS_TEST_SUPABASE_ANON_KEY` — publishable/legacy anon key only (never service-role)
- `LMS_TEST_STUDENT_A_EMAIL`, `LMS_TEST_STUDENT_A_PASSWORD`
- `LMS_TEST_STUDENT_B_EMAIL`, `LMS_TEST_STUDENT_B_PASSWORD`
- `LMS_TEST_STAFF_EMAIL`, `LMS_TEST_STAFF_PASSWORD`
- `LMS_TEST_COURSE_ID=ca0f145e-3163-4381-a9ed-7246d188becb`
- `LMS_TEST_QUIZ_ID=44fb93fb-47bb-42ca-8939-1b922bb9a4a9`
- `LMS_TEST_UNENROLLED_COURSE_ID=3d270d70-55de-46a2-a65c-effbed6d0370`

Run:

```sh
npm ci
npx playwright test tests/lms-security.spec.js
```

The suite checks student isolation, denied self-enrollment/direct score writes, trusted staff role access, and a real incomplete submission. The incomplete-submission test expects zero points, a denominator equal to the sum of every quiz question's points, and persisted incorrect answers for unanswered questions.

## 4. Verify the student-facing progress page

Sign in as Student A in the LMS, open `lms/quiz.html?id=44fb93fb-47bb-42ca-8939-1b922bb9a4a9`, submit an attempt, and then open `lms/progress.html`. Repeat the same quiz at least twice with different answers to verify the per-quiz trend. Topic analysis requires topic-tagged questions. Check that Student B cannot see Student A's attempts.

## Cleanup

After evidence has been captured, remove only the dedicated QA enrollments and Auth users created for this test. Do not delete unrelated data or disable security controls. Keep the test users isolated from real student accounts.
