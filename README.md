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
- Blogger SEO implementation and upload checklist: [docs/BLOGGER-SEO-IMPLEMENTATION.md](docs/BLOGGER-SEO-IMPLEMENTATION.md)
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

## Python + TypeScript study tooling

The repository now includes an offline-first Python companion and shared TypeScript AI contracts:

- Python helper: `python/aiou_ai.py` — assignment structure audit, practice-question drafting from student-supplied topics, and optional local Ollama model calls.
- Python tests: `python/test_aiou_ai.py`; run with `python -m unittest discover -s python -p 'test_*.py' -v`.
- Python setup and privacy notes: [python/README.md](python/README.md).
- Shared typed contracts: [types/ai-contracts.ts](types/ai-contracts.ts).
- Browser QA workflow runs the Python unit tests before Playwright.

The Python helper runs locally and has no paid API dependency. It is not a hosted Python service and is not deployed by the static Netlify workflow. The existing browser AI Studio continues to use the student's configured Cloudflare Worker. Optional local model generation uses Ollama on the student's own machine. Keep API tokens and private student data out of source control and public prompts.

Practice questions are revision material derived from supplied course text, not actual, leaked or predicted exam questions. Automated assignment checks are structural feedback, not proof of originality, factual accuracy, citation validity or compliance with the latest AIOU manual.



## Free local AI with Ollama

The AI Studio can use a local Ollama model first, with the existing configured Cloudflare Worker IDs as fallback. Prompts sent to Ollama go to `127.0.0.1` on the student's own computer; no paid AI API key is needed for that local route.

1. Install Ollama from [ollama.com](https://ollama.com/).
2. Pull a starter model: `ollama pull qwen2.5:3b`.
3. Start Ollama with the AIOU Coaching origins allowed (Linux/macOS example): `OLLAMA_ORIGINS=https://aioucoaching.netlify.app,https://aioucoaching.blogspot.com ollama serve`. Restart the Ollama service after changing origins.
4. Open **AI Studio → Free Local AI — Ollama**, enable it, save, then test the connection.

Ollama must be running on the same device/browser that opens the site. The browser may show a local-network permission prompt. If the local model is unavailable, use the existing Worker fallback. Model speed and quality depend on local RAM/CPU/GPU. Never expose Ollama's port publicly; keep it bound to loopback. The local provider is integrated in the Multi-ID AI Studio; other standalone tools are not automatically switched to Ollama by this change.
