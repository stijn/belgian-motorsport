// The numbers count up when the strip comes into view: "125K" runs 0 → 125 with its K, "2,750"
// keeps its comma. With motion reduced, or without IntersectionObserver, they're just there.
const motion = document.documentElement.classList.contains('js-motion');
const els = [...document.querySelectorAll<HTMLElement>('[data-count]')];

const parse = (text: string) => {
  const m = text.match(/^([\d,.]+)(.*)$/);
  if (!m) return null;
  const target = Number(m[1]!.replace(/,/g, ''));
  const group = m[1]!.includes(',');
  return { target, suffix: m[2] ?? '', group };
};
const fmt = (n: number, group: boolean) => (group ? Math.round(n).toLocaleString('en-GB') : String(Math.round(n)));

const returning = document.documentElement.classList.contains('js-return');
if (motion && !returning && 'IntersectionObserver' in window && els.length) {
  const run = (el: HTMLElement) => {
    const p = parse(el.dataset.count ?? el.textContent ?? '');
    if (!p) return;
    const t0 = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const x = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - x, 3);
      el.firstChild!.textContent = fmt(p.target * eased, p.group) + p.suffix;
      if (x < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        run(e.target as HTMLElement);
        io.unobserve(e.target);
      }
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => {
    const p = parse(el.dataset.count ?? '');
    if (p) el.firstChild!.textContent = fmt(0, p.group) + p.suffix;
    io.observe(el);
  });
}

export {};
