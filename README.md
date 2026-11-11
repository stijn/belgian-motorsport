# Belgian Motorsport

Portfolio and online business card of a motorsport photographer and filmmaker from Belgium:
[belgian-motorsport.com](https://belgian-motorsport.com). Static [Astro](https://astro.build) site on
Cloudflare Workers, with one small Worker for the contact form. It replaces a WordPress site.

See the [roadmap](roadmap.md) for what's in it and what's next, and [docs/go-live.md](docs/go-live.md)
for the move from Dreamhost to Cloudflare.

## Where things live

| What | Where |
|---|---|
| Every word, in five languages (one file each, English is the source) | `src/i18n/` |
| Name, tagline, the four networks, the numbers, section icons | `src/data/site.ts` |
| Gallery photos (which, caption, alt text) | `src/data/gallery.json` + `src/assets/gallery/` |
| Latest films and albums (written by `npm run sync`) | `src/data/videos.json`, `src/data/albums.json` + `src/assets/videos/`, `src/assets/albums/` |
| Hero photos | `src/assets/hero/` (used in `src/components/Hero.astro`) |
| The BM logo | `src/assets/bm-logo.png` (and `public/bm-logo.png` for structured data) |
| Design tokens and shared styles | `src/styles/global.css` |
| Page shell, metadata, JSON-LD | `src/layouts/Base.astro` |
| Sections of the home page | `src/components/` |
| Pages | `src/views/` (one per page) rendered by `src/pages/` at the root (English) and `src/pages/[lang]/` (nl, fr, de, it, es); `404` (per language, moved to `/<lang>/404.html` by `tools/postbuild.mjs`) and the manifest |
| Contact form server side | `worker/index.ts`, `worker/contact.ts` (+ tests) |
| Security and caching headers, redirects, service worker, icons, share image | `public/` |
| Scripts that build things | `tools/sync.mjs` (films, albums), `tools/icons.mjs` (icons), `tools/share-cards.mjs` (share cards) |

## Local development

Node 24 (`.node-version`), npm.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # dist/
npm run preview    # build, then serve dist/ with the Worker through wrangler (http://localhost:8787)
npm run check      # astro check + the Worker's types
npm test           # vitest: form validation, email building, CSP hash, AAA contrast of every colour pair
npm run sync       # refresh films and albums from YouTube and Flickr
npm run icons      # rebuild favicon and app icons from the logo
npm run cards      # rebuild the share cards (public/og-*.jpg) from his photos, the logo and the site's fonts
```

The Worker's generated types come from `npx wrangler types worker/worker-configuration.d.ts`
(CI runs it; the file is git-ignored).

## How it works

- **Languages.** English lives at the root, the others under `/nl/`, `/fr/`, `/de/`, `/it/`, `/es/`. Each page
  links its siblings with `hreflang` (plain language codes, `x-default` on English). Proper names, the
  tagline and photo captions stay as they are.
- **Static first.** Every page is HTML built ahead of time. Cloudflare serves `dist/` as static assets;
  only `/api/*` runs the Worker (`wrangler.jsonc` → `run_worker_first`).
- **Contact form.** `POST /api/contact` validates the message, checks a honeypot, a minimum fill-in
  time and a rate limit (5 a minute per address), optionally Turnstile, then sends it with Cloudflare
  Email Sending. Reply-to is the sender. His address is the `CONTACT_TO` secret and is nowhere in the
  code or the page. Without JavaScript the form posts normally and lands on `/thanks/`.
- **Films and albums** come from YouTube's RSS feed and Flickr's public album page at sync time, with
  the stills and covers downloaded into the repo. The live page makes no request to either; a film
  loads from `youtube-nocookie.com` only after a click.
- **Images** are AVIF/WebP/JPEG sets made by Astro from the masters, lazy below the fold, the hero
  preloaded. Fonts are self-hosted (`@fontsource`, latin subset). The stylesheet is inlined.
- **Offline.** `public/sw.js` keeps a copy of the pages and their files after the first visit
  (stale-while-revalidate for pages, cache-first for hashed files) and prunes what a new deploy no
  longer uses. The refresh skips the HTTP cache, and a changed page gets a "newer version, reload"
  note. `src/scripts/offline.ts` shows a note when the connection drops.
- **Headers.** `public/_headers` sets a strict Content-Security-Policy (only the site's own files, one
  inline script allowed by hash, YouTube no-cookie frames after a click), Permissions-Policy, COOP,
  nosniff, referrer policy and immutable caching for `/_astro/*`. `tests/headers.test.ts` fails if the
  inline script changes without its hash.
- **Search and sharing.** Canonical URLs, Open Graph and Twitter cards with a card per page in two shapes
  (`public/og-*.jpg`, words set in the site's own fonts by `tools/share-cards.mjs`), JSON-LD for
  the organisation, the website, the photo gallery and the film list, `sitemap-index.xml`, `robots.txt`,
  and `public/_redirects` for the old WordPress paths and short links.

## Deploys

**Demo:** https://stijn.github.io/belgian-motorsport/, built by `.github/workflows/pages.yml` on every
push to `main` with `SITE`, `BASE` and `PUBLIC_DEMO=1`: `noindex`, and the contact form switched off (GitHub Pages has no server side). `npm run deploy:demo` can put the same demo on
workers.dev, where the Worker runs too.

**Live:** https://belgian-motorsport.com, the Worker in `wrangler.jsonc`: `npm run deploy` (build,
then `wrangler deploy`) from a machine with Wrangler logged in. Workers Builds can take that over
(build command `npm run build`, deploy command `npx wrangler deploy`; see docs/go-live.md). GitHub Actions (`.github/workflows/ci.yml`) runs the checks, tests and a build
on every push and pull request, then `npm run seo` (title and description lengths, canonical,
hreflang sets, Open Graph) on the built pages. Releases: bump `version` in `package.json`, add the section to
`roadmap.md`, tag `vX.Y.Z`.

## Rights

The repository is public so the demo can run on GitHub Pages. Photos, films and the BM logo
© Belgian Motorsport, all rights reserved: they may not be reused. The code is here to read and learn
from, not packaged as a template. Icons by
[Font Awesome](https://fontawesome.com) (CC BY 4.0) and [line-md](https://github.com/cyberalien/line-md)
(MIT); fonts Barlow and Barlow Condensed (OFL) via [Fontsource](https://fontsource.org).
