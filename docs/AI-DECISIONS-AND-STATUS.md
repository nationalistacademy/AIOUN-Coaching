# AIOU Coaching — decisions, priorities, and current status

_Last updated: 2026-11-02. Re-check repository and deployment state before relying on status notes._

## Durable decisions
| Area | Decision |
|---|---|
| Public brand | AIOU Coaching |
| Code host | nationalistacademy/AIOUN-Coaching |
| Public website | https://aioucoaching.blogspot.com/ |
| Institutional status | Independent educational support; not affiliated with AIOU |
| Primary product priority | Student-facing free tools and useful educational resources |
| AI role | Drafting, explanation, practice, and feedback; human review required |
| Student authorship | Students retain ownership and responsibility for assessed work |
| Cost policy | No paid APIs/hosting or recurring cost without explicit owner approval |
| Release policy | Branch + reviewable PR; no merge/deploy without authorization |
| Cloudflare | Paused until owner explicitly resumes |
| LMS | Deprioritized; do not expand without explicit request |
| Production changes | No DNS, Blogger live edits, Worker routes, auth, student data, or production config without explicit approval |
| Blogger Page sources | Root `p/<slug>.html`; body fragments mapped to `/p/<slug>.html` after manual publication |
| Blogger Post sources | Root `post/<topic>/post.html`; Blogger controls public post permalinks |
| Standalone app HTML | Keep in `tools/`; do not mix with Blogger body fragments |
| Blogger theme contract | Read `docs/BLOGGER-THEME-COMPATIBILITY.md` and `docs/BLOGGER-HTML-CODING-RULES.md` before writing HTML |

## Current work priority
1. Audit and improve existing free tools; fix actual broken student-facing flows.
2. Improve the AI Content Studio with transparent, safe, review-first workflows.
3. Ensure mobile usability, Urdu/English/RTL support, accessibility, performance, and privacy.
4. Improve educational resource quality and trust/SEO.
5. Revisit LMS and infrastructure only after explicit reprioritization.

## Historical project context (not a verified live status)
- A student assignment/document editor was discussed, including rich text, tables, Urdu/English, diagrams, watermark, and DOCX/PDF export.
- AI Content Studio was discussed as a content drafting tool.
- Repository README describes Firebase starter components and a separate Supabase-backed LMS.
- Prior Cloudflare/security and AI Studio changes were discussed in draft PRs #17 and #19. Their current state must be checked on GitHub; do not assume they remain draft or unmerged.
- Prior workflow/deployment problems were discussed. Check Actions logs before asserting they are fixed.
- The owner previously asked that public Blogger pages remain on Blogger and that LMS/infra not displace student tools.

## Release gates
Before a PR is considered ready:
- [ ] Scope matches an explicit owner request.
- [ ] No secrets, personal inbox data, or student PII in the diff.
- [ ] No unapproved paid dependency or provider.
- [ ] Academic integrity and legal disclaimers remain clear.
- [ ] Mobile and desktop behaviour checked.
- [ ] Urdu/English and RTL/LTR checked where relevant.
- [ ] Accessibility and keyboard operation checked.
- [ ] Relevant tests/build/lint run and results recorded.
- [ ] No production deployment performed unless explicitly approved.

## Change log
### 2026-11-02
- Added cross-model project memory and agent operating instructions on a dedicated documentation branch.
- Reaffirmed free student-facing tools as the first priority; Cloudflare paused; LMS not to be expanded without request.
- Standardized Blogger Page/Post source folders and added cross-model theme-compatibility and HTML QA rules.
