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
| `about.html` | Project purpose, independence, and editorial context |
| `contact.html` | Contact options and contact form area |
| `faqs.html` | Frequently asked questions |
| `how-it-works.html` | How the service and tools work |
| `privacy.html` | Privacy information |
| `terms.html` | Terms of use |
| `disclaimer.html` | Independence and accuracy disclaimer |
| `dmca.html` | Copyright/DMCA contact process |
| `aiou-tool-kit.html` | Tool directory page |

Always compare this list against the current repository tree before relying on a path; file names and live Blogger slugs can differ.

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

## Related guides

- [Post body guide](../posts/README.md)
- [SEO checklist](../seo/README.md)
- [GEO content guide](../geo/README.md)
- [Google Search setup](../google-search/README.md)
- [LMS deployment and security](../lms/README.md)
