// Checks the built site (dist/) the way a search engine and a social network read it: every page has a
// title and description of a sensible length, a canonical URL that matches where it lives, a complete
// and reciprocal set of hreflang links (one per language plus x-default, each pointing at a page that
// exists), and the Open Graph / Twitter fields with an image that exists. `npm run seo` after a build;
// CI runs it too. Exits 1 with the list of problems when something is off.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = 'dist';
const BASE = (process.env.BASE ?? '/').replace(/\/?$/, '/');
const TITLE_MAX = 60;
const DESC_MAX = 160;

const pages = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.name === 'index.html') pages.push(p);
  }
}
await walk(DIST);

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`))?.[1];
const tags = (html, re) => [...html.matchAll(re)].map((m) => m[0]);
const meta = (html, key, value) => tags(html, /<meta\s[^>]*>/g).filter((t) => attr(t, key) === value).map((t) => attr(t, 'content'));
const links = (html, rel) => tags(html, /<link\s[^>]*>/g).filter((t) => attr(t, 'rel') === rel);
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, '’').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const exists = async (p) => stat(p).then(() => true, () => false);
/** The dist file a site URL points at. */
const fileFor = (url, site) => {
  const u = new URL(url);
  if (u.origin !== site.origin) return null;
  const path = decodeURIComponent(u.pathname);
  if (!path.startsWith(BASE)) return null;
  const rel = path.slice(BASE.length);
  return rel.endsWith('/') || rel === '' ? join(DIST, rel, 'index.html') : join(DIST, rel);
};

const problems = [];
const say = (page, msg) => problems.push(`${page}: ${msg}`);
const groups = new Map(); // the hreflang set each page declares, to check reciprocity

for (const file of pages.sort()) {
  const html = await readFile(file, 'utf8');
  const rel = relative(DIST, file).replace(/index\.html$/, '');
  const name = '/' + rel;
  const is404 = /(^|\/)404\/$/.test(rel);

  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  if (!title) say(name, 'no <title>');
  else if (title.length > TITLE_MAX) say(name, `title is ${title.length} characters (max ${TITLE_MAX}): ${title}`);

  const desc = decode(meta(html, 'name', 'description')[0] ?? '');
  if (!desc) say(name, 'no meta description');
  else if (desc.length > DESC_MAX) say(name, `description is ${desc.length} characters (max ${DESC_MAX})`);
  else if (desc.length < 50) say(name, `description is short (${desc.length} characters)`);

  const lang = attr(html.match(/<html\s[^>]*>/)?.[0] ?? '', 'lang');
  if (!lang) say(name, 'no lang on <html>');

  const canonical = attr(links(html, 'canonical')[0] ?? '', 'href');
  if (!canonical) {
    say(name, 'no canonical');
    continue;
  }
  const site = new URL(canonical);
  if (!is404) {
    const expected = new URL(BASE + rel, site.origin).href;
    if (canonical !== expected) say(name, `canonical is ${canonical}, expected ${expected}`);
  }

  const robots = meta(html, 'name', 'robots')[0] ?? '';
  const noindex = /noindex/.test(robots);

  // hreflang: one per language, x-default, every target a real page, and the page among its own set.
  const alts = links(html, 'alternate').filter((t) => attr(t, 'hreflang')).map((t) => ({ hreflang: attr(t, 'hreflang'), href: attr(t, 'href') }));
  if (!is404) {
    if (!alts.length) say(name, 'no hreflang links');
    const codes = alts.map((a) => a.hreflang);
    if (!codes.includes('x-default')) say(name, 'no x-default hreflang');
    if (lang && !codes.includes(lang)) say(name, `hreflang set lacks the page's own language ${lang}`);
    if (new Set(codes).size !== codes.length) say(name, 'duplicate hreflang codes');
    const self = alts.find((a) => a.hreflang === lang);
    if (self && self.href !== canonical) say(name, `hreflang ${lang} points at ${self.href}, canonical is ${canonical}`);
    for (const a of alts) {
      const f = fileFor(a.href, site);
      if (!f) say(name, `hreflang ${a.hreflang} points off-site: ${a.href}`);
      else if (!(await exists(f))) say(name, `hreflang ${a.hreflang} points at a page that doesn't exist: ${a.href}`);
    }
    groups.set(canonical, new Set(alts.map((a) => a.href)));
  }

  // Open Graph and Twitter.
  const og = (p) => meta(html, 'property', p);
  if (!og('og:title')[0]) say(name, 'no og:title');
  if (!og('og:description')[0]) say(name, 'no og:description');
  if (og('og:url')[0] !== canonical) say(name, `og:url ${og('og:url')[0]} differs from canonical`);
  if (!og('og:type')[0]) say(name, 'no og:type');
  if (!og('og:locale')[0]) say(name, 'no og:locale');
  const images = og('og:image');
  if (!images.length) say(name, 'no og:image');
  for (const img of images) {
    if (!/^https?:\/\//.test(img)) say(name, `og:image is not absolute: ${img}`);
    else if (!(await exists(fileFor(img, site) ?? '/nonexistent'))) say(name, `og:image file missing: ${img}`);
  }
  if (!og('og:image:alt')[0]) say(name, 'no og:image:alt');
  if (meta(html, 'name', 'twitter:card')[0] !== 'summary_large_image') say(name, 'twitter:card is not summary_large_image');
  const tw = meta(html, 'name', 'twitter:image')[0];
  if (!tw) say(name, 'no twitter:image');
  else if (!(await exists(fileFor(tw, site) ?? '/nonexistent'))) say(name, `twitter:image file missing: ${tw}`);
  if (!noindex && !is404 && !/index/.test(robots)) say(name, `robots is "${robots}"`);
}

// Reciprocity: every page in a language set declares the same set.
for (const [url, set] of groups) {
  for (const other of set) {
    const theirs = groups.get(other);
    if (!theirs) continue; // reported above as missing
    if (theirs.size !== set.size || [...set].some((u) => !theirs.has(u))) say(new URL(url).pathname, `hreflang set differs from ${new URL(other).pathname}`);
  }
}

const sitemap = await exists(join(DIST, 'sitemap-index.xml'));
if (!sitemap) problems.push('no sitemap-index.xml');

if (problems.length) {
  console.error(`SEO check: ${problems.length} problem(s) in ${pages.length} pages\n` + problems.map((p) => '  - ' + p).join('\n'));
  process.exit(1);
}
console.log(`SEO check: ${pages.length} pages, ${groups.size} with hreflang sets, all good (BASE ${BASE}).`);
