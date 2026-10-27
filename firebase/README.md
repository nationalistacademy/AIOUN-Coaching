# AIOU Coaching Firebase (non-LMS PWA)

This folder adds Firebase Web SDK scaffolding for the public study-tools companion app. It does not redesign, cache, or authorize any LMS route.

## Included
- `config.example.js`: empty template; copy to `config.js` and fill from Firebase Console.
- `client.js`: modular SDK helpers for email/password Auth, profile creation, password reset, notification reads, private uploads, and FCM token registration.
- `index.html`: responsive account, upload and notifications starter UI.
- `messaging-sw.js`: background notification worker, separate from the root PWA worker.
- Root `firestore.rules` and `storage.rules`: deny-by-default starter rules.

## Configure
1. Register the actual web app and authorized production origin(s) in Firebase Console.
2. Copy `config.example.js` to `config.js`; fill actual web app values and the FCM VAPID public key. The local config is ignored by Git.
3. Enable Email/Password in Authentication, create Firestore and Storage, and review/deploy the root security rules.
4. Test in a non-production Firebase project: two users, cross-user read denial, unauthorized writes, upload restrictions, and push token ownership.
5. Add App Check where practical and review the rules before production.

## Security boundaries
- Admin rules require a trusted custom claim (`admin: true`) set server-side with the Admin SDK. Never trust a client-editable role.
- Push tokens are registered by the signed-in user's client. Sending to users/groups requires a trusted Cloud Function/server using Admin SDK; never put server credentials in browser code.
- Uploads are limited to 10 MB and an allow-list. MIME checks are not malware scanning.
- Firebase Storage download URLs are bearer links; keep them private.
- These rules intentionally exclude LMS data, enrollment, quizzes, scores and staff/student authorization. Do not point LMS pages at this module without separate security design and tests.
- Never commit service-account JSON, private keys or Cloudflare API tokens.
