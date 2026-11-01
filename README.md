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

**Poora Blogger deploy ek page par:** [docs/BLOGGER-DEPLOY.md](docs/BLOGGER-DEPLOY.md) — theme upload, page-by-page paste list, live URL statuses, menu aur Search Console.

## Professional coaching and business foundation
AIOU Coaching is an education and professional-coaching project operated by Nationalist Academy, a sole proprietorship operated by Faiez Mehmood in Karachi, Pakistan. Official contact: faiezbinhafeez@gmail.com. The proprietor has stated that NTN status is registered; the identifier is not published here.

Phase 1 business documents: [Business plan](business/business-plan.md), [Service catalog](business/service-catalog.md), [Pricing policy](business/pricing-policy.md), [Client workflow](business/client-workflow.md), [Professional and legal boundaries](business/legal-boundaries.md), and [Phase 1 checklist](docs/PHASE-1-BUSINESS-FOUNDATION.md).

The business is not represented as an incorporated company, law firm, university, NGO, charity or government institution. Legal content is limited to general information unless appropriately qualified and authorized professionals are separately engaged. Public publishing and client-facing automation require human approval.
