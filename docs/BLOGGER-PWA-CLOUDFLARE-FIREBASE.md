# Blogger PWA, Cloudflare and Firebase setup

## What is in the repository

- `theme/aioucoahing.xml` includes a **PWA Install / Firebase Setup** gadget in Blogger Layout.
- The gadget is responsive, offers an install button when supported, and displays a Firebase setup status.
- `firebase-config.example.js` is a safe starter template with empty values.
- The installable companion app remains hosted on GitHub Pages. The Blogger blog itself is **not yet a full offline PWA** just because the layout gadget is present.

## 1. Customize the PWA section in Blogger Layout

1. Back up your current Blogger theme.
2. Open **Blogger → Theme → Restore/Upload** and upload `theme/aioucoahing.xml`.
3. Open **Blogger → Layout**.
4. Find **PWA Install and Firebase** / **PWA Install / Firebase Setup**.
5. Edit the gadget's content or move it where you want. Keep the install link pointing to the published app.
6. Check mobile and desktop views.

Repository changes do not automatically upload the theme to Blogger.

## 2. Firebase configuration

No Firebase project configuration was found in the repository, so Firebase is deliberately shown as **not connected**. Do not invent project IDs or keys.

1. Open the Firebase Console and select/create the intended project.
2. Add a **Web app** under Project settings → Your apps.
3. Copy the web app configuration (`apiKey`, `authDomain`, `projectId`, `appId`, and optional fields) into a copy of `firebase-config.example.js`.
4. Decide which Firebase feature is needed before adding its SDK: Authentication, Firestore, Storage, or Cloud Messaging each needs separate implementation and security rules.
5. Load only the SDKs for the selected feature, and load the config script before the PWA widget initializer. Never put service-account JSON, Admin SDK private keys, private server credentials, or Cloudflare API tokens into Blogger HTML.
6. Configure Firebase Authentication authorized domains and strict Firestore/Storage Security Rules before collecting user data.

The current Blogger gadget does not enable login, database access, file uploads, push notifications, or LMS functionality. It only reports whether a compatible config/SDK is available. LMS remains excluded from the PWA changes.

## 3. Cloudflare and same-origin service worker

A service worker must be served from the **same origin** it controls. The Blogger `blogspot.com` host cannot serve a root-level `/sw.js` from this repository. Cloudflare cannot attach a Worker route to the shared `blogspot.com` domain.

For a full offline PWA on the blog itself, you need a domain you control, added to Blogger as its custom domain and managed/proxied through Cloudflare. Then deploy a Worker that safely serves the blog and the root-scoped service worker on that same custom domain. Do not switch DNS or route all traffic through a Worker until the origin mapping and rollback path are tested.

No Cloudflare account, zone, custom domain, Worker route, or API credentials were available in this repository inspection, so this change does not claim that Cloudflare is deployed or modify any DNS.

## 4. Validation checklist

- [ ] Upload XML to Blogger and confirm the theme saves without XML errors.
- [ ] Confirm the PWA gadget appears under Blogger Layout.
- [ ] Confirm the install button appears only when supported by the browser.
- [ ] Confirm Firebase remains “not connected” until a real Web App config and SDK are provided.
- [ ] Confirm no service-account keys or private tokens are in GitHub.
- [ ] Keep LMS/authenticated routes out of public PWA caches.
- [ ] For full blog offline support, verify a custom domain and same-origin Worker/service-worker design first.
