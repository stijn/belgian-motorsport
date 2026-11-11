# Belgian Motorsport

Portfolio and online business card of a motorsport photographer and filmmaker from Belgium:
[belgian-motorsport.com](https://belgian-motorsport.com). Static [Astro](https://astro.build) site on
Cloudflare Workers, with one small Worker for the contact form. It replaces a WordPress site.

See the [roadmap](roadmap.md) for what's in it and what's next, and [docs/go-live.md](docs/go-live.md)
for the move from Dreamhost to Cloudflare.

## Where things live

| What | Where |
|---|---|
| Name, tagline, description, the four networks, the numbers, About, services, contact copy, nav | `src/data/site.ts` |
| Gallery photos (which, caption, alt text) | `src/data/gallery.json` + `src/assets/gallery/` |
| Latest films and albums (written by `npm run sync`) | `src/data/videos.json`, `src/data/albums.json` + `src/assets/videos/`, `src/assets/albums/` |
| Hero photos | `src/assets/hero/` (used in `src/components/Hero.astro`) |
| The BM logo | `src/assets/bm-logo.png` (and `public/bm-logo.png` for structured data) |
| Design tokens and shared styles | `src/styles/global.css` |
| Page shell, metadata, JSON-LD | `src/layouts/Base.astro` |
| Sections of the home page | `src/components/` |
| Pages | `src/pages/` (`index`, `contact`, `privacy`, `thanks`, `404`, the manifest) |
| Contact form server side | `worker/index.ts`, `worker/contact.ts` (+ tests) |
| Security and caching headers, redirects, service worker, icons, share image | `public/` |
| Scripts that build things | `tools/sync.mjs`, `tools/icons.mjs` |

## Local development

Node 24 (`.node-version`), npm.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # dist/
npm run preview    # build, then serve dist/ with the Worker through wrangler (http://localhost:8787)
npm run check      # astro check + the Worker's types
npm test           # vitest: form validation, email building, CSP hash
npm run sync       # refresh films and albums from YouTube and Flickr
npm run icons      # rebuild favicon, app icons and og.jpg from the logo
```

The Worker's generated types come from `npx wrangler types worker/worker-configuration.d.ts`
(CI runs it; the file is git-ignored).

## How it works

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
  longer uses. `src/scripts/offline.ts` shows a note when the connection drops.
- **Headers.** `public/_headers` sets a strict Content-Security-Policy (only the site's own files, one
  inline script allowed by hash, YouTube no-cookie frames after a click), Permissions-Policy, COOP,
  nosniff, referrer policy and immutable caching for `/_astro/*`. `tests/headers.test.ts` fails if the
  inline script changes without its hash.
- **Search and sharing.** Canonical URLs, Open Graph and Twitter cards with `public/og.jpg`, JSON-LD for
  the organisation, the website, the photo gallery and the film list, `sitemap-index.xml`, `robots.txt`,
  and `public/_redirects` for the old WordPress paths and short links.

## Deploys

**Demo:** every push to `main` also builds the site for GitHub Pages at
https://stijn.github.io/belgian-motorsport/ (`.github/workflows/pages.yml`, with `SITE`, `BASE` and
`PUBLIC_DEMO=1`): a preview bar, `noindex`, and the contact form switched off. Nothing on the demo is
indexed or reachable by search engines.

**Live:** Cloudflare Workers Builds watches `main`: build command `npm run build`, deploy command
`npx wrangler deploy`. GitHub Actions (`.github/workflows/ci.yml`) runs the checks, tests and a build
on every push and pull request. Releases: bump `version` in `package.json`, add the section to
`roadmap.md`, tag `vX.Y.Z`.

## Rights

Photos, films and the BM logo © Belgian Motorsport, all rights reserved. Icons by
[Font Awesome](https://fontawesome.com) (CC BY 4.0); fonts Barlow and Barlow Condensed (OFL) via
[Fontsource](https://fontsource.org).
