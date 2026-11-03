# AIOU Coaching — Product Vision & Day-by-Day Delivery Roadmap

**Status:** Active product brief  
**Last reviewed:** 2026-11-03  
**Primary implementation repository:** `nationalistacademy/AIOUN-Coaching`  
**Primary current workstream:** Student-facing free tools, starting with the Assignment Builder  
**Publishing rule:** Repository work and preview/test environments only unless the owner separately approves a specific live Blogger change.

## 1. Product vision

Build a practical, mobile-first learning and assignment-preparation workspace for AIOU and other distance learners. A student should be able to:

1. Find the right programme, subject and course code.
2. Understand an assignment question and the relevant concept.
3. Study from trustworthy, properly attributed learning material.
4. Draft an answer in their own words with Urdu, English, mathematics and structured content.
5. Review clarity, completeness, citations and writing quality.
6. Produce a clean, editable DOCX and print-ready PDF.
7. Keep work private on their own device unless they explicitly choose to export or share it.

The experience should work for students from Matric through higher education, including working adults and mobile-first learners. It must be useful without paid AI APIs, paid hosting or mandatory accounts.

## 2. Product principles and non-negotiable boundaries

- **Free-first:** core tools must not depend on paid APIs or subscriptions.
- **Privacy-first:** drafts remain local by default; never upload student answers silently.
- **Mobile-first and accessible:** responsive layouts, keyboard access, visible focus, readable Urdu/English typography, clear error messages.
- **Student learning, not ghostwriting:** explain concepts, provide practice and editing support; students create and submit their own work.
- **Trustworthy sources:** prefer official/public AIOU material and clearly attributed open resources; do not reproduce copyrighted books or answer banks wholesale.
- **Honest claims:** no guaranteed marks, plagiarism-free certification, official affiliation, or promise that a similarity heuristic is a plagiarism detector.
- **Security:** validate/sanitize imported and pasted content; constrain file types and sizes; no secrets in client code or repository.
- **Safe operations:** no DNS, production deployment, Firebase/Supabase, authentication, enrollment, quiz, student-record, theme or live Blogger changes without a separate verified scope and approval.
- **Reviewable delivery:** work on feature branches, add tests, document limitations, open draft PRs and do not merge without approval.

## 3. Assignment Builder — target capability

### Core authoring
- Student/course/semester/assignment metadata, with optional fields clearly marked.
- Multiple questions and answers, edit/reorder/delete, references and clear-draft controls.
- Rich text: headings, paragraphs, bold/italic/underline, bullets, numbered lists and tables.
- Urdu RTL and English LTR at paragraph level; mixed-language content should remain readable.
- Mathematics: preserve entered notation and explain any rendering/export limitations.
- Image and simple diagram insertion with strict type/size limits and safe sanitization.
- Reliable local draft saving, recovery, export/import backup and clear-all controls.

### Review and export
- Preview that matches the exported document as closely as browser technology permits.
- Native editable DOCX, print-ready PDF and browser print.
- Validation for missing course metadata, empty answers, oversized content and broken media.
- Student self-review prompts for question coverage, own-word explanation, citations and formatting.
- Similarity checks, if offered, must remain clearly labelled as limited local phrase-overlap checks—not plagiarism detection.

### Quality requirements
- Keyboard and screen-reader labels for controls.
- Useful empty, loading, success and failure states.
- Test common mobile widths and desktop browsers.
- Avoid losing drafts when a user switches assignment tabs or reloads.
- Keep third-party libraries pinned, documented and failure-tolerant.

## 4. Wider free-tools roadmap

After the Assignment Builder is stable, build in this order:

1. **Course finder and course-code directory:** searchable programme/course index with source/date notes.
2. **Question explainer and study planner:** break a question into concepts, tasks and a realistic study checklist; no answer-submission automation.
3. **Notes and practice-paper library:** official/public source links, metadata, accessible summaries and original practice material.
4. **Answer quality checklist:** structure, relevance, explanation, examples, citations, language and formatting.
5. **Document utilities:** Urdu/English formatting helpers, page/word count, citation helper and accessible PDF/DOCX conversion.
6. **Student help centre:** assignment instructions, workshop guidance, book dispatch and CMS self-service directions that never request credentials or OTPs.
7. **Optional progress features:** only after the free tools work well and privacy/security design is reviewed.

LMS, accounts, enrollment, quiz scoring, student records, AI APIs and production infrastructure are not part of the current delivery sequence.

## 5. Day-by-day delivery sequence

Each day is a small, reviewable engineering increment. If a day reveals a blocker, record it and fix it before moving on; do not mark a milestone complete based on code alone.

| Day | Work package | Acceptance evidence |
|---|---|---|
| 1 | Repository/branch audit, baseline tests, product brief and risk register | Audit note, clean baseline and approved scope |
| 2 | Builder Phase 1 core authoring and local draft model | CRUD, two assignments, persistence tests |
| 3 | Native DOCX export and Urdu RTL/LTR | DOCX opens in Word/LibreOffice; direction tests |
| 4 | Inline media and flow diagrams | Type/size validation, sanitizer tests, media in DOCX |
| 5 | Draft recovery, export/import backup and storage quota handling | Reload/recovery and malformed-import tests |
| 6 | Answer review checklist and metadata validation | Actionable warnings; no false plagiarism claims |
| 7 | PDF/print parity, page breaks and export failure handling | Visual/export QA across browsers |
| 8 | Accessibility and mobile usability pass | Keyboard, focus, labels, zoom and mobile tests |
| 9 | Course finder/data model and official-source attribution | Search tests and source metadata |
| 10 | Student help centre and self-service guidance | Safe, accurate help pages; no credential collection |
| 11 | Security, privacy, dependency and performance audit | Findings register and resolved critical/high issues |
| 12 | Documentation, manual QA, release candidate and owner review | Complete checklist, screenshots/logs and draft PR |

This is a sequence, not a promise of autonomous background work. Continue from the latest verified repository state each working session and report what changed, what passed, what remains, and what needs owner approval.

## 6. Definition of done for each daily increment

A daily increment is complete only when:
- the exact repository and feature branch are verified;
- the change is limited to the approved scope;
- automated tests cover the new behaviour and relevant regressions;
- mobile and desktop behaviour are checked where applicable;
- privacy/security implications and known limitations are documented;
- the branch/PR links and commit SHA are reported;
- CI is green, or the failing check is explicitly recorded;
- no live Blogger or production change is implied.

## 7. Current verified checkpoint — 2026-11-03

- Phase 1 MVP exists on `feat/assignment-builder-mvp` and is the base for the current work.
- Phase 2 branch: `feat/assignment-builder-docx-rtl-media`.
- Draft PR #22: https://github.com/nationalistacademy/AIOUN-Coaching/pull/22
- Latest checked Browser QA workflow run: https://github.com/nationalistacademy/AIOUN-Coaching/actions/runs/41630213771 — completed successfully.
- The workflow included Firebase Functions syntax/config validation, Firestore security emulator tests and browser responsive/link/export tests. This passing validation does not mean a Firebase deployment occurred.
- Phase 2 includes native DOCX generation, Urdu RTL/LTR controls, local image/diagram support and associated tests/docs.
- Phase 2 PR remains draft and unmerged. No live Blogger publishing or production deployment was performed.
- Confirm the exact media size limits in code/docs/PR before release; all descriptions must agree.

## 8. Next engineering actions

1. Phase 3 draft recovery and JSON backup/restore are implemented on `feat/assignment-builder-draft-recovery`; verify CI before calling the increment complete.
2. Remaining Phase 3/4 coverage: empty/oversized assignments, media cleanup and failed DOCX/PDF dependencies.
3. Run manual QA on real mobile browsers and Word/LibreOffice before calling the builder release-ready.
4. Keep all work in draft PRs until the owner reviews and explicitly approves merging/publishing.

## 9. Day 5 implementation checkpoint — 2026-11-03

- Feature branch: `feat/assignment-builder-draft-recovery`, based on the verified Phase 2 head commit.
- Added versioned local draft format (`schemaVersion: 2`) while retaining compatibility with the existing unversioned/v1 browser draft shape.
- Added explicit JSON backup export and restore controls. Restore requires user confirmation because it replaces the two open assignments and metadata.
- Imported answer HTML passes through the existing strict rich-content sanitizer; imported fields and question counts/lengths are bounded.
- Malformed/unsupported backups are rejected. Corrupted local storage pauses autosave instead of silently replacing the damaged value.
- Storage quota and unavailable-storage errors are surfaced in an accessible status message.
- Backup privacy warning explains that JSON may contain names, roll numbers and assignment answers.
- Automated coverage added for round-trip restore of both assignments, unsupported backup rejection and corrupted local-storage preservation.
- CI is pending; this is not a release-ready claim. No Blogger publishing, merge, Firebase deployment or production setting change occurred.
