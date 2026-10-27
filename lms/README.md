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
