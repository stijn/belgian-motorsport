// The header: solid once the page scrolls, its logo held back while the hero's logo is on screen, a
// menu on small screens, the language menu closing when clicked away, and the current section underlined.
const header = document.querySelector<HTMLElement>('[data-header]');
const btn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
const lang = document.querySelector<HTMLDetailsElement>('[data-lang]');

// Solid once the page is past the top. Set right away, again after the first frame, on load and on
// show: a page that opens at an anchor (a language switch, "back") is scrolled before any scroll event.
const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 24);
onScroll();
requestAnimationFrame(onScroll);
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('load', onScroll);
window.addEventListener('pageshow', onScroll);
window.addEventListener('hashchange', onScroll);

const heroLogo = document.querySelector('[data-hero-logo]');
if (header && heroLogo && 'IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => header.classList.toggle('brand-hidden', !!e?.isIntersecting), { threshold: 0.2 }).observe(heroLogo);
} else {
  header?.classList.remove('brand-hidden');
}

if (btn && menu) {
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      set(false);
      btn.focus();
    }
  });
  matchMedia('(min-width: 961px)').addEventListener('change', (e) => e.matches && set(false));
}

if (lang) {
  // Switching language keeps the place on the page: the section in view goes into the link's hash.
  lang.querySelectorAll<HTMLAnchorElement>('a[hreflang]').forEach((a) =>
    a.addEventListener('click', () => {
      const here = [...document.querySelectorAll<HTMLElement>('main section[id]')].filter((s) => s.getBoundingClientRect().top <= 120).pop();
      a.hash = here && window.scrollY > 160 ? `#${here.id}` : '';
    }),
  );
  document.addEventListener('click', (e) => {
    if (lang.open && !lang.contains(e.target as Node)) lang.open = false;
  });
  lang.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lang.open) {
      lang.open = false;
      lang.querySelector('summary')?.focus();
    }
  });
}

// A page rendered ahead of time (speculation rules) is shown for the link's URL with its hash, but the
// browser doesn't scroll to that hash on activation: do it here, instantly, and again if the hash changes.
const toHash = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  const el = id ? document.getElementById(id) : null;
  if (el && Math.abs(el.getBoundingClientRect().top) > 150) el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
};
const doc = document as Document & { prerendering?: boolean };
if (doc.prerendering) document.addEventListener('prerenderingchange', toHash, { once: true });
else toHash();

// Underline the section in view (home page only: the links have hashes).
const links = new Map(
  [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')]
    .filter((a) => a.hash && a.pathname === location.pathname)
    .map((a) => [a.hash.slice(1), a]),
);
if (links.size && 'IntersectionObserver' in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        links.forEach((a) => a.classList.remove('active'));
        links.get(e.target.id)?.classList.add('active');
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  links.forEach((_, id) => {
    const s = document.getElementById(id);
    if (s) spy.observe(s);
  });
}
