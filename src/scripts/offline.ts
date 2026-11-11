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
