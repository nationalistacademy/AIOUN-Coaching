# Free Google Indexing Setup Runbook — AIOU Coaching
Updated: 2026-11-03

This runbook uses Blogger, Google Search Console, a normal browser, and repository source only. No paid automation or crawler is required.

## Current limitation
Public homepage, About, Contact, robots.txt and sitemap.xml were accessible. The Google account used for the read-only audit did not expose the AIOU Coaching Search Console property, so no page-indexing counts or live URL Inspection results can be verified yet.

## A. Add/verify the free Search Console property
1. Sign in to the Google account that owns/manages the AIOU Coaching Blogger blog.
2. Open Google Search Console and use **Add property → URL prefix**.
3. Enter exactly `https://aioucoaching.blogspot.com/`.
4. Complete Google's own verification flow. If Blogger ownership verification is offered, follow the instructions shown by Google/Blogger. Do not share passwords, OTPs or recovery codes.
5. Confirm the property appears in the property selector.

## B. Submit the built-in Blogger sitemap
1. Open the verified property.
2. Go to **Sitemaps**.
3. Submit `sitemap.xml` (full URL: `https://aioucoaching.blogspot.com/sitemap.xml`).
4. Do not submit HTML sitemap pages as XML sitemaps.

## C. Check public indexability
Run URL Inspection → **Test Live URL** for:
- `https://aioucoaching.blogspot.com/`
- `https://aioucoaching.blogspot.com/p/about.html`
- `https://aioucoaching.blogspot.com/p/contact.html`

For each, confirm fetch succeeds, indexing is allowed, and Google-selected canonical matches the intended canonical. Request indexing only after the test passes.

## D. Keep private/student routes out of Google
Do not submit or promote sign-in, dashboard, admin, course progress, quiz result, reset-password, or student-private pages for indexing. Public study guides and tools landing pages may be eligible if they provide distinct useful content and no private data.

## E. Free verification
- In Blogger **Settings → Privacy**, confirm search-engine visibility is enabled.
- In **Settings → Crawlers and indexing**, inspect custom robots header tags before changing them.
- Keep search/archive/duplicate parameter URLs noindex where appropriate.
- Confirm robots.txt allows public pages and sitemap.xml is accessible.
- Check Page indexing and Search performance weekly.

## Theme source note
Repository theme `theme/aioucoahing.xml` contains a canonical based on Blogger's `data:view.url.canonical` and sets normal pages to `index, follow`, while search/archive/error views are noindex. This is source-code evidence only; it does not prove the same theme is live on Blogger.

## Safety
Do not change DNS, Cloudflare, redirects, theme, robots.txt, LMS, Firebase, Supabase, or private routes as part of this runbook without a separate verified change plan. No paid tools or subscription are required.
