# Blogger + Firebase LMS migration

## Target architecture

- Blogger hosts the public site, theme, and user-facing HTML pages.
- Firebase Authentication handles student/staff identity.
- Cloud Firestore stores application records.
- Callable Cloud Functions perform privileged operations, including quiz grading and staff-only actions.
- Firebase Security Rules deny access by default and derive privileges from trusted custom claims.
- The existing Supabase-backed LMS must not be considered migrated until every page and server operation has been ported and the acceptance checks below pass.

Blogger is a static/content host, not a secure application database or server runtime. Do not place service-account keys, admin credentials, grading answer keys, or privileged logic in Blogger HTML.

## Canonical Blogger pages

- Sign in/sign up: https://aioucoaching.blogspot.com/p/signin-signup.html
- Dashboard: https://aioucoaching.blogspot.com/p/dashboard_02000936824.html
- Course: https://aioucoaching.blogspot.com/p/course.html
- Lesson: https://aioucoaching.blogspot.com/p/lesson.html
- Quiz: https://aioucoaching.blogspot.com/p/quiz.html
- Quiz result: https://aioucoaching.blogspot.com/p/quiz-result.html
- Password reset: https://aioucoaching.blogspot.com/p/reset-password.html
- Admin: https://aioucoaching.blogspot.com/p/admin.html

Use absolute Blogger URLs for redirects and email-action links. Relative paths such as `./dashboard.html` are not valid replacements for these Blogger pages.

## Required migration work

1. Replace Supabase Auth in sign-in/sign-up, dashboard, course, lesson, quiz, quiz-result, reset-password, and admin pages with Firebase Authentication.
2. Define Firestore collections and validation rules for profiles, courses, lessons, enrollments, quizzes, attempts, answers, progress, and audit events.
3. Keep answer keys private to trusted server-side grading. The browser must not be able to read correct answers before submitting.
4. Implement callable Cloud Functions for quiz submission/grading, enrollment changes, and privileged administration. Require trusted custom claims for staff/admin actions.
5. Port admin CRUD workflows and verify student/staff role separation.
6. Set Firebase Auth authorized domains and email action URLs for the exact Blogger origin.
7. Add automated tests for rules, Functions, and client workflows; use isolated test users and seeded test data.
8. Confirm PWA service-worker scope and ensure authenticated pages, API responses, and private student records are never cached.
9. Build and validate the Blogger XML theme and page snippets. Publishing/importing the theme is a separate manual action and must not happen without approval.

## Acceptance tests

- New student can sign up, verify email if enabled, sign in, sign out, and reset password.
- Unauthenticated users cannot access private course, lesson, attempt, or progress data.
- A student cannot grant themselves a staff/admin claim or change enrollment status.
- Student can only read their own attempts/progress and only access enrolled content.
- Correct answers are not readable from client requests before quiz submission.
- Server-side grading rejects malformed, duplicate, oversized, or unauthorized submissions.
- Score, unanswered-question count, and progress persist and match the server-generated result.
- Staff can manage published content only with trusted staff/admin claims.
- Mobile and desktop layout works on the canonical Blogger pages.
- Security rules and Functions tests pass before production rollout.

## Current implementation status (repository only)

A first Firebase LMS replacement now exists in `firebase-lms/index.html`, with Firebase Authentication, enrollment-based dashboard/course access, lessons, quiz submission, result display, staff-only course/lesson/quiz creation, and enrollment management. Callable Cloud Functions in `functions/index.js` validate staff claims, keep correct-answer keys in the server-only `quizAnswerKeys` collection, grade submissions server-side, allow unanswered questions, and persist attempts/progress. Firebase Hosting is configured to serve `firebase-lms/` with no-store and security headers; Firestore rules/indexes are configured in the repository.

This is an implementation milestone, **not a production-ready certification**. The app and functions still require syntax/build checks, Firebase Emulator Suite rules/function tests, isolated account end-to-end testing, and verification of Firebase Console settings. In particular, add the Hosting domain (such as `aioucoaching.web.app`) to Authentication authorized domains; enable Email/Password authentication; provision Firestore and Cloud Functions billing/runtime as needed; assign staff custom claims only through a trusted Admin SDK process; and review/deploy rules only after emulator tests. The current public Blogger pages and old `lms/` Supabase implementation have deliberately not been redirected or deleted. No hosting deployment, DNS changes, Blogger theme publication, or PR merge has occurred.

The repository already contains a Supabase-backed LMS in `lms/`. Keep it as a rollback/reference until the Firebase replacement passes the acceptance tests. Do not change DNS, publish the Blogger theme, or merge the migration branch as part of repository-only work.
