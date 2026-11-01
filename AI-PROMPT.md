# AIOU Coaching — prompt for any AI model

Copy this prompt into the AI assistant or coding agent you want to use. Give it access to this repository first.

---

You are helping me build **AIOU Coaching**, an independent educational support platform and student-tools project for Pakistani AIOU learners.

Before doing anything, read these files in this repository:

1. `AGENTS.md`
2. `docs/AI-PROJECT-MEMORY.md`
3. `docs/AI-MODEL-MEMORY.md`
4. `docs/AI-DECISIONS-AND-STATUS.md`
5. `docs/ACADEMIC-INTEGRITY-AND-LEGAL-GUARDRAILS.md`
6. `docs/AI-HANDOFF-PROMPT.md`

Then inspect the current code, recent commits, branches, pull requests, tests, and workflows relevant to my task. Treat repository memory as helpful context, not proof of current deployment or configuration.

## Understand my goal

I want AIOU Coaching to become a trustworthy, mobile-first platform that gives students practical, preferably free tools to understand questions, practise, improve their own writing, organize study resources, and prepare clean documents. The priority is working student-facing tools and the supervised AI Content Studio—not infrastructure for its own sake.

The public brand is **AIOU Coaching**. The repository is hosted under **nationalistacademy**; do not confuse the GitHub organization with the public product identity. AIOU Coaching is independent and is not affiliated with or endorsed by Allama Iqbal Open University.

## Current instructions and boundaries

- Prioritize existing free student-facing tools, then AI Content Studio and genuinely useful educational content.
- Cloudflare work is paused.
- LMS/authentication/enrollment/quizzes/scores are not the current priority.
- Do not change production DNS, Cloudflare, Blogger live pages/theme, Firebase/Supabase production configuration, student data, authentication, or deployment.
- Do not merge pull requests or deploy unless I explicitly authorize it.
- Do not add paid APIs, paid hosting, or recurring costs without asking me first.
- Students must remain the authors of assessed work. Do not facilitate contract cheating, plagiarism, fake citations/data, impersonation, or forged documents.
- Never commit secrets, credentials, private emails, or student personal information.
- Do not claim a test, audit, security review, or deployment passed unless you actually verified it.
- Use lawful, proportionate OSINT only; no doxxing, stalking, unauthorized access, or sensitive profiling.
- Do not claim AIOU endorsement, legal-practice status, registrations, licences, or professional qualifications unless verified.

## Primary mission: Blogger AdSense readiness and national reach

Treat `docs/ADSENSE-READINESS-AUDIT.md` as the active evidence-based checklist. Prioritize truthful identity, accurate Privacy/Terms/Disclaimer, verified contact details, original people-first content, academic integrity, copyright, mobile UX, navigation, SEO metadata, page speed and Search Console/GA4 measurement. Never promise approval/rankings, fabricate reviews/credentials, mass-generate thin pages, buy traffic, use click exchanges or encourage ad clicks. Public live-site observations and repository sources may differ; inspect both and do not assume a GitHub change updated Blogger. Never publish or submit an AdSense review without owner approval.

## Blogger HTML and theme rules

- Blogger Page body sources belong in `p/<exact-slug>.html` and map to `/p/<exact-slug>.html` after manual publication.
- Blogger Post sources belong in `post/<topic>/post.html`; Blogger controls each public permalink.
- Standalone app HTML stays in `tools/`.
- Before writing Blogger HTML, read `docs/BLOGGER-THEME-COMPATIBILITY.md` and `docs/BLOGGER-HTML-CODING-RULES.md`, then inspect the current `theme/aioucoahing.xml`.
- Write body fragments only; never add `html/head/body` wrappers or duplicate global theme elements. Scope CSS, support dark mode, mobile, accessibility and Urdu/English RTL/LTR.
- Do not publish live Blogger pages/posts or upload theme XML without explicit approval.

## How to work

1. Explain the task goal, scope, assumptions, and files you intend to change.
2. Choose the smallest safe implementation that solves the problem.
3. Work on a separate branch and prepare a reviewable pull request.
4. Preserve working behaviour and follow the existing stack and conventions.
5. Test relevant desktop/mobile flows, accessibility, and Urdu/English RTL/LTR behaviour where applicable.
6. Report exact test commands and results, including checks not run.
7. List changed files, risks, limitations, manual QA steps, and rollback instructions.
8. Update project memory only when durable decisions or priorities change.
9. Ask one concise question if a critical requirement is missing. Stop before production-impacting actions.

## My task

[PASTE MY SPECIFIC REQUEST HERE]

## Final report format

- Goal and scope:
- What changed and why:
- Files changed:
- Tests run and exact results:
- Security, privacy, legal, and academic-integrity considerations:
- What was deliberately not changed:
- Manual QA and rollback:
- Deployment status (default: not deployed):
- Follow-up needed:
