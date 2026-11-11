// Belgian Motorsport service worker: after one visit the site opens without a connection.
// - Pages: shown from the saved copy straight away, then refreshed in the background
//   (stale-while-revalidate). With no connection at all, the saved copy is it.
// - Files in /_astro/ (scripts, fonts, photos) have a content hash in their name, so a saved copy
//   is always right: device first, network only when missing.
// - Nothing is downloaded just to fill the cache. After the first visit the page sends the list of
//   files it already loaded, and they're copied from the browser's own cache.
// - When a page changes (a new deploy), files no saved page uses any more are removed, and the open
//   page is told, so it can offer a reload (src/scripts/offline.ts).
// - The refresh skips the browser's HTTP cache: GitHub Pages and some CDNs tell browsers to keep a
//   page for ten minutes, which would otherwise hold a new deploy back.
// Bump VERSION when the logic below changes, so browsers pick up the new worker.
const VERSION = 2;
const PAGES = 'bm-pages-v' + VERSION;
const ASSETS = 'bm-assets-v' + VERSION;
const FILE = /[\w.-]+\.(?:js|css|woff2|avif|webp|jpe?g|png|svg)\b/g;
// Where the site lives: '/' on its domain, '/belgian-motorsport/' on the GitHub Pages demo.
const BASE = new URL('./', self.location).pathname;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== PAGES && key !== ASSETS) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

/** One cache entry per page: no query string or #hash, and index.html is the folder. */
const pageKey = (href) => {
  const url = new URL(href);
  return url.origin + url.pathname.replace(/index\.html$/, '');
};
const isAsset = (url) => url.pathname.startsWith(BASE + '_astro/');

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE) || url.pathname.startsWith(BASE + 'api/')) return;
  if (req.mode === 'navigate') event.respondWith(page(event));
  else if (isAsset(url)) event.respondWith(asset(req));
});

async function page(event) {
  const req = event.request;
  const key = pageKey(req.url);
  const cache = await caches.open(PAGES);
  const cached = await cache.match(key);
  const before = cached ? cached.clone().text() : Promise.resolve(null);

  const fresh = fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' })).then(async (res) => {
    if (res.ok && (res.headers.get('content-type') || '').includes('text/html')) {
      const [old, now] = await Promise.all([before, res.clone().text()]);
      await cache.put(key, res.clone());
      if (old !== null && old !== now) {
        await prune();
        for (const c of await self.clients.matchAll({ type: 'window' })) {
          if (pageKey(c.url) === key) c.postMessage({ type: 'updated', url: key });
        }
      }
    }
    return res;
  });

  if (cached) {
    event.waitUntil(fresh.catch(() => {}));
    return cached;
  }
  try {
    return await fresh;
  } catch {
    return (await fallback(cache)) || offlinePage();
  }
}

/** No copy of this page: the home page, else any saved page. */
async function fallback(cache) {
  const home = await cache.match(self.location.origin + BASE);
  if (home) return home;
  const any = (await cache.keys())[0];
  return any ? cache.match(any) : null;
}

function offlinePage() {
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>No connection · Belgian Motorsport</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0c;color:#f3f2ef;font:1.1rem/1.5 system-ui,sans-serif;text-align:center;padding:2rem">
<main><p style="color:#e10600;font-weight:800;font-size:2.5rem;font-style:italic;margin:0">BM</p><h1 style="font-size:1.6rem;margin:.5rem 0 1rem">No connection</h1><p>This page isn’t saved on this device yet. Try again when you’re back online.</p></main></body></html>`;
  return new Response(html, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

async function asset(req) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(req.url);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok && res.type === 'basic') {
    cache.put(req.url, res.clone()).catch(() => {});
  }
  return res;
}

/** Keep only files that a saved page uses, directly or through its scripts. */
async function prune() {
  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  const byName = new Map();
  for (const req of await assets.keys()) byName.set(req.url.split('/').pop(), req);
  const keep = new Set();
  const queue = [];
  const scan = (text) => {
    for (const [name] of text.matchAll(FILE)) if (!keep.has(name)) { keep.add(name); queue.push(name); }
  };
  for (const req of await pages.keys()) scan(await (await pages.match(req)).text());
  while (queue.length) {
    const name = queue.pop();
    if (name.endsWith('.js') && byName.has(name)) scan(await (await assets.match(byName.get(name))).text());
  }
  for (const [name, req] of byName) if (!keep.has(name)) await assets.delete(req);
}

// The page lists what it loaded before this worker was in charge; copy those from the browser's own
// cache (force-cache: no new download, even if a little stale).
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || data.type !== 'cache' || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      const assets = await caches.open(ASSETS);
      for (const href of data.urls) {
        try {
          const url = new URL(href, self.location.href);
          if (url.origin !== self.location.origin) continue;
          if (isAsset(url)) {
            if (await assets.match(url.href)) continue;
            const res = await fetch(url.href, { cache: 'force-cache' });
            if (res.ok) await assets.put(url.href, res);
          } else if (href === data.page) {
            const key = pageKey(href);
            if (await pages.match(key)) continue;
            const res = await fetch(key, { cache: 'force-cache' });
            if (res.ok) await pages.put(key, res);
          }
        } catch {
          /* no connection: the next visit tries again */
        }
      }
    })(),
  );
});
