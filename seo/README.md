# SEO guide — audit and publishing checklist

This guide supports the Blogger site at [aioucoaching.blogspot.com](https://aioucoaching.blogspot.com/). Theme code can provide technical SEO features, but a feature is not verified until the rendered public page is checked.

Search engines control crawling, indexing, and ranking. These recommendations do not guarantee any particular result.

## 1. Inspect the live site and theme

Review [theme/AIOUCOACHING.XML](../theme/AIOUCOACHING.XML), then confirm the rendered page in a browser. Theme line numbers and implementations can change.

| Item | What to verify |
| --- | --- |
| Robots directives | Important public pages are indexable; duplicate search/archive pages have appropriate directives |
| Canonical URL | Points to the preferred live URL |
| Page title | Unique, descriptive, and aligned with the page content |
| Search description | Accurate, readable, and distinct for important pages |
| Open Graph/social metadata | Title, description, and image render as expected |
| Structured data | Valid and consistent with visible page content |
| Internal links | Important pages are reachable and no links are broken |
| Images | Useful alt text, suitable dimensions, and efficient loading |
| Mobile layout | Text, navigation, tables, and controls work at narrow widths |
| Sitemap | Blogger sitemap loads and is submitted in Search Console |

## 2. On-page checklist

- [ ] One clear search intent per page or post.
- [ ] A descriptive title and accurate search description are configured in Blogger.
- [ ] The first paragraph answers the reader's main question.
- [ ] Headings are nested logically and not used only for visual styling.
- [ ] Images have meaningful alternative text; decorative images use appropriate empty alt text.
- [ ] Internal links point to relevant published pages, posts, and tools.
- [ ] External claims link to reliable primary sources, especially official AIOU information.
- [ ] Dates, fees, deadlines, and eligibility details are current and verified.
- [ ] No keyword stuffing, fabricated reviews, or misleading guarantees.
- [ ] The final live page is checked after publishing.

A title length or description length is a guideline, not a strict ranking rule. Write for clarity first and check how the result is displayed in search.

## 3. Content starter

Adapt this structure where appropriate. Replace the placeholder text and links before publishing.

```html
<div class="key-takeaways" role="note">
  <strong>Quick answer</strong>
  <p>Write a concise, accurate answer to the page's main question.</p>
</div>

<h2>What you need to know</h2>
<p>Explain the key point and link to a reliable source.</p>

<h2>Steps</h2>
<ol>
  <li>First step.</li>
  <li>Second step.</li>
</ol>

<h2>Frequently asked questions</h2>
<details>
  <summary>Write a genuine reader question</summary>
  <p>Give a direct answer that matches the rest of the page.</p>
</details>
```

Add internal links only when they are relevant and the destination URL has been verified in Blogger.

## 4. Structured data

The [Google Search guide](../google-search/README.md) has example JSON-LD snippets. Structured data must accurately describe visible page content and comply with the search engine's current policies. Valid markup does not guarantee a rich result.

Do not add review/rating markup, fake author credentials, made-up dates, or FAQ schema for content that is not visible to users.

## 5. Indexing and measurement

1. Verify the preferred site URL in [Google Search Console](https://search.google.com/search-console).
2. Submit the Blogger sitemap, usually `sitemap.xml`.
3. Inspect important published URLs and request indexing when available.
4. Review indexing reports and fix errors that affect useful pages.
5. Monitor search impressions and clicks over time rather than judging SEO from a single search.

For current instructions, use [Google Search Central](https://developers.google.com/search/docs) and [Google's structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

## Related guides

- [Google Search setup](../google-search/README.md)
- [GEO guide](../geo/README.md)
- [Blogger Pages guide](../p/README.md)
- [Blogger Posts guide](../post/README.md)
