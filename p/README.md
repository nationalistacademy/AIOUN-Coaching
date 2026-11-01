# Blogger Pages — canonical source folder

This folder contains **Blogger Page body HTML**. Its file names are intentionally aligned with the public Blogger page slug:

- `p/tool.html` is pasted into Blogger Pages and should publish at `/p/tool.html`.
- `p/tools.html` is the All Tools page body and maps to `/p/tools.html`.
- `p/about.html` maps to `/p/about.html`.

## Publishing workflow

1. Open the AIOU Coaching Blogger dashboard → **Pages**.
2. Create or edit the page with the matching slug.
3. Switch to **HTML view** and paste only the matching `.html` file body.
4. Preview desktop and mobile, then publish manually.
5. Open the public URL and verify links, controls, dark mode, Urdu/English text, and browser console.
6. A Git commit does **not** publish or update Blogger.

## Strict theme-compatibility rules

The shared theme is [`../theme/aioucoahing.xml`](../theme/aioucoahing.xml). It is a JetTheme 2.9-derived Blogger XML theme with an existing content wrapper (`.entry-text`, `#page-content`) and shared style tokens. The page file is a **body fragment**, not a full HTML document.

- Never add document-level `<html>`, `<head>`, or `<body>` wrappers.
- Do not replace, duplicate, or edit the Blogger theme from a page-body file.
- Let Blogger render the page title. Use `h2`/ `h3` for body sections; do not add a second competing `h1` without a verified reason.
- Scope every custom selector under a unique page root class (for example `.aio-tool-page`); never style global `body`, `h1`, `button`, `a`, `table`, or `.entry-text` from a page snippet.
- Reuse existing theme tokens where available: `--jt-primary`, `--jt-heading-color`, `--jt-bg-light`, `--jt-border-light`, `--glass-bg`, `--glass-bg-soft`, `--glass-border`, `--glass-shadow`, and `--glass-radius`. Always provide safe fallbacks.
- Keep layouts fluid; test 320px, 375px, 768px, and desktop widths. Use CSS logical properties for RTL-safe spacing and alignment.
- Support dark mode through inherited theme tokens; do not force a white background or hard-code dark text.
- Respect `prefers-reduced-motion`; provide visible keyboard focus and accessible labels/states.
- Keep scripts local to the page root, avoid global variables, and wrap inline JavaScript in Blogger-safe CDATA comments when needed. Never use `eval`, unsafe HTML injection, or remote scripts without a clear need.
- Avoid duplicate IDs, broken anchors, invalid nesting, and unverified external dependencies.
- Do not add AdSense code, ad slots, sticky ads, or publisher IDs unless the owner has approved the exact unit and the current theme/ad setup is verified.
- Structured data must be valid JSON-LD, truthful, match visible content, use absolute canonical URLs, and not duplicate schema already emitted by the theme. Never invent reviews, ratings, credentials, or official AIOU status.

## File readiness

Files migrated from the former `pages/` directory are preserved as source snapshots. A source file is **not automatically approved for publishing**. Review its placeholders, factual claims, contact details, forms, external scripts, and live URL before publishing. See `docs/BLOGGER-HTML-CODING-RULES.md`.

## New page naming

Use the exact Blogger slug as the file name: `p/<slug>.html`. Keep one canonical source per page. Do not create a second page to target the same search intent.

## Useful links

- [Tool page starter](tool-template.html)
- [Theme compatibility rules](../docs/BLOGGER-THEME-COMPATIBILITY.md)
- [HTML coding and QA rules](../docs/BLOGGER-HTML-CODING-RULES.md)
- [Blogger post sources](../post/README.md)
- [Blogger deployment guide](../docs/BLOGGER-DEPLOY.md)
