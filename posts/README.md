# `posts/` — Blogger **Post** body

Yahan ki files Blogger ke **Post** me paste hone ke liye hain:

> Blogger dashboard → **Posts** → New post → right side **HTML view** → paste → Publish

## Page body vs Post body — farq

| | Page body (`pages/`) | Post body (`posts/`) |
| --- | --- | --- |
| Theme ka area | `#page-content` | `#single-content` + `.entry-text` |
| Blog har jagah | sidebar, sitemap, menus me nahi | archive, related posts, labels me aata hai |
| AdSense | page par sirf `.ad-header` | theme `ads-post` section sirf post par chalta hai (`.ad-in-article`) |
| Purpose | hamesha rehne wali info | aisi cheez jo students search karte hain |
| Date/labels | nahi | haan — search intent ke labels lagayein |

Rule: jo cheez log Google par search karte hain (solved assignment, guess paper, admission date,
exam tips) wo **post**; jo hamesha rehne wali information hai (about, privacy, tool kit) wo **page**.

## Is folder ki files

| File | Kya hai |
| --- | --- |
| `post-template.html` | Post body starter — GEO quick answer, headings, in-article ad slot, FAQ + Article schema, tools CTA |

## Post likhte waqt checklist

1. Ek hi `h1` (Blogger title se aata hai) aur uske baad `h2`/`h3` ka saaf structure.
2. Sab se upar **GEO “Quick answer” box** (`.key-takeaways`) — 2-3 line ka seedha jawab, kyunki AI search (ChatGPT, Gemini, AI Overviews) isi ko uthata hai.
3. Har post me ek `.ad-slot ad-in-article` (jagah reserve rehti hai, layout shift nahi hota).
4. Aakhir me 3-5 asli `FAQPage` sawal — schema ke sath.
5. Aakhir me tool kit ka link, taake student site par ruk jaye.
6. Feeds/labels bharein; Blogger ka auto sitemap (`/sitemap.xml`) khud index karta hai.
