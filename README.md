<div align="center">

# AIOU Coaching

### Independent study resources and browser-based tools for AIOU students

[![Repository](https://img.shields.io/badge/GitHub-AIOUN--Coaching-181717?style=for-the-badge&logo=github)](https://github.com/nationalistacademy/AIOUN-Coaching)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![Made in Pakistan](https://img.shields.io/badge/Made_in_Pakistan-success?style=for-the-badge)](#)

**Standalone study tools, Blogger resources, and a Supabase-backed learning management system.**

</div>

---

## Project overview

AIOU Coaching is an independent study-support project for Allama Iqbal Open University students. It is **not affiliated with AIOU** and does not issue official degrees, results, admission decisions, or university documents.

- Start with the [tool directory](index.html).
- Use the [Multi-ID AI Studio](tools/studio.html) to send a prompt to configured AI Worker endpoints and compare responses.
- Browse Blogger page and post source in [pages/](pages/README.md) and [posts/](posts/README.md).
- Read the [LMS setup and security guide](lms/README.md) before configuring authentication or using the learning platform.
- Review the [SEO guide](seo/README.md), [GEO guide](geo/README.md), and [Google Search guide](google-search/README.md) for Blogger publishing.

Most study tools are standalone HTML pages. Tools that call an AI model require a configured Worker endpoint and token; the AI service is not automatically available just because the page loads.

## Repository map

| Path | Purpose |
| --- | --- |
| `index.html` | Tool landing page |
| `tools/` | Standalone study, assignment, diagram, and writing tools |
| `js/` | Shared browser-side JavaScript |
| `css/` | Shared theme and studio styles |
| `pages/` | Blogger Page body snippets and publishing guide |
| `posts/` | Blogger Post body template and publishing guide |
| `theme/` | Blogger theme and homepage markup |
| `worker/` | Cloudflare Worker proxy for supported AI tools |
| `lms/` | LMS pages, Supabase browser configuration, and setup guide |
| `supabase/migrations/` | Versioned database security migration SQL |
| `tests/` | Browser QA and real-account LMS security tests |
| `.github/workflows/` | Browser QA, Pages deployment, security E2E, and batch-generation workflows |
| `seo/`, `geo/`, `google-search/` | Search optimization and publishing guides |

The source tree is the source of truth for file names; older references to renamed or removed files should not be used.

## Main study tools

The tool index at [index.html](index.html) is the most reliable current directory. The repository includes tools for:

- Multi-ID AI response comparison and Word export
- Guess-paper and BS/BBA practice-paper preparation
- Assignment writing support and cover pages
- Text rewriting and diagram generation
- Front-page creation, bulk downloads, and blog-post drafting
- Academic report generation and related formatting utilities

Guess papers are for revision and practice only. They are not leaked or official exam papers, and they cannot guarantee exam questions.

## AI Worker configuration

AI-enabled tools that use the Cloudflare Worker follow this general flow:

```text
Browser tool → Cloudflare Worker → AI provider API
```

Keep provider API keys in Worker secrets, never in HTML, JavaScript, Blogger posts, or public repository files. The Worker requires an `AUTH_TOKEN`; configure it as a Worker secret and keep the matching token private. See the [worker/ source directory](worker/) and the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/) before deploying changes.

Example secret setup from the `worker/` directory:

```bash
npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler secret put AUTH_TOKEN
npx wrangler deploy
```

Do not paste secrets into issues, commit history, screenshots, or chat messages. Rotate any token or API key that has been exposed.

## Progressive Web App (PWA)

The repository now includes an installable GitHub Pages study app with a web manifest, app icon, service worker, offline fallback, and runtime caching for previously visited non-LMS pages. Start from the [AIOU Coaching app](https://nationalistacademy.github.io/AIOUN-Coaching/) and use the browser's **Install app / Add to Home screen** option when available.

**Blogger origin limitation:** Blogger does not let a theme upload a same-origin root service-worker file. The Blogger XML therefore provides a branded entry point to the installable companion app; it does not make `aioucoaching.blogspot.com` itself an offline-capable PWA. To make the Blogger hostname itself installable as a PWA, use a custom domain and a same-origin service-worker hosting/proxy arrangement. LMS routes and authentication are intentionally excluded from offline caching.

Offline mode is limited: pages generally need to be visited once while online; external AI Worker calls, authentication, LMS data, and third-party downloads still need a connection.

## Blogger publishing

- [Pages guide](pages/README.md): paste body-only HTML into Blogger **Pages → HTML view**.
- [Posts guide](posts/README.md): use the post-body starter and publishing checklist.
- [SEO guide](seo/README.md): titles, descriptions, internal links, and technical SEO.
- [GEO guide](geo/README.md): concise answer blocks and useful page structure.
- [Google Search guide](google-search/README.md): Search Console, sitemaps, and structured data.

The public blog is [aioucoaching.blogspot.com](https://aioucoaching.blogspot.com/). Editing repository files does **not** automatically publish them to Blogger: paste or upload the relevant content through Blogger and verify the live page afterward.

## LMS deployment and security

The LMS is in [lms/](lms/README.md). It uses Supabase Auth and database row-level security (RLS). Browser-visible Supabase publishable/anon keys are not secrets; **never expose a service-role key or secret API key in client code**.

- [LMS setup, redirects, and security notes](lms/README.md)
- [Database hardening migration](supabase/migrations/20261028000000_harden_lms_enrollment_and_quiz_writes.sql)
- [Real-account security test suite](tests/lms-security.spec.js)
- [Manual LMS security workflow](.github/workflows/lms-security-e2e.yml)

The security test harness is committed, but its real-account run depends on dedicated test users, course/quiz fixtures, and GitHub Actions secrets. See the LMS guide for setup. Do not interpret a committed test file as a passing test result.

## Quality assurance and GitHub Pages

The repository includes a [Browser QA workflow](.github/workflows/browser-qa.yml) and a [GitHub Pages deployment workflow](.github/workflows/deploy-pages.yml). Deployment is intended to be gated on successful Browser QA.

- [View Browser QA runs](https://github.com/nationalistacademy/AIOUN-Coaching/actions/workflows/browser-qa.yml)
- [View Pages deployment runs](https://github.com/nationalistacademy/AIOUN-Coaching/actions/workflows/deploy-pages.yml)
- [View LMS security E2E runs](https://github.com/nationalistacademy/AIOUN-Coaching/actions/workflows/lms-security-e2e.yml)

A workflow being present does not mean the latest run passed or the site is live. Check the latest run's conclusion and the deployed URL before reporting success. For local checks, use the scripts documented in [package.json](package.json) and the relevant workflow file.

## Security and privacy checklist

- Do not commit passwords, OAuth client secrets, service-role keys, or AI provider keys.
- Assign LMS staff roles only through trusted Supabase admin/server tooling using `app_metadata.role`; never trust user-editable metadata for authorization.
- Keep LMS test accounts and fixtures separate from production data.
- Confirm Supabase Auth redirect URLs match the actual deployed origin.
- Review changes to RLS policies and database functions before applying migrations.
- Use official university sources to verify dates, eligibility, fees, and results.

## License

This repository includes an [MIT License](LICENSE). Third-party libraries and services remain subject to their own terms.
