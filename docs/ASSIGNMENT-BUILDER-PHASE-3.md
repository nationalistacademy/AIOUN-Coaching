# Assignment Builder Phase 3 — Local Draft Recovery and JSON Backup

**Status:** Draft implementation for review; CI pending.
**Repository:** `nationalistacademy/AIOUN-Coaching`
**Branch:** `feat/assignment-builder-draft-recovery`
**Parent:** `feat/assignment-builder-docx-rtl-media`

## Implemented

- Adds a versioned local draft envelope (`schemaVersion: 2`) and keeps the existing local-storage key so current browser drafts remain discoverable.
- Reads the legacy unversioned draft shape and version 1 backups, then writes future autosaves as version 2.
- Adds manual JSON backup export and restore for both Assignment 1 and Assignment 2 plus the supported metadata fields.
- Restore is explicit and asks for confirmation before replacing the current open draft.
- Imports are bounded by file size, question count, question/answer length, references and total payload size.
- Imported rich HTML is passed through the existing allowlist sanitizer; arbitrary scripts, event handlers, remote images and unsupported markup are not trusted.
- Corrupt or unsupported local draft data pauses autosave rather than silently overwriting the original stored value.
- Storage quota/unavailable errors are surfaced through an accessible status message.
- JSON backup privacy warning tells users that the file can contain personal details and assignment answers.

## Verification

New Playwright tests cover:
- Export/restore round trip for both assignments and metadata.
- Recovery of an unfinished answer after reload and independent in-progress drafts across Assignment 1/2.
- Rejection of unsupported backup schema versions without changing the current draft.
- Preservation of malformed local storage when autosave is attempted.

Run `npm test` for the complete suite. CI must pass before this increment is considered complete.

## Known limitations

- Backups are user-managed files; the tool does not upload or sync them to a server.
- The existing local-storage draft remains browser/device-specific.
- A browser storage quota failure can prevent autosave; export a JSON backup and reduce embedded media/content.
- Browser-local backups contain the assignment data in readable JSON; store them securely and delete shared-device copies when no longer needed.

## Scope exclusions

No live Blogger publishing, hosting deployment, DNS, Firebase/Supabase, LMS, authentication, enrollment, quiz, student-record or production setting changes.
