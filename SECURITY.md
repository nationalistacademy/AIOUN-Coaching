# Security Policy

## Scope
This repository contains public study-support pages and tools, plus separate experimental Firebase and LMS-related code. A code review or passing static test is not proof that a cloud service is production-secure.

## Reporting a vulnerability
Please do not publish exploitable details, student data, credentials or tokens in a public issue. Contact the repository maintainers privately through the GitHub repository's available security reporting channel. Include the affected path, impact, reproduction steps and a safe proof of concept. Do not access, modify or download another person's data while testing.

## Sensitive data rules
- Never commit passwords, API secrets, Firebase service-account JSON, Admin SDK keys, private keys, Cloudflare tokens or production database credentials.
- Treat Firebase web configuration as public client configuration, not as authorization. Enforce access with Security Rules and trusted server-side checks.
- Do not put quiz answer keys, staff privileges or trusted role decisions in browser-controlled code.
- Never commit real student names, roll numbers, GR numbers, marks, phone numbers or identity documents. Use clearly fictitious fixtures.
- Do not use production student accounts for automated tests.

## Student privacy
- Prefer local-first processing for standalone tools.
- Clearly disclose browser storage, file export and any network transmission.
- Minimize collection and retention. Do not add analytics or third-party tracking without explicit review.
- Ensure exports and print views contain only information the user intentionally entered.

## Security-sensitive changes
Changes to authentication, authorization, Firestore/Supabase rules, server functions, secrets, DNS, hosting routes or production deployment require a dedicated review and explicit approval. A draft pull request must not be described as deployed or production-ready.
