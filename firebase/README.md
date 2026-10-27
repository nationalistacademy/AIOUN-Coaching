# AIOU Coaching Firebase (non-LMS PWA)

This folder adds Firebase Web SDK scaffolding for the public study-tools companion app. It does not redesign, cache, or authorize any LMS route.

## Included

- `config.example.js`: empty template; copy to `config.js` and fill it from the intended Firebase Web App settings.
- `client.js`: modular Web SDK helpers for email/password Auth, profile document creation, password reset, reading own notifications, restricted file uploads, and opt-in FCM push token registration.
- `messaging-sw.js`: separate background notification worker, scoped under `/firebase/` so it does not replace the existing PWA service worker.
- Repository-root `firestore.rules` and `storage.rules`: starter deny-by-default rules.

## Configure

1. In Firebase Console, create/select the correct project and register the exact production web origin(s) under Authentication → Settings → Authorized domains.
2. Copy `config.example.js` to `config.js`; fill the actual Web App config. For push, set `vapidKey` from Cloud Messaging → Web Push certificates.
3. Configure Email/Password under Authentication → Sign-in method.
4. Create Firestore and Storage, then review and deploy `firestore.rules` and `storage.rules`.
5. Test sign-up/sign-in, cross-user document reads, denied writes, file MIME/size restrictions, and token ownership in a non-production Firebase project before enabling for real users.
6. Keep `config.js` out of Git. Firebase web config is not a server secret, but its project access must be protected by Auth, Security Rules, and App Check where practical.

## Important boundaries

- Do not store a role in a user-editable profile and trust it for authorization. Admin-only rules require a trusted Firebase custom claim (`admin: true`) set with the Admin SDK in a secured server environment.
- Push tokens are registered by the signed-in user's client. Sending pushes to users or groups requires a trusted server (for example Cloud Functions) using the Admin SDK. Never put Admin SDK credentials in the browser.
- Uploads are limited to 10 MB and a MIME allow-list in both client helper and Storage rules; MIME is not a substitute for malware scanning.
- The client helper stores upload paths only in its return value; add a dedicated metadata collection with rules if the product needs persistent upload listings.
- These rules intentionally do not include LMS data, enrollment, quizzes, scores, or staff/student authorization. Do not point existing LMS pages at this Firebase module without a separate security design and tests.
- `firebase/config.js` is ignored by Git; deploy it to the hosting origin using your normal protected deployment process. Never commit private keys, service-account JSON, or Cloudflare API tokens.
