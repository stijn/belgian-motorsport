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

// Once per visit, on a connection that can take it: load the photos further down the page (so the
// worker saves them), the full-size photos of the lightbox, and this language's other pages. After
// that the whole site opens with no connection, which is the usual state at the track.
const warm = (reg: ServiceWorkerRegistration) => {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!navigator.onLine || conn?.saveData || (conn?.effectiveType && conn.effectiveType !== '4g')) return;
  try {
    if (sessionStorage.getItem('bm-warm')) return;
    sessionStorage.setItem('bm-warm', '1');
  } catch {
    /* storage off: warm anyway */
  }
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
