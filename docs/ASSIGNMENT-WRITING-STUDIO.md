# AIOU Coaching Assignment Writing Studio

## Purpose
A browser-based rich editor for assignment drafts. It supports mixed Urdu/English writing, RTL/LTR modes, formatted paste, tables, math text, image insertion, simple SVG diagrams, a configurable watermark, browser-local draft save/load, HTML and Word-compatible export, and print-to-PDF.

## Open it
From the AIOU Coaching homepage choose **Assignment Writing Studio** or open `tools/aiou-assignment-writing-studio.html`.

## Privacy and limits
- Drafts are saved in this browser's local storage only when the browser permits it. They are not synced to Firebase or Supabase.
- Images selected from a file are embedded in the document; large images may exceed browser storage limits. The tool currently limits individual image files to 4 MB.
- External image URLs need to be publicly accessible and can stop working later.
- Word export is HTML packaged as a `.doc` file, not a native DOCX. Print → Save as PDF uses the browser's print dialog.
- Watermarks are for draft/document labeling, not tamper-proof ownership proof.
- Verify citations, course instructions, and academic-integrity requirements before submitting work.
- AIOU Coaching is an independent study-support project and is not affiliated with Allama Iqbal Open University.
