# Blogger Page and Post HTML — coding, review and QA rules

This document is mandatory for every AI model or contributor writing files under [p/](../p/README.md) or [post/](../post/README.md).

## 1. Correct destination
| Source type | Repository location | Blogger destination |
|---|---|---|
| Long-lived Blogger Page | `p/<exact-slug>.html` | `/p/<exact-slug>.html` |
| Shared Page starter | `p/tool-template.html` | Template only; do not publish as-is |
| Blogger Post | `post/<topic>/post.html` | Blogger controls the actual permalink |
| Shared Post starter | `post/post-template.html` | Template only; do not publish as-is |
| Standalone web app | `tools/<app>.html` | Not a Blogger Page body unless explicitly converted |

The repository path is a source-management convention. It does not create, publish, rename or redirect a Blogger URL.

## 2. Before writing
- Read `AGENTS.md`, `docs/BLOGGER-THEME-COMPATIBILITY.md`, and the relevant Page/Post README.
- Inspect the current theme XML and existing sources serving the same purpose.
- Confirm whether the target Blogger URL already exists; do not create duplicates.
- Identify the reader, task, language, source material and exact public slug/permalink.
- Verify current AIOU policies, dates, fees, eligibility, course codes and procedures from official sources.
- Do not invent author credentials, review processes, institutional affiliation, testimonials, ratings, guarantees or statistics.

## 3. HTML and CSS
- Use body fragments only. No `html/head/body` document wrapper.
- Do not add duplicate site navigation, page title, footer or global theme controls.
- Use semantic HTML and one unique root class per page/component.
- Prefix every custom CSS selector with that root class.
- Reuse theme tokens and support both light and dark mode.
- Use responsive layouts, overflow-safe tables, logical CSS properties and meaningful image alt text.
- Keep JavaScript optional and scoped. Explain limitations if scripts or third-party services fail.
- Avoid external libraries unless necessary; disclose network calls and data sent to third parties.
- Never include API tokens, private keys, student records, private contact data or unapproved tracking.

## 4. Content and SEO
- One page/post should serve one clear user intent; do not duplicate content to target near-identical keywords.
- Give the direct answer early; organize with descriptive headings, lists and tables where useful.
- Use natural Urdu/English mix only when it improves comprehension. Preserve Unicode and test RTL/LTR text.
- Use accurate titles, search descriptions and internal links. Verify destination URLs.
- Link to official AIOU sources for rules, dates, fees and student processes.
- A guess paper is a practice/revision aid, never official, leaked or guaranteed.
- Students retain authorship of assessed work. Explain, guide, review and format; do not facilitate contract cheating or plagiarism.
- Structured data is optional. It must validate, reflect visible content and avoid duplicating theme output.
- Do not promise AdSense approval, first-page ranking, marks, admission or results.

## 5. Mandatory pre-publish checklist
- [ ] File is in the correct `p/` or `post/` location and its filename/slug is correct.
- [ ] No unresolved `YOUR_NAME`, `YOUR_EMAIL`, `TODO`, `example.com`, dummy links or sample values.
- [ ] No unsupported claims, fake credentials, fabricated references or misleading promises.
- [ ] No `html/head/body` wrappers or duplicate page-level `h1`.
- [ ] CSS is scoped and does not override theme-wide styles.
- [ ] Mobile widths 320px/375px/768px and desktop have been checked.
- [ ] Dark mode, keyboard navigation, visible focus and reduced motion have been checked.
- [ ] Urdu/English and RTL/LTR display has been checked where relevant.
- [ ] Internal and external links work and point to intended destinations.
- [ ] Forms, scripts and external dependencies work after Blogger sanitization.
- [ ] Structured data is valid, truthful and not duplicated by the theme.
- [ ] Ads/analytics are included only if exact configuration and consent/legal requirements are confirmed.
- [ ] Final published Blogger URL has been opened and verified after manual publication.

A source file that has not passed this checklist must be labelled **DRAFT — NOT APPROVED FOR PUBLISHING**.