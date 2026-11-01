# Phase 2 — Public business pages (draft implementation)

**Repository:** nationalistacademy/AIOUN-Coaching  
**Working branch:** feat/professional-coaching-business-foundation  
**Status:** Drafts only; proprietor approval required before Blogger publication.

## Objective

Translate the Phase 1 business foundation into accurate public-facing pages without changing the live Blogger site, theme, DNS, hosting, LMS or payment infrastructure.

## Drafts in this phase

- `pages/services.html` — service overview, suitability, enquiry path, academic-integrity boundaries and legal-information exclusions.
- `pages/about.html` — replaces unsupported team/tutor claims and placeholder identity fields with the verified sole-proprietor identity and independent status.
- `pages/disclaimer.html` — expands educational, professional, legal-information, accuracy and third-party boundaries.
- `pages/README.md` — adds the new page and approval/publishing checklist.

## Existing pages intentionally not rewritten yet

- `pages/privacy.html`: currently a large custom-designed privacy page. It needs a complete data-flow inventory first (Blogger, Google Analytics/Search Console, AdSense, contact form provider, embedded tools, hosting/worker endpoints, cookies and third-party services). Do not claim specific retention, processing, international-transfer or deletion rights without verifying the actual services and applicable law.
- `pages/terms.html`: contains a placeholder date and broad legal language. It needs review alongside the final service scope, quotation, cancellation and refund policy.
- `pages/contact.html`: large custom contact page; inspect its actual form destination and data handling before representing it as a working secure enquiry channel.

## Verified identity wording

"Nationalist Academy is a sole proprietorship operated by Faiez Mehmood in Karachi, Pakistan."

Official email: `faiezbinhafeez@gmail.com`.

Do not add an NTN number, CNIC, street address, phone number, advocate status, professional licence, qualifications, office address, partnership, incorporation or accreditation claim without evidence and explicit proprietor approval.

## Public service boundaries

- Professional coaching, education support, research-skills guidance, CV/application support and digital-skills coaching are proposed service areas; actual availability must be confirmed.
- Academic support must preserve student authorship and must not enable plagiarism, contract cheating, impersonation, fabricated research or forged documents.
- Legal-information literacy is not legal advice or representation. No law-firm, advocate, court appearance or case-specific legal-opinion claims.
- No fixed fees, response times, payment channels, refund windows or service-level promises until approved.
- No guarantees of admission, grades, employment, legal outcomes, commercial results or search rankings.

## Source checks for future policy review

Use current official primary sources and have local counsel review public terms before launch:

- Sindh Judicial Academy — updated laws index: https://sja.gos.pk/updated-laws/ (lists the Sindh Consumer Protection Act, 2014 and Rules, with amendment status shown by the Academy).
- Ministry of IT & Telecommunication — legislation register: https://www.moitt.gov.pk/Legislations (lists the Personal Data Protection Bills as drafts in its register; do not describe a draft as enacted law).
- Pakistan Code — Electronic Transactions Ordinance, 2002: https://pakistancode.gov.pk/english/UY2FqaJw1-apaUY2Fqa-apaUY2Fta5Y%3D-sg-jjjjjjjjjjjjj
- Sindh Judicial Academy — legislation resources, including PECA materials: https://sja.gos.pk/updated-laws/

These links are research starting points, not a legal opinion or a complete compliance assessment. Confirm current consolidated texts, amendments, commencement and applicability before relying on any provision.

## Before any Blogger publication

- [ ] Proprietor approves exact launch services and service availability.
- [ ] Proprietor approves the public About and Services wording.
- [ ] Confirm the official enquiry email is monitored and the contact page/form actually works.
- [ ] Approve fees, quotation process, payment channels, cancellation and refund terms.
- [ ] Complete a data-flow and third-party inventory; then revise Privacy.
- [ ] Review Terms, Disclaimer and consumer-facing claims with a qualified local professional.
- [ ] Verify all page slugs and internal links in Blogger.
- [ ] Test page snippets on desktop and mobile in Blogger preview.
- [ ] Publish manually only after approval; repository commits do not publish Blogger pages.
