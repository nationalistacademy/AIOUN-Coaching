# AIOU Coaching LMS — Supabase Auth setup

The LMS browser client is configured in `supabase-config.js` and uses Supabase Auth for email/password sign-in, account creation, password recovery, and Google/Facebook OAuth.

## One-time Supabase dashboard configuration

Open the [Lms project's Auth URL Configuration](https://supabase.com/dashboard/project/ktmeipbspavgvgecqzwg/auth/url-configuration).

1. Set **Site URL** to the actual public URL where this repository is deployed.
2. Add exact redirect URLs for the deployed LMS pages:
   - `<your-deployed-site-url>/lms/dashboard.html`
   - `<your-deployed-site-url>/lms/reset-password.html`
3. For local testing, add the corresponding local URLs, for example `http://localhost:8000/lms/**`. Replace this with the host/port you actually use.
4. Keep email/password authentication enabled. If email confirmation is enabled, complete the confirmation email before attempting to sign in.

Supabase only allows auth redirects to URLs on its configured redirect allow list. See the [official redirect URL guide](https://supabase.com/docs/guides/auth/redirect-urls).

## Optional Google and Facebook sign-in

The page now calls Supabase OAuth for both buttons. To make either button work, open **Authentication → Sign In / Providers** in the Supabase dashboard, enable that provider, and supply its OAuth client credentials. The provider's callback/redirect URI is:

`https://ktmeipbspavgvgecqzwg.supabase.co/auth/v1/callback`

Google and Facebook credentials are configured in the provider consoles and Supabase dashboard; do not commit OAuth client secrets to this repository. See the [Supabase Auth guide](https://supabase.com/docs/guides/auth).

## Security notes

- `supabase-config.js` contains the project's public publishable key; browser-side publishable keys are expected to be public.
- Never add a Supabase `service_role` or secret API key to browser code or commit one to GitHub.
- The dashboard validates the signed-in user with `supabase.auth.getUser()` before showing the dashboard. This is a client-side page guard, not server-side protection for sensitive data.
- The database has RLS enabled on all `public` tables. Enrollment creation/status changes are staff-only; quiz attempts and answers are written through the server-side grading RPC, and correct-answer keys are kept in the non-exposed `private` schema.
- Admin/teacher authorization uses `app_metadata.role` (`admin` or `teacher`), not user-editable `user_metadata`. Assign staff roles only from a trusted server/admin process.
- Security advisor review: the three public `SECURITY DEFINER` warnings were removed by making public helper/RPC functions `SECURITY INVOKER`. The remaining INFO for `private.quiz_question_keys` having no RLS policies is intentional: no client role can read it, and the private grading routine accesses it under its owner privileges.

## Files

- `signin-signup.html` — sign-in, sign-up, password reset request, Google/Facebook OAuth
- `dashboard.html` — authenticated dashboard and logout
- `reset-password.html` — password recovery completion
- `supabase-config.js` — public Supabase project URL and publishable key


## Free static deployment (GitHub Pages)

A deployment workflow is included at `.github/workflows/deploy-pages.yml`. It deploys the exact commit only after the existing **Browser QA** workflow succeeds on `main`, so broken local links, mobile layout regressions, or DOCX/PDF export failures block the deployment.

Expected project-site base URL (confirm the actual URL from the successful workflow run):
`https://nationalistacademy.github.io/AIOUN-Coaching/`

LMS sign-in page:
`https://nationalistacademy.github.io/AIOUN-Coaching/lms/signin-signup.html`

### One-time GitHub setup

1. Open the repository's **Settings → Pages**.
2. Set the publishing source to **GitHub Actions**, if GitHub asks you to choose a source.
3. Open **Actions → Browser QA** and check that the latest run succeeds. Then open **Actions → Deploy AIOU Coaching to GitHub Pages** and confirm its deployment run succeeds. The site is not updated until deployment completes.

### Required Supabase Auth URLs

After GitHub Pages is live, open the Supabase dashboard linked above → **Authentication → URL Configuration** and set:

- **Site URL**: `https://nationalistacademy.github.io/AIOUN-Coaching/`
- **Redirect URLs**:
  - `https://nationalistacademy.github.io/AIOUN-Coaching/lms/dashboard.html`
  - `https://nationalistacademy.github.io/AIOUN-Coaching/lms/reset-password.html`

If the final GitHub Pages URL differs, use the exact URL shown by the deployment workflow and update these settings accordingly. Google/Facebook sign-in still requires configuring each provider's credentials in Supabase.

### LMS readiness warning

Static hosting only serves the LMS files; it does not configure Supabase Auth URLs or OAuth provider credentials. The LMS tables and core RLS policies are present and the security hardening migration is applied. Before production use, finish end-to-end tests with separate student and staff accounts, verify Auth redirect/provider settings, and confirm staff roles are assigned only through a trusted process.

## Real-account LMS security E2E test

A dedicated Playwright/API test suite is available at `tests/lms-security.spec.js`, with a manual GitHub Actions workflow at `.github/workflows/lms-security-e2e.yml`. It signs in with separate student A, student B, and trusted staff accounts using the real Supabase Auth endpoint, then checks row isolation, student self-enrollment, forged quiz attempts, direct score/answer tampering, and staff visibility.

### One-time test setup

Use a **non-production test project** if possible. Never use a service-role key for these tests; the suite only needs the public publishable/anon key and each account's own password.

1. Create three dedicated test users in Supabase Auth: Student A, Student B, and Staff. Confirm both student accounts can sign in. Do not share real user passwords in chat or commit them.
2. Give the staff test user a trusted `app_metadata.role` of `admin` or `teacher` from the Supabase dashboard/admin process. Do not set this through user-editable metadata.
3. Create a dedicated published test course and published quiz. Enroll both test students in that course and submit the quiz as each student at least once, so each has a quiz attempt. Create a second course that Student A is **not** enrolled in.
4. In GitHub repository **Settings → Secrets and variables → Actions → New repository secret**, set these secrets:
   - `LMS_TEST_SUPABASE_URL` — test project's Supabase URL
   - `LMS_TEST_SUPABASE_ANON_KEY` — public publishable/anon key only
   - `LMS_TEST_STUDENT_A_EMAIL` and `LMS_TEST_STUDENT_A_PASSWORD`
   - `LMS_TEST_STUDENT_B_EMAIL` and `LMS_TEST_STUDENT_B_PASSWORD`
   - `LMS_TEST_STAFF_EMAIL` and `LMS_TEST_STAFF_PASSWORD`
5. Open **Actions → LMS Security E2E → Run workflow** and enter the UUIDs of the shared test course, quiz, and the second course Student A is not enrolled in.

The workflow must pass all tests to establish the real-account result. It fails when credentials or fixtures are missing, and test accounts/passwords are not written to logs intentionally. The suite checks that direct enrollment/attempt creation cannot create a row and that direct score/answer updates either fail or affect zero rows. Tests do not create persistent data.

**Current status:** the test harness is committed, but a real-account run is still pending until the dedicated test accounts, fixture IDs, and GitHub Actions secrets are configured. Do not treat the suite as passed merely because the workflow file exists.
