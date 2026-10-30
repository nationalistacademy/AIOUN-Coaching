# Blogger SEO and quality implementation

Target: https://aioucoaching.blogspot.com/

The Blogger theme source is `theme/aioucoahing.xml`. This repository change does not publish the XML to Blogger automatically; upload it only after backing up the currently active theme.

## Changes made to the theme source

- Added a clear homepage tagline and a concise default meta description for AIOU Coaching.
- Kept per-post descriptions dynamic so Blogger's post search description can override the site-wide fallback.
- Fixed the home navigation item to point to the blog root and corrected the visible "Academic Calendar" label.
- Renamed the generic "AIOUN" menu label to "Study Resources".
- Added preconnect hints for the Blogger image host and the Bootstrap CDN already used by the theme.
- Restored standard visually-hidden accessibility behavior instead of forcing hidden labels into the visible layout.
- Made dark-mode preference lookup safe when browser storage is blocked, and stopped overwriting the document's entire class attribute.
- Removed the generated "Quick answer" snippet that copied the opening paragraph into a fake answer box. Authors should write and verify genuine summaries.
- Removed the theme's localStorage-only cookie accept/decline banner. It was not a certified consent-management platform and could incorrectly imply that ad/analytics consent was being managed. Use Google's certified CMP/Privacy & messaging where consent requirements apply.

## Upload to Blogger

1. Open Blogger → Theme and download/backup the currently active theme.
2. Review the XML file from this branch: `theme/aioucoahing.xml`.
3. Use Blogger → Theme → Restore/Upload to upload the XML.
4. Check the homepage, a post, a static page, search results, mobile layout, dark mode, comments, navigation, and ad placements.
5. If any widget or layout breaks, restore the backup immediately.

## Blogger settings to complete

These settings are in the Blogger dashboard and cannot be changed by a repository commit:

- Settings → Basic: set the blog title and a human-written description that matches the site's real content.
- Settings → Privacy: enable visibility to search engines.
- Settings → HTTPS: enable HTTPS availability and HTTPS redirect.
- Settings → Meta tags: enable search description and write a unique description for the blog.
- Settings → Crawlers and indexing: enable custom robots header tags only when configuring them carefully:
  - Home page: `all`
  - Archive and search pages: `noindex, follow`
  - Posts and pages: `all`
- If using a custom robots.txt, keep it conservative; do not block CSS, JavaScript, images, posts, or static pages. Submit the Blogger sitemap `https://aioucoaching.blogspot.com/sitemap.xml` in Search Console.
- Add the HTTPS blog property to Google Search Console, verify ownership, submit the sitemap, and inspect important URLs.
- For each post, set a unique Search Description, accurate labels, descriptive image alt text, a useful opening answer, clear H2/H3 headings, and internal links only where relevant.
- Keep About, Contact, Privacy Policy, Disclaimer and Terms pages accurate and easy to reach. Remove any empty or placeholder pages.
- Configure AdSense only with the verified publisher ID and approved ad units. The theme does not invent or hardcode an AdSense publisher ID or slot. Where consent is required, use a certified Google CMP rather than the removed DIY banner.

## Content quality priorities

1. Create genuinely useful programme/course-code hubs rather than thin keyword landing pages.
2. Make each assignment/notes page explain the course, semester, academic year, source/edition, update date, and what the downloadable file contains.
3. Distinguish official AIOU notices from independent study guidance. Link to official AIOU sources for deadlines, admissions, workshops and exam information.
4. Do not promise guaranteed marks, "80%+" outcomes, leaked papers, or predicted exam questions.
5. Avoid near-duplicate posts and repetitive AI-generated paragraphs. Review facts, Urdu/English terminology, citations and downloads before publishing.
6. Add internal links between a programme hub, course resources, relevant guides and the next logical student task.

## Verification checklist

- [ ] XML uploaded to Blogger and no theme/widget errors.
- [ ] Homepage title and description are unique and accurate.
- [ ] Post title, canonical URL, meta description, Open Graph and BlogPosting schema are present without duplicates.
- [ ] Search/archive pages are noindex while posts and useful pages remain indexable.
- [ ] Sitemap is accepted in Google Search Console.
- [ ] Mobile navigation, images, typography and page width work.
- [ ] Keyboard focus and screen-reader-only labels remain accessible.
- [ ] No broken placeholder links or empty policy pages remain.
- [ ] AdSense publisher/account and ad slots are verified in the Blogger dashboard.
- [ ] Core Web Vitals and representative page speed are checked on real pages.

A successful GitHub commit is not proof that the live Blogger theme was uploaded or that Google has indexed the changes.
