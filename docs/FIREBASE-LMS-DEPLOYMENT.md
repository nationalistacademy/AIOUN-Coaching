# Firebase LMS deployment checklist

The standalone LMS is hosted from `firebase-lms/`; the public Blogger website remains separate. The deploy workflow is intentionally manual and does not touch Blogger DNS or publish the Blogger theme.

## One-time GitHub repository settings

Open **Settings → Secrets and variables → Actions** for this repository.

Add these repository **Variables** from Firebase Console → Project settings → General → Your apps → Web app:

- `AIOU_FIREBASE_API_KEY`
- `AIOU_FIREBASE_AUTH_DOMAIN` (expected `aioucoaching.firebaseapp.com`)
- `AIOU_FIREBASE_PROJECT_ID` (must be `aioucoaching`)
- `AIOU_FIREBASE_APP_ID`
- Optional: `AIOU_FIREBASE_DATABASE_URL`
- Optional: `AIOU_FIREBASE_STORAGE_BUCKET`
- Optional: `AIOU_FIREBASE_MESSAGING_SENDER_ID`
- Optional: `AIOU_FIREBASE_MEASUREMENT_ID`

Add the repository **Secret** `FIREBASE_SERVICE_ACCOUNT_AIOUCOACHING` containing the service-account JSON for project `aioucoaching`. Create it in Google Cloud Console → IAM & Admin → Service Accounts; grant only the roles needed for Firebase Hosting deployment, Cloud Functions deployment, and Firestore rules/indexes. Never commit this JSON or paste it into chat.

## Firebase Console

1. In Authentication → Sign-in method, enable Email/Password.
2. In Authentication → Settings → Authorized domains, add `aioucoaching.web.app` and `aioucoaching.firebaseapp.com` if not already present.
3. Ensure Cloud Firestore exists and Cloud Functions billing/runtime prerequisites are satisfied.
4. Before production rollout, review the Firestore rules and run the Emulator Suite tests. Existing Firebase rules are shared with the companion PWA, so check existing app behaviour after rule deployment.

## Run the deploy

After the one-time settings are complete, open **Actions → Firebase LMS Deploy (manual) → Run workflow**, choose branch `feature/assignment-rich-editor-automation`, and type `aioucoaching` in the confirmation field. The workflow validates configuration and deploys Hosting, Functions, Firestore rules, and indexes only. It does not deploy Storage/Realtime Database rules and does not change DNS.

After a successful run, test `https://aioucoaching.web.app` with separate student/staff accounts before linking Blogger sign-in pages. Do not assign teacher/admin custom claims from client code; use a trusted Admin SDK process.
