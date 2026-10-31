# `pages/` — Blogger **Page** body

Har `.html` file yahan Blogger ke **Page** me paste hone ke liye tayyar hai:

> Blogger dashboard → **Pages** → New page → right side **HTML view** → poora file paste → Publish

## Rules

1. **Body-only markup.** `<html>`, `<head>`, `<body>` nahi. File seedha `<style>`, `<div>` ya `<h2>` se shuru hoti hai.
2. **Theme same rehti hai.** `theme/AIOUCOACHING.XML` ko chhue bina sirf page ka content badalta hai.
3. **Theme ki classes use karein**, apni nayi CSS sirf tab likhein jab theme me na ho — is se light/dark dono themes me design match karta hai.
4. Content ke `href` Blogger ke page URL par le jaayein (`/p/about.html` style), poore domain par nahi.

## Theme se free milne wale hooks

| Hook | Kis liye | Theme me |
| --- | --- | --- |
| `.entry-text` | page/post ka asli content area | styled (B6) |
| `#page-content` | page wrapper (glass card milta hai) | styled (B2 + B6) |
| `.key-takeaways` | **GEO** “Quick answer” box | glass surface (B2) |
| `.ad-slot` / `.ad-header` / `.ad-in-article` | AdSense zone jo jagah reserve karta hai | B11 |
| `.accordion-item` + `.accordion-header` | FAQs / sitemap accordion | glass surface (B2) |
| `table`, `blockquote`, `pre`, `img` | auto glass/border radius | B6 |

## Is folder ki files

| File | Blogger page | Kya hai |
| --- | --- | --- |
| `about.html` | `/p/about.html` | About + E-E-A-T |
| `contact.html` | `/p/contact.html` | Contact + form area (theme me `contact-area` section isi URL par chalta hai) |
| `faqs.html` | `/p/faqs.html` | FAQs |
| `how-it-works.html` | `/p/how-it-works.html` | Process + pricing cards |
| `privacy.html` | `/p/privacy.html` | Privacy (AdSense required) |
| `terms.html` | `/p/terms.html` | Terms |
| `disclaimer.html` | `/p/disclaimer.html` | Independence disclaimer |
| `dmca.html` | `/p/dmca.html` | DMCA |
| `aiou-tool-kit.html` | `/p/aiou-tool-kit.html` | **AIOU Tool Kit** — saare tools ek page par |

Post body files ka ghar [../posts](../posts) hai; SEO / GEO / Google Search kits alag folders me hain.

## Live URL map (checked on the live blog)

Har `/p/...` URL ka HTTP status check kiya gaya. Sirf wahi links use karein jo **200** hain;
baki pages pehle Blogger me publish karna honge.

| Tool / page | Live URL | Status |
| --- | --- | --- |
| Guess Paper Generator | `/p/aiou-guess-paper-generator.html` | 200 |
| BS and BBA Guess Paper | `/p/aiou-bsbba-guess-paper-generator.html` | 200 |
| Assignment Cover Page | `/p/aiou-assignment-cover-page-generator.html` | 200 |
| Cover sheet page (live tools page isay “Mashqi Form Tool” kehta hai) | `/p/aiou-assignment-cover-sheet-generator.html` | 200 |
| Tools page | `/p/tools.html` | 200 |
| Home / About / FAQs / Contact / How it works | `/p/home.html`, `/p/about.html`, `/p/faqs.html`, `/p/contact.html`, `/p/how-it-works.html` | 200 |
| AIOU Tool Kit (ye file) | `/p/aiou-tool-kit.html` | 404 — pehle page banana hoga |
| AI Studio, Assignment Writer, Humanizer, Diagram, Front Page, Bulk ZIP | — | 404 — Blogger page publish karna baqi hai |
| Chhote naam (`/p/guess-paper-generator.html`, `/p/bs-bba-guess-paper.html`, `/p/mashqi-form.html`, `/p/assignment-cover-page.html`) | — | **404 — inhe istemal na karein** |

Nayi tool page publish karne ke baad isi table me URL add kar dein aur
`pages/aiou-tool-kit.html` ke us card par link laga dein (jahan abhi “Jald aa raha hai” likha hai).
