# Privacy and data-flow inventory — AIOU Coaching

**Status:** Preliminary technical inventory; not a legal compliance certification.  
**Last reviewed:** 2026-11-02  
**Environment:** Public Blogger website and repository source; production settings were not changed.

## 1. Confirmed from repository source

| Data flow / provider | Evidence in current source | What remains unverified |
|---|---|---|
| Blogger / Google hosting | Website is hosted at `aioucoaching.blogspot.com`; privacy page links to Google policy | Account settings, server logs, cookie behavior, retention, data-region and applicable Google products |
| Contact form / Formspree | Existing `pages/contact.html` posts form fields (name, email, optional phone, topic, message) to a Formspree endpoint using `fetch()` | Formspree account owner, recipient, access permissions, retention, deletion, spam controls, processor terms and current endpoint status |
| WhatsApp | Existing contact page contains a WhatsApp link | Number owner, account type, who monitors it, message backup settings and actual business use |
| Email | New business drafts use `faiezbinhafeez@gmail.com` | Mailbox provider/configuration, access, retention, forwarding and whether it is actively monitored |
| Google / AdSense / analytics | Privacy page references Google/Blogger and advertising policies | Actual active tags, AdSense status, Analytics property, consent configuration, ad personalization and other scripts in the live theme |
| Payments | Privacy page lists JazzCash, Easypaisa and bank transfers, and claims screenshots/transaction IDs are stored for 90 days | Whether payments are currently accepted, which channels are used, actual recordkeeping, access, accounting retention and refund workflow |
| Embedded tools / third parties | Page and theme may include embeds and external scripts | Full live-theme and page inventory, vendors, data transmitted, cookies and terms |

## 2. Existing statements that must not be repeated without verification

- A fixed 24-hour response promise on the existing contact page.
- Any claim that Formspree submissions are securely stored, deleted or monitored in a particular way.
- Any claim that a particular WhatsApp number is the official business channel.
- A 90-day payment screenshot retention period.
- Claims that payment screenshots are or are not stored.
- Claims that no personal data is collected, or that all data is stored in Pakistan.
- Claims of complete encryption, guaranteed security, automatic deletion or unrestricted deletion rights.
- Statements that a privacy law or draft bill is definitely applicable or in force without checking current official status and obtaining appropriate advice.

## 3. Safer interim contact design

The feature branch contains `pages/contact-draft.html`, an email-only draft. It does not call Formspree, WhatsApp, analytics or a new API. It asks visitors not to include credentials, identity documents, payment-card information or sensitive case records in an initial enquiry.

This is a draft, not a live change. Before publishing:
- Confirm the official mailbox is monitored and access is appropriately restricted.
- Decide whether a form is needed at all. If yes, verify the provider account and configure minimal fields, a clear notice, retention and deletion process before launch.
- Confirm the official WhatsApp channel separately; do not silently restore a legacy number.

## 4. Data minimization and enquiry handling controls

For initial enquiries, request only:
- Name (optional unless genuinely needed)
- Reply email
- Service category
- Brief description of the requested help
- Broad deadline only if relevant to suitability

Do not request at enquiry stage:
- Passwords, OTPs, student portal credentials or bank login details
- CNIC/passport scans or identity documents
- Card numbers, CVV, PINs or bank credentials
- Full confidential legal files, medical records or unrelated sensitive details
- Full assignment answers where a course code and learning question would suffice

Internal workflow:
1. Review the request for service fit and safety.
2. Ask for only the minimum additional context required.
3. Do not forward enquiries to third parties without a clear reason and appropriate permission.
4. Prepare a written scope/quote only after the request is understood.
5. Limit access to correspondence to the proprietor and authorized helpers.
6. Establish and document a retention schedule before promising deletion dates.
7. Handle access/correction/deletion requests individually, subject to applicable recordkeeping duties and provider limitations.

## 5. Pakistan / Sindh legal research notes (not legal advice)

- The Sindh Judicial Academy hosts a consolidated copy of the Sindh Consumer Protection Act, 2014 and Rules, 2017 and identifies amendment through Sindh Act No. XXIX of 2023: https://sja.gos.pk/assets/Acts_Ordinances_Rules/Sindh%20Consumer%20Protection%20Act,%202014.pdf
- The Sindh Judicial Academy updated-laws index lists the Sindh Consumer Protection Act and PECA materials, including PECA amendment references: https://sja.gos.pk/updated-laws/
- The Ministry of IT & Telecommunication legislation register lists Personal Data Protection Bills (2020 and 2023) as drafts in that register. This is not proof that no later law exists; re-check the official Gazette and current legislation before making a legal status statement: https://www.moitt.gov.pk/Legislations
- The same Ministry register lists the Electronic Transactions Ordinance, 2002 and the Prevention of Electronic Crimes Act, 2016. Confirm current amendments and applicability from official consolidated texts.

Do not describe a bill as an enacted Act. Do not turn this preliminary research into legal advice. A qualified local professional should review the final public policy and consumer-facing terms.

## 6. Approval checklist

- [ ] Proprietor confirms the official email and monitoring responsibility.
- [ ] Proprietor confirms whether WhatsApp is an authorized business channel.
- [ ] Formspree account owner, recipient and data handling are verified, or the form is removed from production.
- [ ] Existing contact page's 24-hour promise is removed or explicitly approved.
- [ ] Live Blogger theme and pages are inspected for Google/AdSense/Analytics tags, cookies and embeds.
- [ ] Actual payment operations and recordkeeping are confirmed; unsupported payment claims are removed.
- [ ] Data categories, purposes, access, vendors, retention and deletion procedures are documented.
- [ ] Final Privacy Policy is checked against real operations and reviewed by a qualified local professional.
- [ ] Any updated contact/privacy pages are approved by the proprietor before manual Blogger publication.

## 7. Security scan limitations

A threat-intelligence reputation check is not a test of Formspree account ownership, form recipient routing, data security, privacy compliance or endpoint configuration. An unknown or safe reputation result would not establish those facts. The connected reputation tool did not return a readable verdict in this review, so no safety verdict is recorded here.
