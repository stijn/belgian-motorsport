# Roadmap

## Next

- Workers Builds, so a push to `main` deploys the live site (today: `npm run deploy` from a laptop).
- After go-live: Search Console, `AAAA 100::` instead of the Dreamhost IPs, `blog.` subdomain's fate,
  cancel Dreamhost hosting.
- Turnstile on the contact form, once real spam shows up.
- A light theme, if he wants one: the colours are tokens in `src/styles/global.css`.
- Per-event pages (one page per album with its photos and films), if the one-pager starts to feel
  too small. Not before go-live.
- Prints and licensing: a short page with prices, when he has decided them.

## 1.6.3 (2026-11-11)

- Added to a home screen, the app is called "Belgian Motorsport" on iOS (the Apple web-app title) and on
  Android (the manifest's short name), not "BM".

## 1.6.2 (2026-11-11)

- Header: black frosted glass once the page scrolls (nearly opaque, blurred behind), and the solid
  state is set at once on a page that opens already scrolled (an anchor, a language switch, back),
  where the lighter hero shade used to stay and let the content show through.
- Red words in headlines use a text shade of the red (`--red-text`, 5:1 on the backgrounds): AAA again
  for large text; surfaces, lines and icons keep the brand red. The contrast test checks it.
- "See on Flickr" and "Watch on YouTube" links carry the item's title in their accessible name, so
  each link's purpose stands on its own (WCAG 2.4.9).
- Cloudflare: minimum TLS 1.2 and HSTS (6 months, no subdomains) on belgian-motorsport.com.

## 1.6.1 (2026-11-11)

- The header no longer flashes on the first scroll: its hero shade and its dark bar are two layers that
  crossfade, instead of one background jumping from a gradient to a colour.

## 1.6.0 (2026-11-11)

- Switching language is quick: the next page is rendered ahead of time when a link is hovered or
  pressed (speculation rules; Chrome and Edge, others fall back), the page opens at the section that was
  on screen, nothing replays (hero intro, count-up, slide-ins already in view) when arriving from
  another page of the site, and the crossfade between pages is 0.2 s.
- Every Font Awesome icon is defined once per page as a symbol and drawn with `<use>`: 24 KB less
  HTML on the home page. Image files are shared across languages and cached for a year, so a switch
  downloads the HTML alone (34 KB compressed).
- The 404 page in all six languages: Cloudflare serves the nearest `404.html`, so `/nl/404.html` and
  the others are put in place after the build (`tools/postbuild.mjs`).

## 1.5.4 (2026-11-11)

- Tooltips as on the Tofo site: a dark card with a thin border and plain light text, no shadow (the
  header's text halo was being inherited).

## 1.5.3 (2026-11-11)

- About: the portraits drift further (scale 1 to 1.18 over nine seconds) and no longer snap back while
  fading out: the outgoing photo keeps its drift for the length of the fade, on its own layer.

## 1.5.2 (2026-11-11)

- The tricolour line sits on the page, not the sticky header: it shows at the top and scrolls away.

## 1.5.1 (2026-11-11)

- Film lightbox: previous and next (buttons, arrow keys), the title and a YouTube link under the
  player, and a counter, like the photos.

## 1.5.0 (2026-11-11)

- The contact form sends through Resend (free, a key in a secret); Cloudflare Email Sending stays as
  the fallback. The privacy page names Resend and what it keeps.
- Spanish, the sixth language (`/es/`), in the menu, the sitemap and every hreflang set.
- A thin Belgian tricolour along the top edge of every page, from the same token as the footer's.
- Contact: a paper plane on the send button (it takes off on hover); a lock and a shield next to the
  privacy note.
- Hero: the bars now really fill from left to right while a photo shows, and the photos drift. Astro had
  scoped `.js-motion` to each component, so none of the component animations (Ken Burns, bar fill,
  the About drift, the footer car, the year lines in Events) ever ran. Fixed with `:global()`.
- The language menu's tooltip opens below, where the browser's own bar can't hide it.
- The numbers in order of weight: years, subscribers, video views, photo views, films, photos.
- The red word in a headline is red text again, not white on a plate (4:1 on the background: AA for
  large text, just under AAA's 4.5:1).
- His three portraits in About, cross-fading, the pink "13 PRESS" jersey first.
- The photos section's anchor is `#photos` (was `#work`), matching the menu word.
- `npm run seo`: checks every built page's title and description length, canonical, the full and
  reciprocal hreflang set (every target exists), Open Graph and Twitter fields and that the card images
  exist. CI and the Pages build run it; so does `npm run deploy`.

## 1.4.1 (2026-11-11)

- Live on `https://belgian-motorsport.com`: both domains moved from Dreamhost to Cloudflare, the
  Worker attached by zone route (no DNS record to delete first), `www` and `belgianmotorsport.com`
  redirect to the hyphenated apex with the path and query kept. Google mail records carried across.

## 1.4.0 (2026-11-11)

- One red, the hero button's. It is a surface everywhere (buttons, lines, icons, markers), never the
  colour of running text: the tagline sits on a red plate, and the red word in a headline is white on a
  red plate, like a race number. The contrast test now also fails on a second red token.
- Language menu in alphabetical order of the names, hover and current item white on red (bold, large).
- Hero: each photo gets a slow Ken Burns drift into the car; three bars fill while a photo shows and
  jump to it when pressed; the clock pauses in a hidden tab and stops with reduced motion.
- Pages and languages slide into each other (cross-document view transitions); the header stays put.
- Captions alike for photos, films and albums: title, then the context left and the source right
  ("See on Flickr", "Watch on YouTube"), underlined quietly, no external-link arrows. Albums got
  "See on Flickr" too.
- About: his portraits cross-fade with a slow zoom once they sit in `src/assets/portrait/` (1.jpg,
  2.jpg, 3.jpg; cropped to 3:2 at build time); until then the frame holds the spot. The network chips
  carry their icon and the following (125K+ YouTube subscribers, 23K+
  Instagram, 11K+ Facebook, 9,500+ photos on Flickr); the portrait frame is landscape, so "Available
  for" lines up with the bottom of the text column.
- Contact: the recipient is set as the `CONTACT_TO` secret on the demo Worker; the GitHub Pages demo
  posts to that Worker (CORS from the demo origin), so the form is live there too. Until the domain is
  onboarded to Email Sending the Worker says so instead of "try again". The placeholder note is gone.
- Flickr by the real numbers: 430 albums (the Events section shows the newest 25; the link says
  "430+ albums") and a sixth counter, 5.7M+ photo views on Flickr. `npm run sync` prints the totals.
- About: the network icons are plain white; the footer keeps the brand colours.
- Tooltips on every icon-only control: back to top, the scroll cue, the hero bars, the language
  button, the play buttons, the lightbox buttons, the footer network dots.

## 1.3.1 (2026-11-11)

- The phone menu opens full-screen again: the header's blur had made it the menu's containing block
  (the panel collapsed to the bar's own height); the blur now sits on a pseudo-element. The menu also
  covers the back-to-top flag and the status notes instead of sitting under them.

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
