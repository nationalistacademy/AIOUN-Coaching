# AIOU Coaching — persistent project memory for AI models

_Last reviewed: 2026-11-02. This is a maintained project brief, not a claim that every remembered item has been re-verified against the live product._

## 1. What this project is
AIOU Coaching is an independent educational support website and tools project for learners associated with Allama Iqbal Open University (AIOU), Pakistan. Its purpose is to help students understand course questions, practise, organize study work, improve their own drafts, and create clean study documents.

**Public website:** https://aioucoaching.blogspot.com/  
**GitHub repository:** https://github.com/nationalistacademy/AIOUN-Coaching  
**Public product name:** AIOU Coaching  
**Repository owner/organization:** nationalistacademy  
**Affiliation:** Independent; not an official AIOU website and not endorsed by AIOU.

## 2. Owner's product philosophy
- Build useful tools for students first, not infrastructure for its own sake.
- Keep the essential student-facing experience free wherever practical.
- Avoid paid APIs and recurring hosting costs unless the owner approves them first.
- Make the experience feel like a polished mobile app while remaining responsive on desktop.
- Prefer practical, working features over promises, mock buttons, or decorative UI.
- Explain technical decisions in accessible Roman Urdu when communicating with the owner.
- Keep a long-term strategy: trust, academic integrity, privacy, quality, accessibility, and sustainable operations.

## 3. Audience and learning needs
The intended audience includes Pakistani distance learners and working students across AIOU programmes and levels. Historical content planning covered Matric/SSC through higher education (including BS and postgraduate learners). Do not assume every programme/course is currently supported; verify coverage before advertising it.

Typical needs:
- Understand an assignment question and its command words.
- Find reliable course-related study resources and past/practice papers.
- Practise MCQs and mock questions with explanations.
- Check spelling, clarity, structure, and formatting in their own writing.
- Produce a readable document in Urdu, English, or mixed Urdu/English.
- Export or print study notes and student-authored drafts.
- Understand deadlines, workshops, books, roll-number slips, and student processes using official/current sources.

## 4. Main product areas
### Student-facing tools (current priority)
The owner has repeatedly prioritized free tools over LMS development. The envisioned assignment/study document builder should support:
- Urdu and English writing, with RTL/LTR-aware editing.
- Headings, bold/italic, lists, tables, and mathematical notation where feasible.
- Student-added images/diagrams.
- Clean print layout and export (DOCX/PDF only when implemented and tested).
- Copy/paste-friendly output and a mobile-first editor.
- Clear distinction between a student's own work and AI-generated suggestions.

A prior path discussed for a tool prototype was `tools/Aiou-solved-assignment-builder.html`; inspect the current repository before assuming this path exists or is active.

### AI Content Studio
A content/study drafting experience exists or has been planned in `tools/studio.html` (verify current implementation). It should be a supervised assistant, not an automatic submission or publishing system. The user must review, fact-check, edit, and approve outputs.

### Educational content and Blogger
The Blogger site is a key public distribution channel. Content areas discussed include solved/practice assignment guidance, guess/practice papers, past papers, notes, course-code resources, workshop and admission guidance, and student process explainers. Content must be accurate, genuinely useful, current-dated where necessary, and not mass-produced filler.

### LMS and authentication
An LMS and quiz roadmap has existed, including student progress and authorization requirements. The owner has explicitly deprioritized LMS work in favour of free student-facing tools. Do not expand, migrate, deploy, or alter LMS/auth/quiz/enrollment/score/student-data systems unless asked.

## 5. Technical context (verify before changing)
The repository README describes:
- Blogger resources and a separate Supabase-backed LMS.
- A Firebase non-LMS starter with Auth/profile documents, password reset, private uploads, notification reads, FCM token registration, and callable Cloud Function.
- Firebase rules and functions in the repository.
- A Blogger theme XML that must be uploaded manually by the owner.
- A separate PWA/Cloudflare companion-app guide.

This describes repository documentation, not a guarantee that any service is configured, secure, or deployed. Inspect source, GitHub Actions, provider dashboards (only through authorized integrations), and current deployment state before making claims.

Known prior owner direction:
- Cloudflare Worker/AI work is paused.
- Do not change DNS, Cloudflare routes, Blogger live theme, Firebase/Supabase production configuration, or deploy without explicit approval.
- Do not assume an old PR or branch is merged or current; verify live GitHub state.

## 6. Content and SEO principles
- Helpful-first, human-readable Urdu/English mix where appropriate.
- Accurate titles and descriptions; clear headings; useful navigation; internal links that genuinely help.
- Explain source, date, and uncertainty for time-sensitive AIOU information.
- Prefer official AIOU sources for policies, dates, course codes, forms, and procedures.
- Do not invent official notices, tutor details, course outlines, deadlines, marks, or success rates.
- Avoid keyword stuffing, doorway pages, thin pages, copied content, fake reviews, fabricated author expertise, or guaranteed ranking claims.
- AdSense compliance is a goal, not a guaranteed outcome. No ads should obstruct navigation or essential learning content.

## 7. Privacy and data minimization
- Collect only information needed for a clearly stated student-facing purpose.
- Do not expose student records, marks, enrollment status, contact details, or uploads publicly.
- Do not put personal contact information into public repository documentation unless the owner explicitly approves that exact information for publication.
- Do not put inbox contents, legal case details, account identifiers, tokens, or credentials in project memory files.
- Provide clear privacy notice, retention/deletion process, contact channel, and third-party AI disclosure before collecting personal data.

## 8. How another AI should begin
1. Read `AGENTS.md`, this file, and `docs/AI-DECISIONS-AND-STATUS.md`.
2. Read the current task-specific code and recent commits/PRs. These memory notes can be stale.
3. Restate the goal, boundaries, and assumptions briefly.
4. Make a scoped change on a branch; do not deploy or merge.
5. Test and report evidence, including limitations.
6. Update these memory/decision files when a meaningful decision changes.

## 9. What success looks like
A student can open the site on an ordinary phone and quickly find a free, understandable, trustworthy tool that helps them learn and improve their own work—without misleading claims, hidden costs, privacy surprises, or academic misconduct.
