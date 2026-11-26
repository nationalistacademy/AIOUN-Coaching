# Phase 1 readiness scorecard

_Last reviewed: 2026-11-26. Scores describe the inspected repository and live Supabase schema; they are not a certification or production acceptance._

## Overall scores

| Area | Score | Evidence and gap |
|---|---:|---|
| Authentication foundation | 7/10 | Email/Roll Number login function is active and the owner reports successful login. Automated live login, recovery, and durable abuse-control tests are still missing. |
| Student data isolation | 8/10 | RLS is enabled on core tables; student ownership is linked through `auth_user_id` / `user_id`; restricted profile grants and answer-key column protection are in place. Two-user adversarial E2E is pending. |
| Student dashboard | 5/10 | Dashboard and profile completion exist. Notice board and notifications have no delivery backend; activities remain browser-local. |
| Courses / academic records | 4/10 | The catalog contains published course rows, but the student page previously queried a non-existent `student_id` column in `academic_records`. This PR changes it to the actual `user_id` ownership column. Actual student enrollments/semester mappings remain sparse. |
| Student card | 6/10 | Preview and print exist; card mode/status is controlled through an admin-only database function. The browser previously called the private schema directly; this PR adds a narrow public invoker RPC wrapper while keeping the privileged implementation private. |
| Admin readiness | 2/10 | No profile currently has role `admin`; therefore admin navigation and student search are hidden. Do not promote an account until the owner identifies the trusted admin email. |
| Settings | 8/10 | Six themes and email/SMS/app preference columns are persisted to `profiles`. Email/SMS delivery providers are not connected; preferences are not proof that messages are sent. |
| Operations / QA | 4/10 | Health Advisor has no findings. Security Advisor still reports leaked-password protection disabled. Full browser and two-student isolation tests have not been run. |

**Phase 1 readiness: 6/10.** The data/security foundation is ahead of the actual student workflows. It is suitable for controlled testing, not yet a fully accepted production LMS.

**Full product vision completion: 3/10.** LMS lessons, assignment workflow, messaging, notice delivery, staff CMS/CRM, fee management and robust reporting are not complete. Build those only after Phase 1 acceptance and explicit prioritization.

## Changes in this PR

- Fix the student courses query to use `academic_records.user_id = auth.uid()`, matching the live schema and RLS ownership rule.
- Change the card-management browser call to a public RPC name. The SQL migration creates a narrow `SECURITY INVOKER` wrapper; the actual admin-only operation remains in the unexposed `private` schema.
- Harden the private SECURITY DEFINER function with an empty search path and fully qualified object references.
- Keep student mode and card status changes restricted to the trusted admin check in the database.

## Acceptance gates

- [ ] Owner identifies the exact trusted admin email; only then promote that account through a trusted process.
- [ ] Enable leaked password protection in Supabase Auth settings (plan availability permitting) and set a sensible minimum password length.
- [ ] Apply this PR's RPC migration to the intended Supabase project, then verify student calls are denied and admin calls succeed.
- [ ] Test Student A cannot read or update Student B's profile, student row, academic records, activities or submissions.
- [ ] Test a student cannot change role, roll number, course, batch, student mode or card status.
- [ ] Test admin can search a roll number and update only student mode/card status.
- [ ] Verify a student with no academic records sees a helpful empty state, not a query error.
- [ ] Verify profile save, theme persistence, notification preference persistence and password change.
- [ ] Test desktop/mobile, keyboard navigation, and Blogger-published page after manually pasting the canonical source.
- [ ] Review the login Edge Function's in-memory rate limiter. It is per-isolate and relies on a forwarded IP header; do not describe it as durable/global brute-force protection.

## Known non-goals / honest limitations

- Activity tasks are stored in browser localStorage, not synced to Supabase.
- Chat, notices, email and SMS delivery are not implemented.
- The published course catalog is not the same as a student's enrolment or semester registration.
- Student card preview/print is an internal AIOU Coaching card, not an official AIOU identity credential or live verification system.
- A GitHub commit does not publish Blogger content or deploy an Edge Function.

## Rollback

- Revert this PR to restore the prior browser query and private-schema RPC call.
- If the SQL migration has been applied, drop only `public.admin_set_student_card_fields(uuid,text,text)` after confirming no other client uses it; retain the private function unless a separate security review approves its removal.
