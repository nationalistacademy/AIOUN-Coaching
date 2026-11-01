# Standalone tools and web-app pages

This folder is for standalone browser tools/web-app source files such as `studio.html`, report builders and generators. These are **not automatically Blogger Page body snippets**.

Blogger Page body sources belong in the repository-root `p/` folder and must map to Blogger URLs such as `/p/tool.html`. Blogger Post body sources belong in the repository-root `post/` folder.

Do not move standalone app documents into `p/` just because they end in `.html`; their relative CSS/JS/assets, routing and deployment paths may depend on their current location. Inspect and update all references before any future relocation.

See:
- [Blogger Pages source rules](../p/README.md)
- [Blogger Posts source rules](../post/README.md)
- [Theme compatibility](../docs/BLOGGER-THEME-COMPATIBILITY.md)
