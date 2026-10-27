<div align="center">

# AIOU Coaching

### Independent study help and standalone tools for AIOU students

[![Repo](https://img.shields.io/badge/GitHub-AIOUN--Coaching-181717?style=for-the-badge&logo=github)](https://github.com/nationalistacademy/AIOUN-Coaching)
[![DeepSeek](https://img.shields.io/badge/Powered_by-DeepSeek_API-7c3aed?style=for-the-badge)](https://platform.deepseek.com)
[![Cloudflare](https://img.shields.io/badge/Security-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![Made in Pakistan](https://img.shields.io/badge/Made_in-Pakistan-success?style=for-the-badge)](#)

**Each tool is a standalone HTML file. Open one. Use it. You do not need the others.**

</div>

---

## Overview

**AIOU Coaching** is an independent resource for Allama Iqbal Open University students. It is **not affiliated with AIOU** and does not issue degrees, results, or official documents.

This repository holds:

- the Blogger theme
- legal and info pages
- standalone browser tools (guess papers, cover pages, humanizer, diagrams, bulk download)

No account is required to open a tool. AI tools that call DeepSeek go through the Cloudflare Worker in `worker.js`, so the API key stays off the page.

---

## Standalone tools

| Tool | File | What it does |
| --- | --- | --- |
| Guess paper | [Tool/aiou-guess-paper-generator.html](Tool/aiou-guess-paper-generator.html) | Build a paper, add a logo or watermark, download PDF / Word / image |
| BS and BBA guess paper | [Tool/aiou-bsbba-guess-paper-generator.html](Tool/aiou-bsbba-guess-paper-generator.html) | MCQ plus short and long questions, multi-page export |
| Assignment cover page | [Tool/aiou-assignment-cover-page-generator.html](Tool/aiou-assignment-cover-page-generator.html) | Cover layouts with student, programme, and course details |
| Cover sheet | [Tool/aiou-assignment-cover-sheet-generator.html](Tool/aiou-assignment-cover-sheet-generator.html) | Simple assignment cover sheet |
| Assignment writer | [Tool/aiou-assignment-writer.html](Tool/aiou-assignment-writer.html) | Draft help from pasted questions |
| Humanizer | [aiou-humanizer.html](aiou-humanizer.html) | Rewrite text so it reads more naturally |
| Diagram generator | [aiou-diagram-generator.html](aiou-diagram-generator.html) | Flowcharts and diagrams from a short prompt |
| Front page | [aiou-front-page.html](aiou-front-page.html) | A4-style assignment front page, print to PDF |
| Bulk downloader | [aiou-bulk-downloader.html](aiou-bulk-downloader.html) | Several Word files packed into one ZIP |

Blogger widget markup for the tools page lives in [Tool/tools.html](Tool/tools.html). Homepage markup for the blog is [home.html](home.html).

Guess papers are for revision only. They are not the real exam.

---

## Site pages

| Page | File |
| --- | --- |
| About | [Legal/about.html](Legal/about.html) |
| Contact | [Legal/contact.html](Legal/contact.html) |
| FAQs | [Legal/faqs.html](Legal/faqs.html) |
| How it works | [Legal/how-it-works.html](Legal/how-it-works.html) |
| Privacy | [Legal/privacy.html](Legal/privacy.html) |
| Terms | [Legal/terms.html](Legal/terms.html) |
| Disclaimer | [Legal/disclaimer.html](Legal/disclaimer.html) |
| DMCA | [Legal/dmca.html](Legal/dmca.html) |
| Blogger theme | [Theme/AIOUCOACHING.XML](Theme/AIOUCOACHING.XML) |

---

## How the AI tools run

Each HTML tool runs in the browser. Calls that need a model go to the Worker, which holds the API key.

```text
Browser (one standalone HTML file)
        |
        | POST  (optional X-Auth-Token)
        v
Cloudflare Worker  (worker.js)
        |
        | HTTPS
        v
DeepSeek API  (deepseek-chat)
```

### Worker setup

1. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and log in.
2. From this repo, set secrets (do not commit them):

```bash
npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler secret put AUTH_TOKEN
```

3. Deploy:

```bash
npx wrangler deploy
```

`wrangler.toml` names the worker `aiou-coaching-tools`. After deploy, paste the Worker URL into the tool that asks for it. The auth token stays in Cloudflare, not in the HTML.

---

## Independence

AIOU Coaching is not Allama Iqbal Open University. Confirm fees, dates, eligibility, and results on the university website before you submit anything.

---

## License

[MIT](LICENSE)
