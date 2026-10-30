# AIOU Coaching Repository Roadmap

Last reviewed: 2026-10-30

## Product direction
A mobile-first, low-cost study-support toolkit for AIOU learners. Blogger remains the public content and SEO destination; this repository holds companion tools and separately scoped technical experiments. This project is independent and is not affiliated with AIOU.

## Workstream order

### 1. Student tools — current priority
- Audit every tool in `tools/` for mobile layout, keyboard/accessibility, input validation, output quality and browser-console errors.
- Fix broken actions and export/print defects before adding more features.
- Keep each standalone tool independently usable where practical.
- Prefer local processing and transparent browser-local storage.
- Build a tool catalogue with purpose, status, supported inputs/outputs and known limitations.

### 2. Repository quality
- Maintain a single clearly documented browser QA path.
- Add regression tests for every fixed bug.
- Keep dependencies minimal and lock dependency versions.
- Add contribution, security, privacy and release guidance.
- Separate preview checks from production deployment.

### 3. Blogger companion / PWA
- Keep Blogger as the public-facing site.
- Validate the Blogger XML separately before manual upload.
- Do not change DNS, Cloudflare Worker routes, origin routing or custom-domain settings without a verified plan and explicit approval.
- Keep authentication and private application routes out of public service-worker caches.

### 4. AI-assisted features — deferred
AI/API-dependent tools remain untouched until explicitly reprioritized. Do not introduce paid APIs, subscriptions or hosting costs.

### 5. LMS and cloud services — separate / on hold
Firebase, Supabase, enrollment, authentication, quiz grading, student records and staff authorization are separate security-sensitive workstreams. Do not alter them during student-tool maintenance. Require dedicated test accounts, rules/emulator tests, end-to-end acceptance checks and explicit approval before production actions.

## Current review queue (2026-10-30)
The following are open draft pull requests and must be reviewed for overlap and test status before merging:
- #2 — LMS practice hub and quiz progress.
- #3 — assignment writing studio / Firebase LMS work.
- #4 and #5 — PWA install flow.
- #6 — free-tool QA workflow cleanup and disabling placeholder Azure automation.
- #7 — Python study-resource generator.
- #8 — standalone School Result Manager.

Do not assume these branches are integrated with one another. Some target different base commits. Resolve dependencies and review the combined result before merging.

## Immediate acceptance gates
1. Fix or intentionally retire the legacy Node.js CI job that currently fails before running tests.
2. Make Browser QA the authoritative test workflow and confirm its latest result on each candidate commit.
3. Investigate Cloudflare preview build failures separately; do not infer a cause without build logs.
4. Run browser checks for every changed student tool, including import/export and print paths.
5. Review PRs #6–#8 for conflicts, duplicated scope and security/privacy notes.
6. Only after review and owner approval should selected PRs be merged. Production publication and DNS changes remain separate approvals.

## Definition of done
A change is complete only when its intended behavior is implemented, automated checks pass, important manual flows are verified, privacy/security implications are documented, and the PR states exactly what was not tested. Merge and deployment status must be reported separately.
