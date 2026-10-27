# Google Search setup guide

This guide covers Search Console, sitemap submission, indexing checks, and structured-data validation for the Blogger site at [aioucoaching.blogspot.com](https://aioucoaching.blogspot.com/).

Search engines decide whether and how to index pages. Following this guide does not guarantee indexing, rankings, or rich results.

## 1. Set up Search Console

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add the Blogger site as a URL-prefix property using the exact preferred URL shown by Blogger. Do not assume the `www` hostname is canonical; confirm redirects and the canonical URL first.
3. Complete the verification method offered by Search Console. Blogger may offer a convenient integration in its settings; otherwise follow Google's current verification instructions.
4. Open **Sitemaps** and submit the Blogger sitemap, commonly `sitemap.xml`, under the verified property.
5. Use **URL Inspection** for important newly published pages and request indexing when available.
6. Revisit Search Console reports to investigate indexing exclusions, crawl errors, and mobile usability issues.

Blogger normally generates its sitemap. Do not upload a manually created sitemap unless the hosting architecture actually requires one.

## 2. Inspect technical SEO in the theme

The Blogger theme source is [theme/AIOUCOACHING.XML](../theme/AIOUCOACHING.XML). Its exact line numbers can change; search the current file before editing.

| Item | What to verify |
| --- | --- |
| Robots directives | Important public pages are indexable; search/archive duplicates may use suitable directives |
| Canonical URL | The canonical points to the intended public URL |
| Open Graph and social metadata | Title, description, and image are appropriate for the page |
| Organization / educational organization schema | Organization details are accurate and consistent |
| Sitemap | The sitemap loads and includes expected public URLs |
| Internal links | Important pages can be reached from navigation or relevant content |

Do not assume a theme feature is working just because code exists. Inspect the rendered live page and validate it.

## 3. Structured data examples

These snippets are examples only. Adapt them to the actual visible content, page URL, and publishing dates. Do not add structured data that misrepresents the page. Google may ignore valid markup and does not guarantee enhanced search results.

### FAQPage

Use only for genuine questions and answers visible on the page. Check Google's current eligibility guidance before adding FAQ markup; not every site qualifies for FAQ rich results.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Is AIOU Coaching an official AIOU website?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "No. AIOU Coaching is an independent study-support project and is not affiliated with Allama Iqbal Open University."
    }
  }]
}
</script>
```

### BlogPosting

Replace the example values with the actual title, publication date, modification date, author, and canonical URL. Never reuse a sample date as if it were the real publication date.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Replace with the actual post title",
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "author": {"@type": "Organization", "name": "AIOU Coaching"},
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://aioucoaching.blogspot.com/p/replace-with-real-page.html"
  }
}
</script>
```

### SoftwareApplication

Use this only for a genuine software tool page. Describe the real application and its actual pricing; do not set the price to zero unless the tool is genuinely free under the stated conditions.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Replace with the real tool name",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web"
}
</script>
```

Validate relevant markup using the [Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org/).

## 4. Search readiness checklist

- [ ] Search Console property verified for the correct preferred URL.
- [ ] Sitemap submitted and fetched successfully.
- [ ] Important pages inspected for indexing status.
- [ ] Page titles and search descriptions are unique and descriptive.
- [ ] Canonical URLs and robots directives checked on rendered pages.
- [ ] Structured data matches visible content and has no validation errors.
- [ ] Mobile layout, internal links, and image alt text checked.
- [ ] Important content links to official sources where relevant.
- [ ] Any reported success is based on current Search Console or live-site evidence.

## 5. Official references

- [Google Search Console](https://search.google.com/search-console)
- [Google Search documentation](https://developers.google.com/search/docs)
- [Google structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Blogger Help](https://support.google.com/blogger/)
