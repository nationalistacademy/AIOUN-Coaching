# AIOU Coaching AI Content Studio — Phase 3 MVP

**Status:** Draft implementation on `feat/professional-coaching-business-foundation`  
**Public brand:** AIOU Coaching  
**Publishing:** Manual approval only  
**Runtime:** Static browser app; no paid API, database, external AI endpoint or auto-publishing.

## What this MVP does

- Builds a structured writing prompt for an AI assistant chosen by the editor.
- Supports AIOU guides, exam-preparation content, free-tool guides, research-skills explainers, service pages, general legal information and education updates.
- Supports Urdu, English, Roman Urdu and mixed-language briefs.
- Provides a browser-based HTML draft editor, FAQ input, internal-link input and rendered preview.
- Runs basic editorial checks for title/meta length, keyword presence, headings, slug, source notes, FAQs and local approval reminder.
- Exports Blogger-compatible article-body HTML or copies it to the clipboard.
- Saves a draft only in the current browser's local storage when the user chooses Save.

## What it deliberately does not do

- It does not call an AI provider or require an API key. The prompt is copied to an AI assistant selected by the editor.
- It does not crawl websites, run OSINT, verify citations, check live AIOU deadlines or guarantee factual correctness.
- It does not publish to Blogger, update the Blogger XML theme, submit URLs to Search Console or send messages.
- It does not claim that its heuristic checks predict rankings, indexing or AdSense approval.
- It does not store drafts on a server. Browser storage may be cleared by the user or browser.

## Editorial safeguards

1. Verify university notices, course codes, dates and policies against current official AIOU sources.
2. Use primary government or court sources for legal-information content; state jurisdiction and source date. Do not present the tool as legal advice.
3. Preserve academic integrity: students remain authors of assessed work; no plagiarism, impersonation or fabricated research.
4. Remove confidential student/client information before using any third-party AI service.
5. Review HTML, links, accessibility and mobile rendering before manual Blogger publication.
6. Use only schema that accurately matches visible page content; this MVP does not generate structured data.

## Suggested next increments

- Add a human-reviewed official-source research panel using a separately approved research provider.
- Add accessible DOCX export and a saved draft library only after privacy and storage requirements are approved.
- Add optional AI-provider integration only after endpoint ownership, authentication, privacy, rate limits, cost and secret handling are verified.
- Add automated HTML linting and browser QA. Keep Blogger publishing manual unless a separate explicit approval and secure workflow are established.
