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
- Blogger Page HTML sources: [p/](p/README.md) (maps to Blogger `/p/<slug>.html` after manual publication)
- Blogger Post HTML sources: [post/](post/README.md) (Blogger controls public post permalinks)
- Blogger theme: [theme/aioucoahing.xml](theme/aioucoahing.xml)
- Blogger theme compatibility: [docs/BLOGGER-THEME-COMPATIBILITY.md](docs/BLOGGER-THEME-COMPATIBILITY.md)
- Blogger HTML coding and QA rules: [docs/BLOGGER-HTML-CODING-RULES.md](docs/BLOGGER-HTML-CODING-RULES.md)
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

**Poora Blogger deploy ek page par:** [docs/BLOGGER-DEPLOY.md](docs/BLOGGER-DEPLOY.md) — theme upload, page-by-page paste list, live URL statuses, menu aur Search Console.


## Blogger source folders

Use `p/<slug>.html` for Blogger Page body fragments and `post/<topic>/post.html` for Blogger Post sources. Keep standalone application documents in `tools/`. Read the compatibility and QA rules before generating page/post HTML. Commits do not publish to Blogger.

## AI agent memory and contribution rules
Start with the copy/paste [AI prompt](AI-PROMPT.md) when handing this repository to another AI model.

To hand this project to another AI assistant or developer, start with [AGENTS.md](AGENTS.md), then read:
- [Project memory](docs/AI-PROJECT-MEMORY.md)
- [Quick model memory card](docs/AI-MODEL-MEMORY.md)
- [Decisions and current priorities](docs/AI-DECISIONS-AND-STATUS.md)
- [Academic integrity, legal and privacy guardrails](docs/ACADEMIC-INTEGRITY-AND-LEGAL-GUARDRAILS.md)
- [Copy/paste AI handoff prompt](docs/AI-HANDOFF-PROMPT.md)

These files preserve product intent and safety boundaries across AI models. Always verify live code, branches, deployments, and provider configuration because memory notes can become stale.
