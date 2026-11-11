# Roadmap

## Next

- Go live: move both domains from Dreamhost to Cloudflare, connect the repo, set the `CONTACT_TO`
  secret, onboard Email Sending ([docs/go-live.md](docs/go-live.md)).
- Turnstile on the contact form, once real spam shows up.
- A light theme, if he wants one: the colours are tokens in `src/styles/global.css`.
- Per-event pages (one page per album with its photos and films), if the one-pager starts to feel
  too small. Not before go-live.
- Dutch and French versions of the words, with hreflang.
- Prints and licensing: a short page with prices, when he has decided them.

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
