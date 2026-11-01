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


## Legacy contact and privacy audit — blockers found

The existing `main` branch pages were inspected before planning contact/privacy changes:

- `pages/contact.html` submits form data to a Formspree endpoint (`formspree.io/f/mvzyozvr`) using JavaScript `fetch()`. The account owner, recipient routing, access controls, retention and current deliverability have not been verified. Do not test by submitting a real message or assume the endpoint is configured correctly.
- The contact page currently displays a 24-hour response promise. No approved service-level commitment is recorded in the business policy; remove or confirm this before publishing a revised contact page.
- The contact page's displayed email differs from the proprietor-confirmed official email in the business foundation. Reconcile this before changing it; the verified official address for new business-page drafts is `faiezbinhafeez@gmail.com`.
- The contact page contains a WhatsApp contact number. Ownership, business use, consent to continue displaying it and monitoring arrangements need proprietor confirmation. Do not repeat or promote it in new materials until confirmed.
- The privacy page lists Google/Blogger, WhatsApp, Formspree and payment services (JazzCash, EasyPaisa and banks). It also describes payment screenshots and a 90-day retention period. The current business foundation does not enable payment processing, and the actual operational use, account ownership, data access and retention for each named provider have not been independently verified.
- The privacy page includes data-collection, payment, retention, security and user-rights statements. These must be reconciled with actual live services and reviewed before being represented as current policy.

### Required verification before contact/privacy publication

1. Confirm the one official public email and whether the older email remains monitored.
2. Confirm whether the Formspree form should remain; if yes, verify account ownership, destination, spam controls, data access and deletion/retention settings from the provider account.
3. Confirm whether the existing WhatsApp number is an authorized business contact and who monitors it.
4. Remove or approve the 24-hour response-time commitment.
5. Confirm whether any payments are currently accepted, by which methods, and whether any payment screenshots or transaction records are stored.
6. Inventory actual Blogger/Google, AdSense, analytics, embedded tools, form, messaging, hosting and other data processors.
7. Set retention periods only after reviewing actual business/accounting needs and applicable requirements; do not carry forward the unverified 90-day statement by default.

No live contact, privacy or terms page has been changed in this phase.

## Phase 2 implementation — enquiry and privacy foundation

Additional draft artifacts have now been added:

- `pages/contact-draft.html` — email-only contact page; no Formspree or WhatsApp calls, no response-time promise, and no sensitive-document request.
- `pages/terms-draft.html` — terms draft with service fees, payment channels, cancellations and refunds explicitly left for approval.
- `business/enquiry-workflow.md` — human-reviewed enquiry triage, written proposal, delivery and closure process.
- `business/privacy-data-inventory.md` — provider/data-flow inventory, unverified statements, minimization controls and approval checklist.

### Why the old contact/privacy pages were not overwritten

The existing contact page sends name, email, optional phone, topic and message to a Formspree endpoint; its account ownership, recipient and retention settings are not verified. It also contains a WhatsApp link and a 24-hour reply promise that require confirmation. The privacy page names several vendors and payment providers and claims a 90-day retention period for payment screenshots, none of which should be represented as current without an operational check.

The Malwarebytes reputation connector did not return a readable verdict in this review. No safety or legitimacy conclusion is recorded for the Formspree endpoint or email. A threat-intelligence reputation check would not establish account ownership or data-handling compliance in any case.

### Official-source research update

The Sindh Judicial Academy source identifies the Sindh Consumer Protection Act, 2014 / Rules, 2017 with amendment through Sindh Act No. XXIX of 2023. The Ministry of IT & Telecommunication register lists Personal Data Protection Bills from 2020 and 2023 as drafts in that register. This is not a definitive statement that no later law exists; re-check current official Gazette and consolidated texts before publication. See `business/privacy-data-inventory.md` for source links and cautions.

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
