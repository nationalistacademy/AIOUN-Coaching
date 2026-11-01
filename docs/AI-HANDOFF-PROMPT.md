# Copy/paste handoff prompt for any AI model

You are helping develop **AIOU Coaching**, an independent educational support website and student-tools project for Pakistani AIOU learners.

## First read
Read these repository files before acting:
1. `AGENTS.md`
2. `docs/AI-PROJECT-MEMORY.md`
3. `docs/AI-DECISIONS-AND-STATUS.md`
4. `docs/ACADEMIC-INTEGRITY-AND-LEGAL-GUARDRAILS.md`
5. The relevant source files, tests, workflows, and recent PRs for the requested task.

## Understand the mission
The main goal is to give students free, practical tools that help them understand questions, practise, improve their own writing, and produce clean study documents. Prioritize working student-facing tools and the AI Content Studio. The public brand is AIOU Coaching; the repository owner is nationalistacademy. AIOU Coaching is independent and is not affiliated with AIOU.

## Current boundaries
- Cloudflare work is paused.
- LMS/auth/quiz/enrollment/score work is not the current priority.
- Do not change DNS, Cloudflare, Blogger live pages/theme, Firebase/Supabase production settings, student data, or deployments.
- Do not merge or deploy. Work on a branch and prepare a reviewable PR.
- No paid API, hosting, or recurring-cost dependencies without owner approval.
- Students must remain the authors of assessed work. No contract cheating, plagiarism, fake research, or fabricated citations.
- Never commit secrets or personal/student data.
- Verify current repository state; these notes may be stale.

## Blogger HTML and theme rules
- Blogger Page body sources: `p/<exact-slug>.html` → public `/p/<exact-slug>.html` after manual publication.
- Blogger Post sources: `post/<topic>/post.html`; Blogger controls the public permalink.
- Standalone app HTML remains in `tools/`.
- Read `docs/BLOGGER-THEME-COMPATIBILITY.md` and `docs/BLOGGER-HTML-CODING-RULES.md`; inspect `theme/aioucoahing.xml` before coding.
- Write body fragments only, never full document wrappers. Scope CSS and preserve JetTheme tokens, dark mode, responsive behaviour, accessibility and RTL/LTR.
- Never publish Blogger content or upload XML without explicit owner approval.

## Work method
1. Inspect repository and identify the smallest safe change that achieves the request.
2. Summarize goal, scope, assumptions, and files to touch.
3. Implement without unrelated rewrites.
4. Test relevant flows, mobile/desktop, accessibility, and Urdu/English RTL/LTR where applicable.
5. Report exact tests and results; do not claim unrun checks passed.
6. Provide changed files, known limitations, manual QA, and rollback guidance.
7. Update project memory/decision docs if a durable decision or priority changed.

## Communication
Explain technical trade-offs simply and directly. When communicating with the owner, prefer Roman Urdu if appropriate. Ask one concise question if a critical requirement is missing. Stop before any production-impacting action unless explicit approval is given.

## Task requested by owner
[PASTE THE SPECIFIC TASK HERE]

## Required final report
- What changed:
- Why:
- Files changed:
- Tests run and results:
- Security/privacy/legal considerations:
- What was not changed:
- Deployment status (default: not deployed):
- Follow-up needed:
