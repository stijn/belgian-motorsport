// After `astro build`: each language's 404 page moves from /<lang>/404/index.html to /<lang>/404.html,
// where Cloudflare's static assets find it as the nearest 404 page for a missing path under /<lang>/.
// (The root 404.html Astro writes itself. GitHub Pages only knows the root one.)
import { existsSync } from 'node:fs';
import { appendFile, readdir, readFile, rename, rm } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = 'dist';
const BASE = (process.env.BASE ?? '/').replace(/^\/|\/$/g, '');
const root = BASE ? join(DIST, BASE) : DIST;
let moved = 0;
for (const lang of ['nl', 'fr', 'de', 'it', 'es']) {
  const from = join(root, lang, '404', 'index.html');
  if (!existsSync(from)) continue;
  await rename(from, join(root, lang, '404.html'));
  await rm(join(root, lang, '404'), { recursive: true });
  moved++;
}
console.log(`postbuild: ${moved} language 404 pages in place`);

// Early Hints: for every page, a Link header naming what the page preloads (the two fonts, and on
// the home pages the hero photo), so Cloudflare can send a 103 with them before the page itself.
// Appended to dist/_headers; the paths are the page paths, so files are not touched.
const pages = [];
const walk = async (dir) => {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (e.name === 'index.html') pages.push(p);
  }
};
await walk(root);
let rules = '\n# Early Hints (written by tools/postbuild.mjs): what each page preloads.\n';
let count = 0;
for (const file of pages.sort()) {
  const html = await readFile(file, 'utf8');
  const links = [];
  for (const tag of html.match(/<link rel="preload"[^>]*>/g) ?? []) {
    const attr = (n) => tag.match(new RegExp(` ${n}="([^"]*)"`))?.[1];
    const as = attr('as');
    if (as === 'font' && attr('href')) links.push(`<${attr('href')}>; rel=preload; as=font; type=font/woff2; crossorigin`);
    else if (as === 'image' && attr('imagesrcset')) {
      const first = attr('imagesrcset').split(',')[0].trim().split(' ')[0];
      links.push(`<${first}>; rel=preload; as=image; imagesrcset="${attr('imagesrcset')}"; imagesizes="${attr('imagesizes') ?? '100vw'}"; fetchpriority=high`);
    }
  }
  if (!links.length) continue;
  const path = '/' + relative(root, file).replace(/index\.html$/, '');
  rules += `${(BASE ? '/' + BASE : '') + path}\n  Link: ${links.join(', ')}\n`;
  count++;
}
await appendFile(join(DIST, '_headers'), rules);
console.log(`postbuild: Link headers for ${count} pages`);
