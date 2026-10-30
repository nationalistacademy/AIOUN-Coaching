# Contributing to AIOU Coaching

Thank you for helping improve this independent study-support project for AIOU learners.

## Project priorities
1. Make the existing free student tools reliable, accessible and mobile-friendly.
2. Improve documentation, discoverability and maintainability.
3. Keep Blogger as the public content/SEO experience.
4. Treat the LMS and cloud integrations as separate, explicitly reviewed workstreams.

## Before changing code
- Read the relevant README and existing tests.
- Check open pull requests to avoid duplicating or conflicting work.
- Keep changes focused; use a feature branch and pull request.
- Do not include real student records, passwords, tokens, private keys or service-account files.
- Do not modify production hosting, DNS, Cloudflare routes, Firebase credentials, Supabase policies or LMS data as part of an unrelated tool change.

## Student-tool quality checklist
- Works on current mobile and desktop browsers.
- Has clear labels, keyboard access, visible focus and useful validation messages.
- Handles empty, invalid, boundary and duplicate inputs.
- Gives an understandable result and a clear recovery path after errors.
- Print, PDF, CSV and DOCX exports (where offered) preserve readable formatting.
- Does not silently upload student data; explain any local storage and provide a clear reset/export path.
- Avoids paid APIs and external dependencies unless the project owner explicitly approves them.

## Testing
Use the repository's documented Node/Playwright workflow:
```bash
npm install
npx playwright install chromium
npm test
```
For a Python resource-generator change, also follow its dedicated README and run its Python unit tests.

Never report a test as passed unless the command or GitHub Actions run completed successfully. Include the tested commit SHA and any skipped checks in the pull request.

## Pull requests
Describe the user problem, exact files changed, manual test steps, automated test results, screenshots for meaningful UI changes, privacy implications, and anything deliberately left out. Keep deployment, DNS and production actions separate from code review.
