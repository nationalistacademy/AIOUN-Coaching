# Assignment Builder MVP — Implementation and Blogger Handoff

**Status:** Feature-branch implementation for review. No live Blogger page or theme has been edited.
**Repository:** `nationalistacademy/AIOUN-Coaching`
**Feature branch:** `feat/assignment-builder-mvp`

## Purpose

Improve the existing `tools/Aiou-solved-assignment-builder.html` rather than create a competing duplicate. It is a self-service document-preparation tool: the student enters their own details, writes and edits their own answers, checks limited text overlap, previews pages and exports a document.

## Changes in this milestone

- Removed fabricated default student name/ID and the random student identity generator.
- Added a clear notice that drafts are stored in the current browser only.
- Added a user-confirmed **Clear all saved data on this device** action.
- Replaced the permissive rich-HTML filter with an allowlist. Script/style/iframe/SVG/embedded media and images are removed; event handlers, arbitrary style attributes and unsafe URL schemes are not retained. Basic formatting, tables, safe links and the builder's LaTeX marker remain supported.
- Added bounds for saved questions, answer length, references and source text.
- Restricted uploaded cover logos to PNG/JPEG/WebP up to 3 MB.
- Renamed the originality indicator to a limited text-similarity self-check. Its labels describe overlap only; it does not certify originality or detect plagiarism.
- Registered the builder in the central tool directory and linked it from the static student-tools homepage.
- Added Playwright coverage for privacy defaults, local saving, HTML sanitization, similarity wording, export and local-data clearing.

## Blogger handoff (manual; not performed)

1. Open the repository file `tools/Aiou-solved-assignment-builder.html` on this branch.
2. Copy the complete file contents.
3. In Blogger, create or edit the intended tool page and switch the editor to **HTML view**.
4. Paste the fragment into the page body, preview on desktop and mobile, and verify the PDF libraries load.
5. Publish only when you are ready. This branch does not publish or change Blogger.

Do not paste the fragment into the global Blogger theme. The page uses external MathJax, html2canvas and jsPDF libraries for equation rendering and PDF export; if those libraries are unavailable, those optional features may not work.

## Known limitations

- The Word export is an HTML-based `.doc` file, **not a native DOCX**.
- PDF pages are rasterized from the page preview.
- Similarity checking compares only 5-word phrases against text the user pastes and the other assignment answers. It is not Turnitin, does not query external databases and cannot verify citations or originality.
- Draft data is stored in browser local storage on the same browser/device. Shared-device users should clear it after use. Clearing site data in the browser also removes drafts.
- The optional cover logo is held in page memory for the current session and is not uploaded to a server.
- This tool is independent and not an official AIOU service. It must not be used to impersonate a student or submit work on a student's behalf.

## Acceptance tests

Run `npm install`, then `npx playwright install chromium`, then `npx playwright test tests/assignment-builder.spec.js`. The repository's full `npm test` suite also runs this new spec.

## Out of scope

No live Blogger content/theme, DNS, hosting deployment, Firebase/Supabase, LMS, auth, enrollment, quiz, student-record or production setting changes.
