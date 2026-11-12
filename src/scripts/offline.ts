// Works offline after one visit (see public/sw.js), and says so when the connection drops.
const note = document.querySelector<HTMLElement>('[data-offline]');

const showNote = () => {
  if (!note) return;
  // The live region stays in the page; filling it is what gets announced.
  note.textContent = navigator.onLine ? '' : (note.dataset.text ?? '');
};
window.addEventListener('online', showNote);
window.addEventListener('offline', showNote);
// Back and Forward restore the page from the browser's memory; the connection may have changed since.
window.addEventListener('pageshow', (e) => e.persisted && showNote());
showNote();

// The worker shows the saved copy of a page and fetches the current one behind it. When that one
// differs (a new deploy), it says so, and this note offers a reload.
const update = document.querySelector<HTMLElement>('[data-update]');
if ('serviceWorker' in navigator && update) {
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data?.type !== 'updated') return;
    update.hidden = false;
    update.querySelector('button')?.addEventListener('click', () => location.reload(), { once: true });
  });
}

// A connection that can take extra downloads: online, no data saving, not a slow network.
const goodConnection = () => {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return navigator.onLine && !conn?.saveData && !(conn?.effectiveType && conn.effectiveType !== '4g');
};
/** True the first time per visit for this key, so each stage runs once. */
const once = (key: string) => {
  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
  } catch {
    /* storage off: run anyway */
  }
  return true;
};

// Once per visit, on a connection that can take it: load the photos further down the page (so the
// worker saves them), the full-size photos of the lightbox, and this language's other pages. After
// that the whole site opens with no connection, which is the usual state at the track.
const warm = (reg: ServiceWorkerRegistration) => {
  if (!goodConnection() || !once('bm-warm')) return;
  const run = () => {
    document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
    const files = [...document.querySelectorAll<HTMLElement>('[data-full]')].map((el) => el.dataset.full!).filter(Boolean);
    const here = location.pathname.match(/^(\/[a-z]{2})?\//)?.[1] ?? '';
    const pages = [...new Set([...document.querySelectorAll<HTMLAnchorElement>('a[href]')].map((a) => a.href))].filter((h) => {
      const u = new URL(h);
      if (u.origin !== location.origin || u.hash || u.search || u.pathname === location.pathname) return false;
      const rest = u.pathname.replace(/^\/[a-z]{2}(?=\/)/, (m) => (m === here ? '' : m));
      return /^\/(contact|privacy)\/$/.test(rest) && u.pathname.startsWith(here + '/');
    });
    reg.active?.postMessage({ type: 'warm', pages, files });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 8000 });
  else setTimeout(run, 3000);
};

// After half a minute on the page, when the photos in view have long arrived: the home, contact and
// privacy pages of every language (their photos, scripts and fonts are the same files, already
// saved), so the site opens offline in any language. The list comes from the page's own hreflang
// links, which name this page in every language; the other two pages sit beside each of them.
const warmLanguages = (reg: ServiceWorkerRegistration) => {
  const run = () => {
    if (document.visibilityState !== 'visible') {
      document.addEventListener('visibilitychange', run, { once: true });
      return;
    }
    if (!goodConnection() || !once('bm-warm-langs')) return;
    const lang = document.documentElement.lang.split('-')[0];
    const here = location.pathname;
    const prefix = lang === 'en' ? '' : `/${lang}`;
    const rel = here.startsWith(prefix + '/') ? here.slice(prefix.length) : here; // e.g. /contact/
    const alternates = [...document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')]
      .filter((l) => l.hreflang !== 'x-default')
      .map((l) => new URL(l.href))
      .filter((u) => u.origin === location.origin && u.pathname.endsWith(rel));
    const pages = new Set<string>();
    for (const u of alternates) {
      const altPrefix = u.pathname.slice(0, u.pathname.length - rel.length);
      for (const p of ['/', '/contact/', '/privacy/']) {
        const path = altPrefix + p;
        if (path !== here) pages.add(location.origin + path);
      }
    }
    if (pages.size) reg.active?.postMessage({ type: 'warm', pages: [...pages], files: [] });
  };
  setTimeout(run, 30000);
};

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const start = () => {
    navigator.serviceWorker
      .register(`${base}sw.js`, { scope: base })
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => {
        // Everything this page loaded before the worker took over, so it can be saved from the
        // browser's cache without downloading it again.
        const page = location.href.split('#')[0]!;
        const urls = [page, ...performance.getEntriesByType('resource').map((e) => e.name)];
        reg.active?.postMessage({ type: 'cache', page, urls });
        warm(reg);
        warmLanguages(reg);
      })
      .catch(() => {
        /* no worker (private mode, old browser): the site works as before */
      });
  };
  // After the page has loaded and gone quiet, so it never competes with the page itself.
  const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 1500));
  if (document.readyState === 'complete') idle(start);
  else window.addEventListener('load', () => idle(start), { once: true });
}
