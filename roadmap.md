# Roadmap

## Next

- Go live: move both domains from Dreamhost to Cloudflare, connect the repo, set the `CONTACT_TO`
  secret, onboard Email Sending ([docs/go-live.md](docs/go-live.md)).
- Turnstile on the contact form, once real spam shows up.
- A light theme, if he wants one: the colours are tokens in `src/styles/global.css`.
- Per-event pages (one page per album with its photos and films), if the one-pager starts to feel
  too small. Not before go-live.
- His portrait in About, when he sends one (replace the placeholder frame).
- Prints and licensing: a short page with prices, when he has decided them.

## 1.3.0 (2026-11-11)

- Five languages: English at the root, Dutch, French, German and Italian under `/nl/`, `/fr/`,
  `/de/`, `/it/`, every word from `src/i18n/`. A language switcher in the header (names in their own
  language, no flags), `hreflang` with plain language codes and `x-default`, per-language titles and
  descriptions within search-result lengths, Open Graph locales, a sitemap for all of them, and the
  Worker sending the no-JavaScript form back to the right language.
- Header: the social links are gone (the footer has them, opening in a new window); the sections carry
  line-md icons that redraw on hover; the hero's buttons too.
- Hero: no panel over the photo. The words carry a dark halo (text-shadow) and the shade deepens
  bottom-left; the contrast test checks the halo. The entrance moves without hiding, so the headline is
  painted at once.
- Photos: a dense grid with the two featured photos in 2×2 cells, no empty cells; every caption links the
  album and the photo on Flickr ("See on Flickr", new window), as does the lightbox.
- Films open in the same lightbox (youtube-nocookie, after a click, removed on close).
- Events as a wrapping grid, no sideways scrolling, albums in a new window.
- About: a placeholder frame for his portrait; services with Font Awesome icons and a calmer hover.
- Contact: the hint above the message field, icons on the fields, a chequered flag on Send, a lock and
  envelope on the privacy line.
- Footer in four columns (who, networks, this page, rights), with the credits Font Awesome's licence
  asks for. A chequered back-to-top flag that waves. Red accents in headlines come from the words
  (`*like this*` in the dictionaries), never from hard-coded capitals.
- Delights: the hero logo revs on hover, the footer logo sends a car down the tricolour, section lines
  turn chequered on hover. Counters carry icons; the photos icon is a camera drawn in line-md's style.
- Audits: axe-core clean on every page type (WCAG 2.x A, AA, AAA rules and best practices); Lighthouse
  100 / 100 / 100 / 100 on mobile and desktop for the local build (fonts preloaded, hero entrance
  without opacity, below-the-fold images lazy, no layout read before first paint).

## 1.2.1 (2026-11-11)

- New deploys reach phones that have the site saved: the service worker refreshes past the browser's
  HTTP cache (GitHub Pages keeps pages for ten minutes) and, when the page has changed, the open page
  shows "A newer version of this page is ready" with a Reload button.

## 1.2.0 (2026-11-11)

- Contrast to WCAG 2.2 AAA throughout: the hero's words sit on a dark panel with a red edge instead
  of straight over the photo, the header has a dark backdrop from the first pixel, the muted grey and
  the red used as text are lifted to 7:1 on every background, button text is large enough for white
  on the brand red to count, and the lightbox buttons are solid. `tests/contrast.test.ts` reads the
  tokens from the stylesheet and fails the build if any pair drops below AAA, including the panel over
  a pure white photo.

## 1.1.0 (2026-11-11)

- The header's logo stays hidden while the hero's big logo is on screen and fades in once it has
  scrolled away, so the BM mark never shows twice at once.
- Animation throughout: the tagline settles from wide tracking, the numbers count up and their red
  markers draw in, section lines and year rules draw themselves, headlines rise, buttons carry a
  light sweep on hover, the play button pulses a ring, services get a red marker, footer icons
  wiggle, the lightbox cross-fades between photos, and the phone menu's items slide in one by one.
  All of it is off with reduced motion.
- line-md animated icons beside Font Awesome: the scroll cue, the "more" arrows (they redraw on
  hover), the lightbox's arrows and close, and the form's sending, sent and error states. Each
  draws itself when it first comes into view. Brand icons stay Font Awesome.
- Share cards per page (home, contact, privacy), in 1200×630 and a 1200×1200 square for the
  networks that crop: his photo, the BM logo, the words set in Barlow Condensed and Barlow as
  paths (no system font), the numbers and the domain, the tricolour. `npm run cards` rebuilds
  them. Plus `rel="me"` links to his four networks and an `og:see_also`.

## 1.0.0 (2026-11-11)

First release, replacing the WordPress site.

- A demo on GitHub Pages, https://stijn.github.io/belgian-motorsport/ (`.github/workflows/pages.yml`):
  the same build under a base path, with noindex and the form switched off. The repo
  is public for it. `npm run deploy:demo` puts the same demo on workers.dev when the Worker itself
  needs showing. The approved site goes to Cloudflare with the domain, from the same code.
- Astro 7 static site on Cloudflare Workers (static assets), with one Worker route for the contact
  form. Private repo, GitHub Actions checks, Cloudflare Workers Builds deploys `main`.
- The BM logo, the name and the tagline "Passionate about cars" as on the old site; the old footer's
  About line and its four labelled links to YouTube, Instagram, Facebook and Flickr.
- Home page: full-screen hero with three of his photos cross-fading, the numbers (years, subscribers,
  views, films, photos), a photo grid with a lightbox, the latest films, his albums by year, About and
  what he can be booked for, and the contact form. Plus `/contact/`, `/privacy/`, `/thanks/` and a
  404 page.
- Contact form: posts to the Worker, which sends the message by Cloudflare Email Sending with
  reply-to set to the sender. His address lives only in a Worker secret. Honeypot, a 3-second rule,
  a rate limit of 5 a minute, optional Turnstile; works without JavaScript.
- `npm run sync` pulls the latest films (YouTube RSS) and albums (Flickr) into the repo, with their
  stills and covers, so the live site never calls YouTube or Flickr. Films play from
  youtube-nocookie.com, and only after a click.
- Images: AVIF and WebP in several widths from one master, lazy except the first screen, the hero
  preloaded. Self-hosted fonts (Barlow and Barlow Condensed, latin only). Stylesheet inlined.
- SEO and sharing: titles, descriptions, canonical, Open Graph and Twitter cards with a generated
  1200×630 image, JSON-LD (Organization, WebSite, ImageGallery, VideoObject list), sitemap, robots,
  redirects for the old WordPress paths and the old short links.
- Offline: a service worker keeps a copy of the site after the first visit and says when there is no
  connection; a web app manifest and icons for the home screen.
- Security headers with a strict Content-Security-Policy (a test keeps the inline-script hash right),
  no cookies, no analytics, no third-party requests before a click.
- Accessibility: skip link, one h1, landmarks, visible focus, keyboard and swipe in the lightbox,
  reduced motion respected everywhere, alt text on every photo.

## Not planned


- A CMS or admin panel. The content is a handful of files; the sync script does the rest, and a
  WordPress-style backend was the problem being solved.
- Comments, likes or a blog. The conversation happens on YouTube, Instagram and Facebook.
- Hosting the 9,500 photos here. Flickr does that well; the site shows a curated set and links out.
- Analytics scripts. Cloudflare's own request analytics are enough for a portfolio.
