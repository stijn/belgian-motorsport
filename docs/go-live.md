# Go-live: from Dreamhost WordPress to Cloudflare

**Done on 2026-11-11.** Both zones are on Cloudflare, the Worker serves `https://belgian-motorsport.com`
by zone route, `www` and `belgianmotorsport.com` redirect to it. What is still open is at the end,
under "State after the move". The steps below stay as the record of how, and as the recipe for a redo.

The order matters. Mail for `belgian-motorsport.com` is on Google (the MX records point at
`aspmx.l.google.com`), so the DNS move has to carry the mail records across untouched.

## 0. Before you start

- A Cloudflare account that will own both zones (Free plan is enough for everything here).
- The GitHub repository `stijn/belgian-motorsport` (private) with this code on `main`.
- Access to the Dreamhost panel for both domains.
- His email address, for the `CONTACT_TO` secret. It goes into Cloudflare only, never into the repo.
- Export the WordPress site once (Tools → Export, and a copy of `wp-content/uploads`), for the archive.

## 1. Add both domains to Cloudflare

For each of `belgian-motorsport.com` and `belgianmotorsport.com`:

1. Cloudflare dashboard → Add a domain → Free plan. Cloudflare scans the existing DNS.
2. Check the imported records against Dreamhost's DNS page. Keep every `MX`, the Google `TXT`
   (SPF: `v=spf1 include:_spf.google.com ~all`), any `google._domainkey` (DKIM) and `_dmarc` record,
   and Google site-verification records. Set the Dreamhost `A` records for the service hosts
   (`blog`, `ftp`, `ssh`, `mail`, …) to DNS only; keep `@` and `www` proxied. The Worker is attached
   by zone route (`routes` in `wrangler.jsonc`), which sits beside those records: nothing has to be
   deleted first. (A custom domain would need the `@` record gone.)
3. Change the nameservers at Dreamhost (Domains → Manage → DNS → nameservers) to the two Cloudflare
   gives you. Activation takes minutes to a few hours; the old site keeps working meanwhile because
   Cloudflare still points at it until step 3.
4. In Cloudflare → SSL/TLS set the mode to **Full (strict)** and switch on **Always Use HTTPS**.

## 2. Deploy the Worker from GitHub

The demo is on GitHub Pages (static only). The live site is the Worker in `wrangler.jsonc`;
`npm run deploy` from this machine works, and the step below makes GitHub deploy it instead.

1. Workers & Pages → Create → **Import a repository** → `stijn/belgian-motorsport`.
2. Build command `npm run build`, deploy command `npx wrangler deploy`. Node 24 comes from
   `.node-version`. Leave the root as is; Cloudflare reads `wrangler.jsonc`.
3. The first deploy creates `belgian-motorsport.workers.dev`. Open it: the whole site should be there
   and the form should answer "The form isn't connected yet" until step 4.
4. The routes `belgian-motorsport.com/*` and `www.belgian-motorsport.com/*` are in `wrangler.jsonc`,
   so once the zone is active on Cloudflare the deploy attaches them.

Every push to `main` now deploys. The GitHub Actions workflow only checks and builds; it doesn't deploy.

## 3. Redirects: www and the second domain

- `www.belgian-motorsport.com`: in the zone, DNS → add `AAAA www 100::` (proxied). Rules → Redirect
  Rules → template **Redirect from WWW to root** → deploy.
- `belgianmotorsport.com`: in its zone, DNS → add `AAAA @ 100::` and `AAAA www 100::` (proxied).
  Rules → Redirect Rules → create: when `Hostname` ends with `belgianmotorsport.com`, dynamic redirect to
  `concat("https://belgian-motorsport.com", http.request.uri.path)`, status 301, preserve query string.

The hyphenated domain stays canonical because that is where the search history and the links from
YouTube, Flickr and Facebook already point. To switch, change `site.url` in `src/data/site.ts`,
`SITE_ORIGIN`, `routes` and `CONTACT_FROM` in `wrangler.jsonc`, `public/robots.txt`, and flip the two
redirect rules.

## 4. Email: the contact form

The form sends through **Resend** (free plan: 3,000 messages a month, 100 a day, data kept 30 days,
servers in the US, GDPR DPA signed on sign-up; the privacy page says so). Cloudflare's own Email
Sending would do the same without a third party, but needs the Workers Paid plan (USD 5 a month);
the Worker still supports it: without `RESEND_API_KEY` it uses the `EMAIL` binding.

1. Create a Resend account (resend.com, "Sign up", with his or Stijn's Google account). Nothing to pay.
2. Domains → Add domain → `belgian-motorsport.com`, region Europe (Ireland), tracking off, Manual
   setup. Done on 2026-11-11; the records now in Cloudflare, all **DNS only** (grey cloud):
   `TXT resend._domainkey` (the DKIM key), `CNAME rsend → rsend-euw1.forge.rmta.net`,
   `CNAME send → send.forge.rmta.net` (the SPF for the return path), `TXT _dmarc = v=DMARC1; p=none;`.
   Resend also lists `MX @ receive-euw1.forge.rmta.net`: that is for *receiving* mail through Resend
   and would replace Google's MX. Never add it. Google's mail records stay as they were.
3. API keys → Create: name `belgian-motorsport worker`, permission **Sending access**, domain
   `belgian-motorsport.com` only. Copy it once, then on the Mac, in the project:
   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```
   paste the key, Enter. (Same for the demo Worker with `--env demo`, if the demo form should send.)
4. The address that receives the form, if not set yet (it is, since 2026-11-11):
   ```bash
   npx wrangler secret put CONTACT_TO
   ```
5. Test from a phone off wifi: send a message, check it arrives in his inbox, hit Reply and check it
   goes to the sender. Resend → Emails shows each message and its delivery status; the Worker's logs
   are in Workers & Pages → belgian-motorsport → Logs.
6. Optional, once the form sees spam: Turnstile. Cloudflare → Turnstile → Add widget for
   `belgian-motorsport.com` (Managed, invisible). Then `npx wrangler secret put TURNSTILE_SECRET`, and
   `PUBLIC_TURNSTILE_SITE_KEY` with the site key at build time, and redeploy. Without it the form still
   has the honeypot, the 3-second rule and the 5-a-minute rate limit.

## 5. Search

- Google Search Console: verify both domains (DNS TXT, now easy in Cloudflare), submit
  `https://belgian-motorsport.com/sitemap-index.xml`. No change-of-address is needed: the canonical
  domain stays the same.
- Bing Webmaster Tools: import from Search Console.
- The old WordPress paths redirect (see `public/_redirects`), and the four short links
  `/video`, `/instagram`, `/facebook`, `/photo` still work.
- Check the share card: paste the home URL into LinkedIn's Post Inspector or
  `https://www.opengraph.xyz/` and look at `og.jpg`.

## 6. After go-live

- Dreamhost: cancel the hosting plan once the Cloudflare site has run for a week. Keep the domain
  registrations (or transfer them to Cloudflare Registrar later: unlock, auth code, at-cost renewal).
- Give him this routine:
  - New films and albums: `npm run sync`, look at the diff, commit, push. Monthly is plenty.
  - New gallery photos: drop JPEGs (1600px wide or more) in `src/assets/gallery/`, add them to
    `src/data/gallery.json` with a caption and alt text.
  - Numbers on the home page: `stats` in `src/data/site.ts`, with the date they were read.
- Keep an eye on Workers & Pages → Analytics now and then: requests, errors and the Worker's own
  invocations (only `/api/*` runs code; everything else is a static file).

## State after the move (2026-11-11)

Done:

- `belgian-motorsport.com` zone on Cloudflare (Free), nameservers `art` and `rose`, SSL Full (strict),
  Always Use HTTPS, redirect rule www → root. Mail records (Google MX, site verification) untouched.
  The ten Dreamhost service hosts (`blog`, `www.blog`, `ftp`, `ssh`, `mysql`, `calendar`, `docs`, `mail`,
  `sites`, `start`) still point at Dreamhost, DNS only.
- `belgianmotorsport.com` zone on Cloudflare, `@` and `www` proxied, Always Use HTTPS, redirect rule
  `*://*belgianmotorsport.com/*` → `https://belgian-motorsport.com/${3}` (301, query kept).
- Worker `belgian-motorsport` deployed from this machine (`npm run deploy`) with the two zone routes;
  `CONTACT_TO` set on it and on the demo Worker.

Open:

- Email: done on 2026-11-11. Resend account, domain verified, `RESEND_API_KEY` on both Workers, a
  test message delivered to his inbox. Resend → Emails shows every message and its status.
- Workers Builds (step 2): not connected yet, so deploys are `npm run deploy` from a laptop with
  Wrangler logged in.
- Dreamhost hosting for `belgian-motorsport.com` was set to **DNS Only** on 2026-11-11 (the old
  WordPress is gone from Dreamhost's server; its one page and twelve media files are in
  `archive/wordpress/`, git-ignored). In Dreamhost's own DNS the `@` and `www` records then point at
  Cloudflare's addresses, so a resolver that still holds the old delegation lands on the new site too.
  The `A` records for `@` and `www` in the Cloudflare zone still carry 67.205.1.0: harmless (the Worker
  answers first); swap them for `AAAA 100::` at leisure. `blog.belgian-motorsport.com` is still a
  Dreamhost-hosted site; delete it there when he agrees.
- Registrations: both transfers to Cloudflare Registrar were submitted on 2026-11-12 (USD 11.17 each,
  one year added; the registry shows `pendingTransfer`). Dreamhost emails a confirmation per domain:
  approving it completes the transfer at once, otherwise it completes by itself after five days. Once
  they land, the Dreamhost DNS zone (with its bridge records) goes away with the registration, and
  Cloudflare's zone, already authoritative, is all there is. Then cancel the Dreamhost hosting plan
  (the `blog` site is the last thing on it).
- Search Console (step 5) and the Dreamhost cancellation (step 6).
