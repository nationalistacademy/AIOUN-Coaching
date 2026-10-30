# AIOU Coaching

Independent study-support tools, Blogger resources, and a separate Supabase-backed LMS for AIOU students. This project is not affiliated with AIOU.

- Study tools: [index.html](index.html)
- AI Studio: [tools/studio.html](tools/studio.html)
- Blogger PWA/Cloudflare/Firebase guide: [docs/BLOGGER-PWA-CLOUDFLARE-FIREBASE.md](docs/BLOGGER-PWA-CLOUDFLARE-FIREBASE.md)
- Firebase non-LMS starter: [firebase/index.html](firebase/index.html)
- Firebase guide: [firebase/README.md](firebase/README.md)
- Firebase Cloud Functions: [functions/index.js](functions/index.js)
- Firebase CLI manifest: [firebase.json](firebase.json)
- Firestore rules: [firestore.rules](firestore.rules)
- Storage rules: [storage.rules](storage.rules)
- Blogger theme: [theme/aioucoahing.xml](theme/aioucoahing.xml)
- LMS security guide: [lms/README.md](lms/README.md)

## Firebase starter
The Firebase starter provides email/password Auth, profile documents, password reset, private uploads, notification reads and FCM token registration. Copy `firebase/config.example.js` to `firebase/config.js` and fill values from the actual Firebase project. The local config is ignored by Git. Push sending is implemented as a callable Cloud Function requiring the trusted `admin: true` custom claim and targeting one user per call; never put Admin SDK credentials in browser code.

## PWA and Cloudflare
The companion app is separate from Blogger and the Blogger XML must be uploaded manually. A custom domain being connected does not verify DNS, Worker routing or origin configuration; no DNS or Worker route was changed. Verify the exact domain and rollback plan before same-origin service-worker routing.

## Security boundaries
- LMS pages, enrollment, quizzes, scores and Supabase authorization are not changed by the Firebase starter.
- LMS/authenticated routes remain excluded from public PWA caching.
- Admin access must be enforced by trusted server-side claims and Security Rules, not client-side roles.
- Never commit service-account JSON, private keys, API secrets or Cloudflare tokens.

## QA
Check GitHub Actions before claiming deployment or browser tests passed: [Browser QA](https://github.com/nationalistacademy/AIOUN-Coaching/actions/workflows/browser-qa.yml), [Pages deploy](https://github.com/nationalistacademy/AIOUN-Coaching/actions/workflows/deploy-pages.yml), [LMS security tests](https://github.com/nationalistacademy/AIOUN-Coaching/actions/workflows/lms-security-e2e.yml).

## LMS deployment (Netlify)

The student LMS is deployed separately from the public Blogger site. The configured Netlify target is [aioucoaching.netlify.app](https://aioucoaching.netlify.app/).

- Deployment workflow: [netlify-deploy.yml](.github/workflows/netlify-deploy.yml)
- GitHub Actions requires the repository secrets `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.
- `NETLIFY_AUTH_TOKEN` must be a valid Netlify personal access token with access to the target site; `NETLIFY_SITE_ID` must match that site's Site ID. Never commit or paste either value into source files or this README.
- After changing either secret, rerun the Netlify deployment workflow and verify its final status in [GitHub Actions](https://github.com/nationalistacademy/AIOUN-Coaching/actions).
- A queued or running workflow is not proof of a live deployment. Confirm a successful workflow run and open the site to verify the deployed build.

## LMS dashboard and progress

The dashboard and progress views use active enrollments when calculating course progress. Progress analysis distinguishes all-time quiz performance from the latest graded attempt and latest weak-topic results. Related browser tests are in `tests/dashboard-progress.spec.js`.

## Current verification notes

Do not treat a successful Node.js CI or Browser QA run as proof that Netlify deployment succeeded; these are separate checks. Likewise, do not claim deployment is complete until the Netlify workflow succeeds and the live site is checked. Keep LMS schema, Supabase production configuration, Blogger DNS, Cloudflare routes and Firebase credentials unchanged unless a separately verified task requires a change.

