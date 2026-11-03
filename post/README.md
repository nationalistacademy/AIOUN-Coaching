# Blogger Posts — canonical source folder

This folder contains HTML body sources and reusable templates for Blogger Posts. Repository folders do not determine public Blogger permalinks; Blogger controls each post URL.

## File and folder convention

- Shared template: `post/post-template.html`.
- A new post may be stored in its own folder: `post/<topic-or-slug>/post.html`.
- Optional source assets for that post may live beside `post.html`, but do not commit copyrighted or private student material without permission.
- Keep one canonical source per post. Record the actual published Blogger URL in the post's metadata/comment or a content index.

## Publishing workflow

1. Create/edit the post in Blogger → **Posts** → HTML view.
2. Paste the body fragment from the matching source file.
3. Set the title, permalink, labels, search description, author and publish date in Blogger.
4. Preview mobile and desktop, verify every link and fact, then publish manually.
5. Confirm the actual public URL. A repository commit never publishes a Blogger post.

## Theme-aware post rules

- The post body is inserted into the theme's existing `.entry-text#post-body` container.
- Do not include `html`, `head`, or `body` wrappers.
- The Blogger post title supplies the main page heading; avoid a duplicate body `h1`.
- Use theme tokens and scoped custom classes; do not reset global theme styles.
- Keep paragraphs short, tables responsive, images meaningful with alt text, and Urdu/English mixed text readable.
- Only add FAQ or article structured data if the markup is valid, visible content matches exactly, and the theme does not already emit the same schema.
- Ad markup is opt-in and must not be copied from examples unless the exact approved AdSense unit is confirmed.
- Cite current official AIOU sources for dates, rules, fees, policies and student procedures.

Read [the full HTML coding rules](../docs/BLOGGER-HTML-CODING-RULES.md) before generating a post.
