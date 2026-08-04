# Fortpremium International — Website

Separated static site (HTML + CSS + JS). No build step, no framework.

## Files
- `index.html` — page shell: header/nav, footer, and the routed `<main>` container.
- `styles.css` — all styling (class-based).
- `app.js` — hash-based router + page renderers + mobile menu. No dependencies.
- `data.js` — all site content (team, programmes, jobs, partners, etc.). Edit copy here.
- `assets/` — team photos.

## Running it
Because the pages are loaded by JavaScript, open it through a web server (not by double-clicking the file), e.g.:

```
cd site
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just upload the whole `site/` folder to any web host (Netlify, cPanel, GitHub Pages, etc.) — `index.html` is the entry point.

## Editing content
Open `data.js` — every page's text, list items, links and image URLs live there as plain JavaScript objects. Change the strings and refresh.

## Notes on images
- **Team photos** are local files in `assets/` (offline-safe).
- **Programme, hero and gallery images** are hotlinked from Unsplash — replace the `src`/`img` URLs in `data.js` with your own hosted images before launch.
- **Partner logos** (NYSC, WAEC, Pearson) are hotlinked from Wikimedia Commons; **NECO** has no logo yet (shows an empty tile). Swap these for your own logo files in `assets/` and update `data.js`.

## Routes
`#/home` · `#/about` · `#/team` · `#/programmes` · `#/programme/<id>` · `#/involved` · `#/careers` · `#/contact`
Programme ids: `padi`, `tlai`, `femtech`, `k12`.
