# Initial repository/resource audit

Audit date: 2026-10-29

## Repository findings

- The repository has 20 HTML pages under `tools/`, including `assignment-writer.html`, `Aiou-solved-assignment-builder.html`, cover-page builders, guess-paper pages, quiz tools, PDF tools, and report generators.
- The existing `tools/assignment-writer.html` sends questions to a configured Cloudflare Worker and requests the `deepseek-chat` model. It is therefore AI/API-dependent and is out of scope for this free Python prototype.
- Root `package.json` contains JavaScript/Playwright dependencies but no Python resource pipeline or committed course-book corpus was found at the repository root.
- No existing AIOU course PDF/Word corpus was identified in the repository's checked-in root/tool listing. The prototype therefore accepts explicit official URLs or user-provided local files rather than pretending course files already exist.

## Official source discovery

These official AIOU pages are starting points for the resource catalogue:
- Books / e-books: https://www.aiou.edu.pk/books
- Soft Books search: https://online.aiou.edu.pk/LIVE_SITE/books%20soft_NSII.asp
- Assignment details / question paper guidance: https://aiou.edu.pk/guidance-help
- Example publicly indexed official PDF (course code in URL: 9141; page title surfaced as “SULTANATE OF DELHI”): https://online.aiou.edu.pk/LIVE_SITE/SoftBooks/9141.pdf

The prototype does not automatically crawl these pages. A staff member should verify course title, programme, semester, source freshness, terms of use, and whether the resource is suitable before generating or sharing a pack.

## Prototype boundary

- Local Python only; no paid API or hosting required.
- Official HTTPS AIOU domains are allowlisted for explicit URL fetches; redirects outside that allowlist are rejected.
- Text extraction and question/topic detection are heuristic and need human review.
- PDF and DOCX outputs include source/provenance and academic-integrity notes.
- Scanned PDFs may need OCR; Urdu text/font rendering needs separate validation.
- No LMS, Supabase, Firebase credentials, DNS, Cloudflare configuration, deployment, or existing AI tools are modified.
