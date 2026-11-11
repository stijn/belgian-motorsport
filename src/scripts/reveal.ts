// Sections and cards slide in as they come into view. With motion reduced (or no JS) they're just there.
const root = document.documentElement;
const els = document.querySelectorAll<HTMLElement>('.rv');
if (root.classList.contains('js-motion') && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -5% 0px' },
  );
  els.forEach((el) => {
    const group = el.closest<HTMLElement>('[data-stagger]');
    if (group) {
      const i = [...group.querySelectorAll('.rv')].indexOf(el);
      el.style.transitionDelay = `${Math.min(i, 8) * 70}ms`;
    }
    io.observe(el);
  });
} else {
  els.forEach((el) => el.classList.add('in'));
}
