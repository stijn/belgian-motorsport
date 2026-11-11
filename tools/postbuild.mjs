// After `astro build`: each language's 404 page moves from /<lang>/404/index.html to /<lang>/404.html,
// where Cloudflare's static assets find it as the nearest 404 page for a missing path under /<lang>/.
// (The root 404.html Astro writes itself. GitHub Pages only knows the root one.)
import { existsSync } from 'node:fs';
import { rename, rm } from 'node:fs/promises';
import { join } from 'node:path';

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
