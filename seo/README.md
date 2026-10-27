# `seo/` — SEO kit (audit + paste-in snippets)

Theme (`theme/AIOUCOACHING.XML`) me SEO layer pehle se mojood hai. Ye folder batata hai
**kya pehle se kaam kar raha hai**, **kya aap ko karna hai**, aur jo chhota hissa Blogger me
paste karna ho wo snippet.

## 1. Theme me pehle se kya hai (audit)

| Cheez | Theme me | Line* |
| --- | --- | --- |
| robots directives | search/archive par `noindex, follow`; posts/pages par `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` | ~1500-1504 |
| Organization schema | `EducationalOrganization` JSON-LD (name, url, description, areaServed, knowsAbout) | ~1585 |
| Twitter/OG meta | `JetAll-head-content` includable (title, description, cover image) | ~1293 |
| Sitemap page template | `sitemap_temp`, `sitemap_list_temp`, `sitemap_cb` (accordion sitemap) | ~3262+ |
| Canonical | Blogger apna canonical tag khud lagata hai | — |

\* line numbers badalte rehte hain; `grep -n` se confirm kar lein.

**Nateeja:** theme ke andar SEO ka technical kaam mukammal hai. Aap ka kaam **content** ka hai.

## 2. Aap ka checklist

- [ ] Har post/page par **ek** clear topic aur ek `h1` (Blogger title se aata hai).
- [ ] Title 30-60 chars, meta description 120-155 chars — `tools/generator.html` in dono ko check karta hai.
- [ ] Har image par `alt` text, `loading='lazy'` (theme images ke liye already karti hai).
- [ ] Internal links: har post se kam az kam 2 page (tool kit, FAQs) aur 1 related post.
- [ ] `search description` bharein — Blogger ka post/page search description hi meta description banta hai.
- [ ] Search Console me submit karein — dekhein [../google-search/README.md](../google-search/README.md).
- [ ] Sitemap page publish karein (theme ka sitemap template) aur usay menu me daalein.

## 3. Post/page ki SEO structure (paste karein)

```html
<div class="key-takeaways" role="note">
  <strong>Quick answer</strong>
  <p>Ek seedha jawab 2-3 line me — jo sawal log Google par likhte hain.</p>
</div>

<h2>Sawal ke hisaab se heading</h2>
<p>Short paragraph. Har paragraph ek hi baat.</p>

<h2>Steps / tafseel</h2>
<ol><li>Pehla step.</li><li>Dusra step.</li></ol>

<h2>Aksar pooche jane wale sawalat</h2>
<details><summary>Sawal?</summary><p>Jawab.</p></details>

<!-- INTERNAL LINKS: har post me 2-3 -->
<p>Ye bhi dekhein: <a href="/p/aiou-tool-kit.html">AIOU Tool Kit</a> · <a href="/p/faqs.html">FAQs</a></p>
```

Blogger me additional `<script type='application/ld+json'>` tags page/post body me bhi chalte
hain (Blogger unhein hata nahi deta) — FAQ aur Article schema ke ready snippets
[google-search/README.md](../google-search/README.md) me hain.

## 4. Ye na karein

- Ek page par do `h1` (Blogger ka post title + content ka `h1` = duplicate).
- Keywords ka dher (keyword stuffing) — AI search is se site ko downrank karta hai.
- Copy-paste jawab; students ki language me apna content likhein.
