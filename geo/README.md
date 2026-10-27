# `geo/` — GEO kit (Generative Engine Optimization)

GEO ka matlab: aap ka content **AI answers** me cite ho — Google AI Overviews, ChatGPT,
Gemini, Perplexity. Ye tools page ko rank karne se alag khel hai: yahan **ek saaf jawab** jeetta hai,
lambi story nahi.

Theme me GEO ka hook pehle se mojood hai: `.key-takeaways` (glass “Quick answer” box), aur
`theme/AIOUCOACHING.XML` ke aakhir me GEO quick-answer + cookie notice ka script.

## 1. GEO ka formula (har page/post par)

1. **Seedha jawab sab se pehle.** Pehli 2-3 line me poora jawab, phir tafseel.
2. **Ek sawal = ek heading.** Heading me wahi alfaz jo student search me likhta hai
   (“AIOU assignment cover page kaise banayein”).
3. **Numbers, dates, steps** — jo cheez AI utha sake aur student verify kar sake.
4. **Table ya list** — AI engines list/table ko asaan uthate hain.
5. **Author + updated date** — E-E-A-T ke liye. AI sources ko trust karta hai.
6. **Public, indexable page** — noindex page AI bhi nahi uthata.

## 2. Quick answer block (paste karein)

Ready snippet: [quick-answer.html](quick-answer.html) — page ya post ke **sab se upar** paste karein.

```html
<div class="key-takeaways" role="note">
  <strong>Quick answer</strong>
  <p>AIOU Coaching par assignment cover page free banta hai: details bharein, template chunein
  aur PDF ya Word me download karein. Koi account nahi chahiye, sab kuch browser me chalta hai.</p>
</div>
```

## 3. FAQ + schema (AI engines isay pasand karte hain)

Aakhir me 3-5 sawal rkhein aur sath `FAQPage` schema lagayein — snippet
[../google-search/README.md](../google-search/README.md) me hai. Schema ke bina bhi
`<details><summary>` FAQ log aur AI dono ke liye parhne layak rehta hai.

## 4. Checklist

- [ ] Har page/post ka pehla paragraph ek seedha jawab hai (quick answer box me).
- [ ] Page par kam az kam ek table ya list.
- [ ] “Updated: <month year>” line mojood.
- [ ] Sitemap + robots theek (dekhein [../seo/README.md](../seo/README.md)) — GEO se pehle SEO.
- [ ] Har tool ka apna page hai (AIOU Tool Kit) taake link share ho sake.
- [ ] Guides ka apna naam/author page — [../pages/about.html](../pages/about.html).
