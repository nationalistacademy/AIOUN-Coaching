# Blogger Pages — source and publishing guide

The HTML files in this folder are **page-body snippets** intended for Blogger Pages.

## Publish or update a page

1. Open the Blogger dashboard for [AIOU Coaching](https://aioucoaching.blogspot.com/).
2. Go to **Pages** and open an existing page or create a new one.
3. Switch to the HTML editor.
4. Paste the relevant file's body markup; do not paste the repository README.
5. Preview desktop and mobile layouts, publish, then open the public URL and test links.
6. Editing a repository file does not automatically update the live Blogger page; publish the updated markup in Blogger separately.

## Markup rules

1. These files are intended as body content. Do not paste a full document with `<html>`, `<head>`, or `<body>` unless a particular file explicitly says otherwise.
2. The shared Blogger theme is [theme/AIOUCOACHING.XML](../theme/AIOUCOACHING.XML). Avoid unnecessary theme overrides in page snippets.
3. Prefer semantic headings, readable contrast, keyboard-accessible controls, and responsive tables.
4. Use valid public Blogger URLs for internal links. A path such as `/p/about.html` is only correct if that is the actual published page URL; verify slugs in Blogger.
5. Keep contact information and privacy statements accurate and current.
6. Do not paste API keys, access tokens, student information, or other secrets into page HTML.
7. If a snippet contains JavaScript or structured data, test the rendered published page because Blogger may sanitize or alter markup.

## Page source directory

| File | Intended content |
| --- | --- |
| `about.html` | Operator identity, project purpose, independence, and editorial context |
| `contact.html` | Legacy contact page; do not publish changes until form, email and WhatsApp ownership are verified |
| `contact-draft.html` | Email-only privacy-first contact page draft; approval required |
| `faqs.html` | Frequently asked questions |
| `how-it-works.html` | How the service and tools work |
| `privacy.html` | Privacy information |
| `terms.html` | Existing terms page; contains placeholder date and needs review |
| `terms-draft.html` | Updated draft terms with fee/refund fields left for approval |
| `disclaimer.html` | Independence and accuracy disclaimer |
| `dmca.html` | Copyright/DMCA contact process |
| `aiou-tool-kit.html` | Tool directory page |
| `services.html` | Professional coaching and education-support service overview (draft; approval required) |

Always compare this list against the current repository tree before relying on a path; file names and live Blogger slugs can differ. All new or revised business pages remain drafts until the proprietor approves them. Repository commits do not publish Blogger pages.

## Shared theme hooks

The theme may provide styles for the following selectors. Confirm they still exist in the current theme before depending on them.

| Selector | Intended use |
| --- | --- |
| `.entry-text` | Main entry text |
| `#page-content` | Page content wrapper |
| `.key-takeaways` | Quick-answer / key-points block |
| `.ad-slot`, `.ad-header`, `.ad-in-article` | Reserved ad layout zones |
| `.accordion-item`, `.accordion-header` | Accordion content |
| `table`, `blockquote`, `pre`, `img` | Common content elements |

## Business workflow and privacy review

- [Enquiry workflow](../business/enquiry-workflow.md)
- [Privacy/data-flow inventory](../business/privacy-data-inventory.md)
- [Phase 2 public-page implementation](../business/phase-2-public-pages.md)

## Related guides

- [Post body guide](../posts/README.md)
- [SEO checklist](../seo/README.md)
- [GEO content guide](../geo/README.md)
- [Google Search setup](../google-search/README.md)
- [LMS deployment and security](../lms/README.md)

## Live URL status (checked on aioucoaching.blogspot.com)

| Page | Live URL | Status |
| --- | --- | --- |
| Guess Paper Generator | `/p/aiou-guess-paper-generator.html` | 200 |
| BS & BBA Guess Paper | `/p/aiou-bsbba-guess-paper-generator.html` | 200 |
| Assignment Cover Page | `/p/aiou-assignment-cover-page-generator.html` | 200 |
| Assignment Cover Sheet | `/p/aiou-assignment-cover-sheet-generator.html` | 200 |
| Tools page | `/p/tools.html` | 200 |
| AIOU Tool Kit | `/p/aiou-tool-kit.html` | 404 — publish this page |

Purane chhote naam (`/p/guess-paper-generator.html`, `/p/bs-bba-guess-paper.html`,
`/p/assignment-cover-page.html`, `/p/mashqi-form.html`, `/p/quiz-generator.html`) **404** hain.
Poora deploy plan: [`../docs/BLOGGER-DEPLOY.md`](../docs/BLOGGER-DEPLOY.md).
