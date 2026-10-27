# Blogger PWA, Cloudflare and Firebase setup

## Repository changes
- `theme/aioucoahing.xml` has a responsive PWA/Firebase gadget for Blogger Layout.
- `firebase/` contains a separate Firebase account/files/notifications starter.
- Root `firestore.rules` and `storage.rules` are deny-by-default starter rules.
- `firebase/config.example.js` has empty placeholders. No Firebase project credentials were found or invented.

## Blogger layout
1. Back up Blogger Theme, then upload `theme/aioucoahing.xml` through Blogger → Theme → Restore/Upload.
2. Open Blogger → Layout and locate **PWA Install and Firebase**.
3. Save and check mobile/desktop. Repository changes do not automatically update Blogger.

## Firebase features
1. Select/create the intended Firebase project and register the actual Web App.
2. Add the exact production origin(s) under Authentication → Settings → Authorized domains.
3. Copy `firebase/config.example.js` to `firebase/config.js` locally and fill real values from Firebase Console, including the FCM Web Push VAPID public key. `config.js` is ignored by Git.
4. Enable Email/Password, create Firestore and Storage, then review/deploy root `firestore.rules` and `storage.rules`.
5. Visit `/firebase/` on the deployed companion app to test account creation, sign-in, password reset, private file upload and push-token registration.
6. Test with two users in a non-production project before real users.

The starter supports Auth, Firestore profile/notification reads, Storage uploads, FCM token registration, and a callable Cloud Function that sends to one target user only when the caller has a trusted `admin: true` custom claim. The function writes the in-app notification and sends to that user's registered browser tokens. It is not a bulk campaign system. Never put Admin SDK credentials or Cloudflare API tokens in browser code.

## Cloudflare custom domain and same-origin PWA
You confirmed a custom domain is connected through Cloudflare, but its exact hostname and current origin/route settings were not supplied or verified in this repository. No DNS, proxy, Worker route, or production hosting settings were changed.

Before configuring a root-scoped service worker for Blogger, verify the exact hostname in Blogger and Cloudflare, DNS records/proxy mode/TLS, whether it points at Blogger or Pages, the intended Worker route, and a rollback procedure. A service worker must be served from the same origin it controls. Do not route the whole Blogger site through a new Worker until origin routing, caching exclusions, redirects and rollback are tested.

The companion app's root PWA worker continues to exclude LMS routes/auth paths from caching. Firebase push uses its own worker and does not replace the root worker.

## Security boundaries
- Never commit service-account JSON, Admin SDK private keys, server secrets or Cloudflare API tokens.
- Firebase web config is client-visible; protect data with Auth and Security Rules.
- Admin access must use trusted server-side custom claims, never user-editable profile fields.
- LMS enrollment, quizzes, scores, staff roles and authenticated LMS routes remain outside this Firebase implementation and excluded from PWA caching/redesign.
