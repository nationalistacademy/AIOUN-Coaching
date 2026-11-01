# Blogger theme compatibility contract

_Verified against repository XML source on 2026-11-02. Re-inspect before each major change._

## Source of truth
- Theme XML: [theme/aioucoahing.xml](../theme/aioucoahing.xml)
- Blogger Page body sources: [p/](../p/README.md)
- Blogger Post body sources: [post/](../post/README.md)
- Standalone browser applications: [tools/](../tools/README.md)

The theme is a JetTheme 2.9-derived Blogger XML document. It owns the document shell, Blogger widgets, navigation, page/post rendering, SEO metadata and glassmorphism layer. Page/Post files are body fragments inserted into that existing shell.

## Verified theme hooks and tokens
| Hook | Role |
|---|---|
| `.entry-text` | Main rendered page/post body |
| `#page-content` | Blogger page/post article wrapper |
| `#post-body` | Post body wrapper |
| `.entry-title` | Theme-rendered title |
| `.key-takeaways` | Quick-answer block |
| `.dark-mode` | Theme dark-mode state |
| `--jt-primary` | Accent colour |
| `--jt-heading-color` | Heading colour |
| `--jt-bg-light`, `--jt-border-light` | Soft background and border |
| `--glass-bg`, `--glass-bg-soft`, `--glass-border` | Glass surfaces and border |
| `--glass-shadow`, `--glass-shadow-hover`, `--glass-radius` | Elevation and radius |

These are implementation details, not permanent Blogger APIs. Recheck the XML and rendered preview before depending on them.

## Required implementation rules
1. **Fragment only:** no `<!doctype>`, `<html>`, `<head>`, or `<body>` wrappers in Blogger Page/Post body sources.
2. **Do not replace the theme:** never duplicate site navigation, global header/footer, or Blogger widgets inside a page body.
3. **Title hierarchy:** Blogger renders its own title. Start body sections at `h2`; avoid a competing second `h1` unless verified necessary.
4. **Scoped CSS:** use a unique root class and prefix every custom selector with it. Do not style global `body`, `h1`, `button`, `a`, `table`, or `.entry-text` from a page snippet.
5. **Token-first design:** reuse the theme variables above with safe fallbacks. Never assume light mode.
6. **Responsive layout:** use fluid grids, `minmax(0, 1fr)`, `min-width:0`, wrapping controls and overflow-safe tables. Check 320px, 375px, 768px and desktop widths.
7. **RTL/LTR:** use CSS logical properties; apply `dir="rtl"` only to Urdu content blocks. Do not set document direction from a page snippet.
8. **Accessibility:** semantic labels, keyboard access, visible focus, meaningful alt text, status announcements, sufficient contrast and reduced-motion support are mandatory.
9. **JavaScript:** scope selectors/listeners to the unique page root; avoid globals and duplicate initialization. Use Blogger-compatible CDATA comments when required. Never use `eval`, unsafe HTML insertion or credentials in client code.
10. **External dependencies:** avoid new CDN libraries. If essential, document purpose, version, trust/privacy implications, fallback and failure behaviour.
11. **Structured data:** JSON-LD must be valid, truthful, match visible content and use absolute canonical URLs. Check theme output first to avoid duplicate Organization, WebSite, BlogPosting/Article or FAQ schema. Never invent ratings, reviews, authorship, dates or AIOU affiliation.
12. **Ads:** do not insert AdSense tags, publisher/slot IDs, sticky/interstitial ads or empty placeholders unless the exact setup is verified and owner-approved.
13. **Blogger sanitization:** test scripts, forms, SVG, styles and JSON-LD in Blogger preview and on the published page; local validation alone is not enough.

## XML change protocol
- Fetch and inspect the complete current XML before editing.
- Preserve Blogger namespaces, widget IDs, section structure, includables, CDATA boundaries and XML escaping.
- Validate XML after editing; inspect duplicate IDs/widget IDs and required `<b:skin>`/widget structure.
- Compare before/after and keep the diff scoped.
- Never upload/publish XML without the owner's explicit approval.