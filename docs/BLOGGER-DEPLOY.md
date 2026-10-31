# Blogger deploy — sab kuch ek jagah

Ye page poora kaam ek jagah rakhta hai: theme, pages, tools, menu aur Search Console.
Har URL ka status **live blog par check** kiya gaya hai (October 2026).

---

## 0. Pehle ye samajh lein: live blog purani theme par chal raha hai

Repo ki theme me SEO layer mojood hai, magar live HTML me wo nahi hai. Live homepage par ye
missing mile:

| Cheez | Live homepage | Repo theme (`theme/aioucoahing.xml`) |
| --- | --- | --- |
| `<meta name='robots'>` | missing | `index,follow` + search/archive par `noindex` |
| `<meta name='description'>` | missing (len 0) | `data:view.description ?: theme description` |
| `<link rel='canonical'>` | missing | present |
| `og:title` / `og:description` / `twitter:card` | missing | present |
| Organization JSON-LD | 0 blocks | present |
| adsbygoogle refs | 3 | — |

**Sab se bara faida theme upload se milega.** Uske baad hi GEO quick-answer styling, crystal glass
hover aur shop cart icon bhi live honge.

---

## 1. Theme upload (5 minute)

1. Blogger → **Theme** → right side **Backup** → purani theme download kar lein (safety).
2. **Edit HTML** → poora code select → `theme/aioucoahing.xml` ka poora content paste → **Save**.
3. **Customise → Advanced → Description** — agar khali ho to bhar dein (theme me default description
   bhi set hai, ~150 chars).
4. Homepage khol kar check karein: page source me `name='robots'`, `og:title`, `canonical`,
   `application/ld+json` — chaaron nazar aane chahiye.

> Theme upload ke baad hi **cart icon** aur nav ke “All Tools” item live honge
> (menu me `/p/tools.html` link set hai).

---

## 2. Pages banayein — **Page body**

Har file ke liye: Blogger → **Pages** → New page → right **HTML view** → paste → **Publish**.
Page ka URL waisa hi rakhein jo neeche table me hai.

| Page | URL | File to paste | Abhi live? |
| --- | --- | --- | --- |
| AIOU Tool Kit (all tools) | `/p/aiou-tool-kit.html` | `pages/aiou-tool-kit.html` | ❌ 404 — **ye pehle banayein** |
| About | `/p/about.html` | `pages/about.html` | ✅ 200 (already) |
| Contact | `/p/contact.html` | `pages/contact.html` | ✅ 200 |
| FAQs | `/p/faqs.html` | `pages/faqs.html` | ✅ 200 |
| How it works | `/p/how-it-works.html` | `pages/how-it-works.html` | ✅ 200 |
| Privacy | `/p/privacy.html` | `pages/privacy.html` | ✅ 200 |
| Terms | `/p/terms.html` | `pages/terms.html` | ✅ 200 |
| Disclaimer | `/p/disclaimer.html` | `pages/disclaimer.html` | ✅ 200 |
| DMCA | `/p/dmca.html` | `pages/dmca.html` | ✅ 200 |

---

## 3. Tools — live URLs aur jo baqi hain

Live blog par abhi sirf 4 tool pages hain:

| Tool | Live URL | Status |
| --- | --- | --- |
| Guess Paper Generator | `/p/aiou-guess-paper-generator.html` | ✅ 200 |
| BS & BBA Guess Paper | `/p/aiou-bsbba-guess-paper-generator.html` | ✅ 200 |
| Assignment Cover Page | `/p/aiou-assignment-cover-page-generator.html` | ✅ 200 |
| Assignment Cover Sheet | `/p/aiou-assignment-cover-sheet-generator.html` | ✅ 200 |
| Mashqi Form | — | ❌ page hi nahi |
| AI Studio, Assignment Writer, Humanizer, Diagram, Front Page, Bulk ZIP | — | ❌ pages nahi |

**Live tools page ka bug:** `/p/tools.html` par “Open Mashqi Form Tool” button
`/p/aiou-assignment-cover-sheet-generator.html` par jata hai — wo page **Assignment Cover Sheet**
hai (page par “mashqi” ka zikr 0 baar hai). Fix: ya Mashqi Form page banayein, ya button ka
label/link theek karein.

**Tools page update karne ka tareeqa:** Blogger → Pages → `tools.html` → HTML view → repo ki
`tools/tools.html` paste karein. Is me links ab verified URLs par hain, Mashqi button par
“jald aa raha hai” likha hai, aur crystal glass hover bhi shamil hai.

> Chhote purane naam (`/p/guess-paper-generator.html`, `/p/bs-bba-guess-paper.html`,
> `/p/assignment-cover-page.html`, `/p/mashqi-form.html`) **404** hain — kabhi istemal na karein.

---

## 4. Menu (theme ke andar hi set hai)

`theme/aioucoahing.xml` me menu widget theek kar diya gaya hai:

| Menu item | Link | Note |
| --- | --- | --- |
| AIOUN | `/` | pehle `#` tha (dead) |
| Guess Paper | `/p/aiou-guess-paper-generator.html` | pehle `#` tha |
| **All Tools** | `/p/tools.html` | naya item — sab tools ek jagah |
| Original Books | `#` | koi page nahi — ya page banayein ya item hataayein |
| Home, Programmes, Admissions, Solved Assignments, Academic Calendar, FAQs, Contact | live `/p/...` | ✅ sab 200 |

---

## 5. Search Console (ek dafa)

1. `https://search.google.com/search-console` → URL prefix property add karein.
2. Verify: Blogger → Settings → Search Console me verification meta tag paste karein.
3. **Sitemaps** → `sitemap.xml` submit karein (Blogger khud banata hai; live hai).
4. Naye post/page ke liye **URL Inspection → Request indexing**.

Detail: [`../google-search/README.md`](../google-search/README.md).

---

## 6. Naya post likhna

`posts/post-template.html` copy karein → Blogger → Posts → HTML view → paste → apna content
bharein. Isme GEO quick-answer box, in-article ad slot, FAQ + BlogPosting schema pehle se hain.
Qawaid: [`../posts/README.md`](../posts/README.md).

---

## 7. Deploy ke baad ka checklist

- [ ] Theme upload hui; homepage source me robots / og / canonical / ld+json mojood
- [ ] `/p/aiou-tool-kit.html` page publish hui aur 200 de raha hai
- [ ] Menu me “All Tools” nazar aa raha hai
- [ ] Tools page update hui (Mashqi button theek, purane 404 links nahi)
- [ ] Search Console verified + sitemap submitted
- [ ] Worker deploy hua aur studio me ID save kar ke “🔌 Sab IDs test karein” chalaya
- [ ] Ek post template se publish kiya
