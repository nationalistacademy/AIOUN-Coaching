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
- Before storing course enrolments, grades, quiz attempts, or private student records, create appropriate Row Level Security (RLS) policies in Supabase. A sign-in page alone does not protect database rows.

## Files

- `signin-signup.html` — sign-in, sign-up, password reset request, Google/Facebook OAuth
- `dashboard.html` — authenticated dashboard and logout
- `reset-password.html` — password recovery completion
- `supabase-config.js` — public Supabase project URL and publishable key
