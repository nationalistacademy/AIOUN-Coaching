# AIOU Coaching Firebase (non-LMS PWA)

This folder adds Firebase Web SDK scaffolding for the public study-tools companion app. It does not redesign, cache, or authorize any LMS route.

## Included
- `config.js`: supplied public Firebase Web App config for project `aioucoaching`; this is browser-visible by design. `config.example.js` remains an empty template.
- `client.js`: modular SDK helpers for email/password Auth, profile creation, password reset, notification reads, private uploads, and FCM token registration.
- `index.html`: responsive account, upload and notifications starter UI.
- `messaging-sw.js`: background notification worker, separate from the root PWA worker.
- Root `firestore.rules`, `storage.rules`, and `database.rules.json`: private-user rules plus deny-by-default Realtime Database rules.
- Root `firebase.json` and `functions/index.js`: Cloud Function sender restricted to a trusted `admin: true` custom claim.

## Configure
1. Register the actual web app and authorized production origin(s) in Firebase Console.
2. Confirm `config.js` matches the Firebase Console Web App config. The provided config is committed because it contains only public client identifiers. Add the FCM Web Push VAPID public key from Project settings > Cloud Messaging before enabling push notifications.
3. In Firebase Console, enable Email/Password in Authentication, create Firestore and Storage, and separately confirm Realtime Database is provisioned. Review and deploy the root Firestore/Storage rules and appropriate Realtime Database rules before allowing user data.
4. Install Functions dependencies with `npm --prefix functions install`, then deploy after selecting the correct project: `firebase deploy --only database,firestore:rules,storage,functions`.
5. Grant the `admin: true` custom claim only through a trusted Admin SDK environment after verifying the operator identity. Never set it from a browser or user profile.
6. Test in a non-production Firebase project: two users, cross-user read denial, unauthorized writes, upload restrictions, token ownership, and admin-only sender denial for non-admin users.
7. Add App Check where practical and review the rules before production.

## Security boundaries
- Admin rules require a trusted custom claim (`admin: true`) set server-side with the Admin SDK. Never trust a client-editable role.
- Push tokens are registered by the signed-in user's client. The callable `sendUserNotification` function targets one user per call and requires a trusted `admin: true` custom claim. Never put server credentials in browser code.
- Uploads are limited to 10 MB and an allow-list. MIME checks are not malware scanning.
- Firebase Storage download URLs are bearer links; keep them private.
- These rules intentionally exclude LMS data, enrollment, quizzes, scores and staff/student authorization. Do not point LMS pages at this module without separate security design and tests.
- Never commit service-account JSON, private keys or Cloudflare API tokens.

## Notification sender behavior

The callable function writes an in-app notification under the target user's own notification collection and sends FCM to that user's registered browser tokens. It validates input lengths and rejects absolute/external URLs. Invalid/stale registration tokens are removed. This starter intentionally sends to one UID per call; bulk campaigns need separate authorization, rate limits, audit logging and consent handling.
