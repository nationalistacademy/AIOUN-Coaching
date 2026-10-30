# AIOU Coaching LMS — setup, deployment, and security

The LMS is a static browser application backed by Supabase Auth and database policies. This guide describes required configuration and the current test workflow. A committed page or workflow is not proof that a live deployment or end-to-end test has passed.

## 1. Supabase Auth configuration

Open the [LMS Supabase Auth URL Configuration](https://supabase.com/dashboard/project/ktmeipbspavgvgecqzwg/auth/url-configuration).

1. Set **Site URL** to the exact public origin used by the deployed LMS.
2. Add the exact callback destinations needed by the application:
   - `<deployed-base-url>/lms/dashboard.html`
   - `<deployed-base-url>/lms/reset-password.html`
3. For local testing, add only the local URLs you actually use, such as `http://localhost:8000/lms/**`.
4. Keep email/password authentication enabled if the app is intended to use it.
5. If email confirmation is enabled, confirm each account before testing sign-in.

Supabase only permits redirect destinations on its configured allow list. Read the [official redirect URL guide](https://supabase.com/docs/guides/auth/redirect-urls).

## 2. OAuth providers

Google and Facebook buttons require each provider to be enabled and configured in **Authentication → Sign In / Providers**. The Supabase callback URL for this project is:

```text
https://ktmeipbspavgvgecqzwg.supabase.co/auth/v1/callback
```

Configure provider credentials in their provider consoles and Supabase dashboard. Never commit OAuth client secrets.

## 3. Keys and authorization

- `supabase-config.js` uses the browser-visible publishable/anon key. This key is intended for client applications and must be protected by correct database policies.
- Never put a Supabase `service_role` key or secret API key in browser JavaScript, Blogger content, public GitHub files, or screenshots.
- The UI's signed-in-user check improves navigation but is not a replacement for database authorization.
- Enable RLS on exposed tables and test policies using separate user accounts.
- Admin/teacher access must be based on trusted `app_metadata.role` values such as `admin` or `teacher`, not user-editable `user_metadata`.
- Assign staff roles only through a trusted server-side or Supabase admin process.
- Student enrollment creation/status changes are staff-controlled. Quiz attempts and answers must go through the protected grading flow; correct-answer keys are kept in the non-exposed `private` schema.
- The hardening migration is [20261028000000_harden_lms_enrollment_and_quiz_writes.sql](../supabase/migrations/20261028000000_harden_lms_enrollment_and_quiz_writes.sql).

The last recorded security-advisor review reported no security warnings and one intentional informational item for the private answer-key table. Re-run the advisor after future schema or policy changes; do not assume that old results certify future changes.

## 4. Netlify deployment

This repository can publish the static LMS on Netlify. The intended site origin is:

```text
https://aioucoaching.netlify.app
```

The Netlify site must be created/renamed to `aioucoaching` in the Netlify dashboard and connected to this GitHub repository. The repository build configuration is in the root `netlify.toml`; the root route is rewritten by `_redirects` to `/lms/signin-signup.html`. LMS routes remain under `/lms/`.

### Netlify site settings

- Build command: `npm install --omit=dev && npm run build:vendor`
- Publish directory: `.`
- Production branch: `main` (only after the reviewed changes are merged)
- Do not add service-role keys, OAuth client secrets, or service-account JSON as browser environment variables.
- Do not deploy a draft feature branch to production. Use a Netlify Deploy Preview for review first.

### Supabase Auth URL settings

After the Netlify site exists and its exact HTTPS origin is confirmed, set Supabase **Site URL** to:

```text
https://aioucoaching.netlify.app
```

Add these exact redirect URLs to the Supabase allow list:

```text
https://aioucoaching.netlify.app/lms/dashboard.html
https://aioucoaching.netlify.app/lms/reset-password.html
```

The sign-up confirmation and OAuth redirects are generated from the current page URL, so they resolve to the Netlify origin when users start the flow there. Google/Facebook still require provider configuration in Supabase and their own provider consoles. Do not change Supabase Auth URL settings until the Netlify domain is confirmed active.

### Deployment verification

1. Create/claim the `aioucoaching` Netlify site and connect the GitHub repository.
2. Review and merge the Netlify deployment PR only after CI and code review.
3. Confirm Netlify's production deploy succeeds.
4. Check `https://aioucoaching.netlify.app/` redirects internally to the LMS sign-in page and test all `/lms/*.html` pages.
5. Only then update Supabase Site URL/redirect allow list and test email confirmation, password reset and each enabled OAuth provider.

A committed Netlify configuration is not proof that the site exists, that the domain is assigned, or that a production deployment succeeded.

## 5. Browser QA

The repository's browser tests are in `tests/site.spec.js`; configuration and npm scripts are in [package.json](../package.json) and [playwright.config.js](../playwright.config.js).

Run locally with a supported Node.js version:

```bash
npm install
npx playwright install --with-deps chromium
npm test
```

Use the scripts actually present in `package.json`. Review the latest GitHub Actions result rather than relying on a previous run or on the presence of the workflow file.

## 6. Real-account LMS security E2E

The API-backed Playwright suite is [tests/lms-security.spec.js](../tests/lms-security.spec.js). The manual workflow is [lms-security-e2e.yml](../.github/workflows/lms-security-e2e.yml). It uses real Supabase Auth sign-ins for two students and a trusted staff account to test data isolation and forbidden client-side writes.

### Prepare dedicated test fixtures

Use a **non-production test project** where possible.

1. Create dedicated Student A, Student B, and Staff accounts in Supabase Auth. Confirm both student accounts can sign in.
2. Set the staff test account's `app_metadata.role` to `admin` or `teacher` through a trusted admin process. Do not set staff privileges through user-editable metadata.
3. Create a published test course and quiz. Enroll both students in that course and submit the quiz from each account at least once.
4. Create a second course that Student A is not enrolled in.
5. In GitHub repository **Settings → Secrets and variables → Actions**, add these repository secrets:
   - `LMS_TEST_SUPABASE_URL`
   - `LMS_TEST_SUPABASE_ANON_KEY` (public publishable/anon key only)
   - `LMS_TEST_STUDENT_A_EMAIL`
   - `LMS_TEST_STUDENT_A_PASSWORD`
   - `LMS_TEST_STUDENT_B_EMAIL`
   - `LMS_TEST_STUDENT_B_PASSWORD`
   - `LMS_TEST_STAFF_EMAIL`
   - `LMS_TEST_STAFF_PASSWORD`
6. Open **Actions → LMS Security E2E → Run workflow** and provide the shared course UUID, shared quiz UUID, and course UUID that Student A is not enrolled in.

The suite checks cross-student row isolation, self-enrollment attempts, forged quiz-attempt creation, score/answer tampering, and staff visibility. It is designed to avoid creating persistent test data. Never put passwords or service-role keys in workflow inputs or logs.

**Status:** the test harness is committed, but a real-account run remains pending until the test accounts, fixture IDs, and GitHub Actions secrets are configured. Do not report the E2E suite as passed before a successful run is visible in Actions.

## 7. Production readiness checklist

- [ ] Latest Browser QA run succeeds.
- [ ] Latest Pages deployment run succeeds and live URL is confirmed.
- [ ] Supabase Site URL and redirect allow list match the deployed origin.
- [ ] Email/password flow and password recovery tested with a dedicated account.
- [ ] Each enabled OAuth provider tested with valid provider credentials.
- [ ] Staff role assignment is performed through a trusted process.
- [ ] Real-account LMS security E2E workflow passes with dedicated fixtures.
- [ ] RLS and security-advisor checks are rerun after policy/schema changes.
- [ ] No secrets are present in browser code or Git history.
