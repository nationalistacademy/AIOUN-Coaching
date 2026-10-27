<div align="center">

# AIOU Coaching

### Independent study help and standalone tools for AIOU students

[![Repo](https://img.shields.io/badge/GitHub-AIOUN--Coaching-181717?style=for-the-badge&logo=github)](https://github.com/nationalistacademy/AIOUN-Coaching)
[![DeepSeek](https://img.shields.io/badge/Powered_by-DeepSeek_API-7c3aed?style=for-the-badge)](https://platform.deepseek.com)
[![Cloudflare](https://img.shields.io/badge/Security-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![Made in Pakistan](https://img.shields.io/badge/Made_in_Pakistan-success?style=for-the-badge)](#)

**Each tool is a standalone HTML file. Open one. Use it. You do not need the others.**

</div>

---

## Overview

**AIOU Coaching** is an independent resource for Allama Iqbal Open University students. It is **not affiliated with AIOU** and does not issue degrees, results, or official documents.

New here? Open [index.html](index.html) — it lists every tool. The flagship is the
**[Multi-ID AI Studio](tools/studio.html)**: send one question to several DeepSeek Worker
IDs (URL + token + model), compare all answers side by side, mark the best one, and export the
assignment as a Word file.

No account is required. Anthromes that call DeepSeek go through the Cloudflare Worker in
[worker/worker.js](worker/worker.js), so the API key stays off the page.

---

## Repository structure

```text
.
├── index.html                 # landing page: every tool in one grid
├── css/
│   ├── theme.css              # shared dark-glass theme (buttons, panels, cards, chips)
│   └── studio.css             # studio layout (stepper, ID rows, response cards)
├── js/                        # shared JavaScript (classic scripts, no build step)
│   ├── store.js               # the list of AI IDs + settings, saved in localStorage
│   ├── ai.js                  # DeepSeek client: askAll / askFirst / ask (multi-ID + fallback)
│   ├── ui.js                  # DOM, status, toast, copy and download helpers
│   ├── tools.js               # ONE registry of every tool (used by index.html + studio)
│   ├── hub.js                 # renders the filterable tool grid
│   └── studio.js              # studio app: multi-ID compare, helper, diagram, docx
├── tools/                     # every standalone tool
│   ├── studio.html            # ⭐ Multi-ID AI Studio (5 sections)
│   ├── guess-paper.html
│   ├── bs-bba-guess-paper.html
│   ├── assignment-cover-page.html
│   ├── assignment-cover-sheet.html
│   ├── assignment-writer.html
│   ├── humanizer.html
│   ├── diagram-generator.html
│   ├── front-page.html
│   ├── bulk-downloader.html
│   ├── generator.html         # blog post generator (SEO + JSON-LD)
│   └── tools.html             # Blogger widget markup for the tools page
├── pages/                     # about, contact, faqs, how-it-works, privacy, terms, disclaimer, dmca
├── theme/
│   ├── AIOUCOACHING.XML       # Blogger theme
│   └── home.html              # Blogger homepage markup
├── worker/
│   ├── worker.js              # Cloudflare Worker: DeepSeek proxy (multi-token)
│   └── wrangler.toml
└── .github/workflows/batch-generate.yml
```

### Where files moved

| Old path | New path |
| --- | --- |
| `studio.html` | [tools/studio.html](tools/studio.html) |
| `generator.html` | [tools/generator.html](tools/generator.html) |
| `aiou-humanizer.html` | [tools/humanizer.html](tools/humanizer.html) |
| `aiou-diagram-generator.html` | [tools/diagram-generator.html](tools/diagram-generator.html) |
| `aiou-front-page.html` | [tools/front-page.html](tools/front-page.html) |
| `aiou-bulk-downloader.html` | [tools/bulk-downloader.html](tools/bulk-downloader.html) |
| `Tool/*.html` | `tools/*.html` (prefix dropped: `aiou-guess-paper-generator.html` → `guess-paper.html`) |
| `Legal/*.html` | `pages/*.html` |
| `home.html` | [theme/home.html](theme/home.html) |
| `Theme/AIOUCOACHING.XML` | [theme/AIOUCOACHING.XML](theme/AIOUCOACHING.XML) |
| `worker.js`, `wrangler.toml` | `worker/worker.js`, `worker/wrangler.toml` |

Blogger pages link tools with `/p/...` URLs, so moving the source files does not change the live
site. Publish the updated markup when you are ready.

---

## Standalone tools

| Tool | File | What it does |
| --- | --- | --- |
| Multi-ID AI Studio | [tools/studio.html](tools/studio.html) | One prompt to many Worker IDs, answers side by side, best pick, Word export |
| Guess paper | [tools/guess-paper.html](tools/guess-paper.html) | Build a paper, add a logo or watermark, download PDF / Word / image |
| BS and BBA guess paper | [tools/bs-bba-guess-paper.html](tools/bs-bba-guess-paper.html) | MCQ plus short and long questions, multi-page export |
| Assignment cover page | [tools/assignment-cover-page.html](tools/assignment-cover-page.html) | Cover layouts with student, programme, and course details |
| Cover sheet | [tools/assignment-cover-sheet.html](tools/assignment-cover-sheet.html) | Simple assignment cover sheet |
| Assignment writer | [tools/assignment-writer.html](tools/assignment-writer.html) | Draft help from pasted questions |
| Humanizer | [tools/humanizer.html](tools/humanizer.html) | Rewrite text so it reads more naturally |
| Diagram generator | [tools/diagram-generator.html](tools/diagram-generator.html) | Flowcharts and diagrams from a short prompt |
| Front page | [tools/front-page.html](tools/front-page.html) | A4-style assignment front page, print to PDF |
| Bulk downloader | [tools/bulk-downloader.html](tools/bulk-downloader.html) | Several Word files packed into one ZIP |
| Blog post generator | [tools/generator.html](tools/generator.html) | Post draft, meta tags and JSON-LD schema |

Blogger widget markup for the tools page lives in [tools/tools.html](tools/tools.html).
Homepage markup for the blog is [theme/home.html](theme/home.html).

Guess papers are for revision only. They are not the real exam.

---

## How the AI tools run

```text
Browser (one HTML file + the shared js/ modules)
        |
        | POST  (X-Auth-Token)
        v
Cloudflare Worker  (worker/worker.js)
        |
        | HTTPS  (DeepSeek key stays here)
        v
DeepSeek API  (deepseek-chat / deepseek-reasoner)
```

### Multiple IDs (multi-key mode)

An "ID" is one Worker URL plus its Auth token and the model it should use. The studio stores the
whole list in your browser only (`localStorage`, key `aiou_ids_v2`) — nothing is uploaded.

- **Sab IDs ko bhejein** — the same prompt goes to every enabled ID at the same time. Each answer
  lands in its own card with status, latency and length. Mark the best with ⭐, copy it or push it
  into the assignment draft.
- **Fallback** — tries IDs in list order and stops at the first answer, so a dead or rate-limited
  key never blocks the work.
- **Export / import** — back the ID list up as JSON (`AIOU ids` never leave the browser).
- **Test** — `🔌 Sab IDs test karein` sends a one-word prompt to each ID to check which ones work.

The Worker accepts **one token or many**: set `AUTH_TOKEN` to a comma separated list
(`tokenA,tokenB`) and any of them will be accepted. That is how one deployment serves several IDs.

### Worker setup

1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and log in.
2. From this repo, set secrets (do not commit them):

```bash
cd worker
npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler secret put AUTH_TOKEN          # tokenA,tokenB — one or many
npx wrangler deploy
```

Optional: `AI_TIMEOUT_MS` (a `[vars]` entry) changes the upstream timeout; the default is 120000.

Endpoints: `POST /` with `{ messages, model, temperature, max_tokens, json }` and an
`X-Auth-Token` header, plus `GET /` for a small health check (`ok`, `models`, `tokens`).

After deploy, open the studio, add one ID per Worker URL + token, and press
`🔌 Sab IDs test karein`.

### Editing the shared code

- Add a tool: append it to the list in [js/tools.js](js/tools.js) — it then shows up on
  `index.html` and in the studio's **All Tools** section automatically.
- Theme: [css/theme.css](css/theme.css) for shared look, [css/studio.css](css/studio.css) for the
  studio layout.
- The `js/` files are plain classic scripts exposing `window.AIOU.*`, so the tools also work when
  opened straight from disk. Pages load them with relative paths (`../js/…`), so keep the folder
  structure when you paste a page into Blogger — or host the files and use their full URLs.

---

## Independence

AIOU Coaching is not Allama Iqbal Open University. Confirm fees, dates, eligibility, and results on the university website before you submit anything.

---

## License

[MIT](LICENSE)
