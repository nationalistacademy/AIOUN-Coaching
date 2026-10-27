# `google-search/` — Google Search kit

Is folder ka kaam: Google me site **dikhna, index hona aur rich results** lena. Technically
theme bahut kuch kar chuki hai — yahan jo bacha hai wo aaap ke account aur content ka kaam hai.

## 1. Search Console setup (ek dafa ka kaam)

1. [Google Search Console](https://search.google.com/search-console) me **URL prefix** property
   add karein: `https://www.aioucoaching.blogspot.com/`.
2. Verify karein — Blogger site par sab se asaan **HTML tag** method hai. Verification meta tag
   Blogger me **Settings → (blog) → Search Console** me paste karein ya theme ke
   `JetAll-head-content` includable ke andar ek dafa daal dein.
3. **Sitemaps** me submit karein: `sitemap.xml` (Blogger apna sitemap khud banata hai, is liye
   alag se file upload karne ki zarurat nahi).
4. **URL Inspection** se naya /p/ ya post URL daal kar “Request indexing” karein.

## 2. Theme ke robots / indexing rules (audit)

| Rule | Theme me | Line* |
| --- | --- | --- |
| Search aur archive pages | `noindex, follow` — duplicate content se bachne ke liye | ~1502 |
| Posts / pages | `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` | ~1504 |
| Canonical | Blogger khud lagata hai | — |
| Organization schema | `EducationalOrganization` (name, url, knowsAbout) | ~1585 |

\* `grep -n "robots" theme/AIOUCOACHING.XML` se confirm kar lein.

Matlab: index karne ke liye aap ko kuch nahi badalna — bas content aur sitemap theek rakhein.

## 3. Ready schema snippets (post/page body me paste karein)

Blogger post/page ke HTML view me ye tags chalte hain. Values apne hisaab se badal lein.

**FAQPage** — jab bhi page par sawal-jawab ho:

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
 {"@type":"Question","name":"Kya AIOU Coaching ke tools free hain?",
  "acceptedAnswer":{"@type":"Answer","text":"Ji haan, tamam tools free hain aur account ki zarurat nahi."}},
 {"@type":"Question","name":"Kya ye AIOU ka official tool hai?",
  "acceptedAnswer":{"@type":"Answer","text":"Nahi. AIOU Coaching independent hai aur Allama Iqbal Open University se mansalik nahi."}}
]}
</script>
```

**Article / BlogPosting** — blog post ke liye:

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BlogPosting",
 "headline":"Yahan post ka title",
 "datePublished":"2026-10-27","dateModified":"2026-10-27",
 "author":{"@type":"Organization","name":"AIOU Coaching"},
 "publisher":{"@type":"Organization","name":"AIOU Coaching"},
 "mainEntityOfPage":{"@type":"WebPage","@id":"https://www.aioucoaching.blogspot.com/p/example.html"}}
</script>
```

**SoftwareApplication** — har tool page ke liye (AIOU Tool Kit page par bhi):

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"SoftwareApplication",
 "name":"AIOU Guess Paper Generator","applicationCategory":"EducationalApplication",
 "operatingSystem":"Web","offers":{"@type":"Offer","price":"0","priceCurrency":"PKR"}}
</script>
```

Snippets test karein: [Rich Results Test](https://search.google.com/test/rich-results).

## 4. Checklist

- [ ] Search Console property verified, `sitemap.xml` submitted.
- [ ] Naye 5 posts ke liye “Request indexing”.
- [ ] Rich Results Test me FAQ / Article / SoftwareApplication errors = 0.
- [ ] Blog ka **search description** (Settings me) 155 chars ke andar aur keyword wala.
- [ ] AdSense: `.ad-slot` zones bane hue hain (theme B11 jagah reserve karti hai → layout shift nahi).
- [ ] Mobile-friendly test pass (theme responsive hai, magar wide tables check karein).
