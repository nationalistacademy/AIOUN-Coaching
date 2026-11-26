# AIOU Coaching — Free Python Resource Generator (prototype)

This isolated, local-first prototype turns an authorized or publicly accessible AIOU PDF/Word/text resource into a course-labelled study pack. It does not use an AI API, write assignment submissions for students, bypass academic-integrity checks, or modify the Blogger/PWA/LMS/Firebase/Supabase setup.

## What it does

- Accepts local PDF, DOCX, and TXT files, or downloads a user-specified URL only from the official AIOU host allowlist.
- Extracts text and records the source title, URL/file name, course code, and generation date.
- Finds existing question-like lines and creates a practice paper from them.
- Builds revision notes from headings and relevant source paragraphs.
- Exports editable DOCX and PDF files, plus a plain-text extraction for review.
- Clearly labels generated prompts as practice prompts, not official or predicted exam questions.

The prototype uses deterministic rules. It does not invent factual answers or claim a complete syllabus. Scanned PDFs may require OCR and are reported when text extraction is sparse.

## Setup

Python 3.10+ recommended.

    cd python-resource-generator
    python -m venv .venv
    # Windows: .venv\\Scripts\\activate
    # macOS/Linux: source .venv/bin/activate
    pip install -r requirements.txt

## Usage

From this directory, process an existing local file:

    python resource_generator.py --input ../sample-course.pdf --course-code 1429 --course-title "Business Mathematics" --output-dir ./output

Or fetch a specific official/public resource URL (the URL must be on an allowlisted AIOU domain):

    python resource_generator.py --url "https://online.aiou.edu.pk/LIVE_SITE/SoftBooks/5679.pdf" --course-code 5679 --course-title "Course title to verify" --output-dir ./output

The example URL is a source-discovery example. Confirm the actual course title and current relevance before using the generated pack.

## Source and copyright safeguards

- Only explicit URLs are fetched; the program does not crawl or bulk-download the university site.
- URL hosts are restricted to aiou.edu.pk and subdomains, including online.aiou.edu.pk.
- Keep attribution/source details in exported documents and follow the source's licence/terms. Public access does not automatically mean unrestricted republication.
- Do not redistribute full textbook text. Review extracted content and share only material you are permitted to use.
- Generated practice questions are not official papers, exam predictions, or guaranteed topics.
- Students should use notes for learning, write assignment answers in their own words, and cite sources.

## Limitations

- Existing questions are detected with heuristics; human review is necessary.
- If no existing questions are found, it creates topic-based practice prompts from detected headings. These are prompts only, not validated exam questions.
- Text extraction may be poor for scanned/image-only PDFs; OCR is intentionally not auto-installed.
- DOCX/PDF export is a local script, not yet wired into the Blogger UI. No deployment or cloud service is needed.
