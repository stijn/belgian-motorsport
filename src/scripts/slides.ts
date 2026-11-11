// One slideshow: the slides cross-fade on a clock, the control's dots follow (the active one fills),
// a dot press jumps, the pause button stops the clock and freezes the fill and the photo's drift
// (the root gets .paused; the CSS does the freezing). With motion reduced there is no clock: the
// first slide stays until a dot is pressed.
export interface Slideshow {
  start: () => void;
  stop: () => void;
}

export function slideshow(root: HTMLElement, slides: HTMLElement[], opts: { interval: number; leaveMs: number; autoplay: boolean }): Slideshow {
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-go]')];
  const pp = root.querySelector<HTMLButtonElement>('[data-pp]');
  let i = 0;
  let timer = 0;
  let paused = false;
  let awake = true;

  const restartFill = (dot?: HTMLElement) => {
    const fill = dot?.querySelector<HTMLElement>('.fill');
    if (!fill) return;
    fill.style.animation = 'none';
    void fill.offsetWidth;
    fill.style.animation = '';
  };
  const show = (n: number) => {
    const next = (n + slides.length) % slides.length;
    if (next === i) {
      restartFill(dots[i]);
      return;
    }
    const old = slides[i]!;
    old.classList.remove('active');
    old.classList.add('leaving');
    setTimeout(() => old.classList.remove('leaving'), opts.leaveMs);
    i = next;
    slides[i]!.classList.add('active');
    dots.forEach((d, k) => {
      d.classList.toggle('active', k === i);
      d.setAttribute('aria-pressed', String(k === i));
      if (k === i) restartFill(d);
    });
  };
  const tick = () => {
    clearTimeout(timer);
    if (opts.autoplay && awake && !paused && !document.hidden) timer = window.setTimeout(() => (show(i + 1), tick()), opts.interval);
  };
  dots.forEach((d) => d.addEventListener('click', () => (show(Number(d.dataset.go)), tick())));
  pp?.addEventListener('click', () => {
    paused = !paused;
    root.classList.toggle('paused', paused);
    pp.setAttribute('aria-pressed', String(paused));
    pp.setAttribute('aria-label', (paused ? pp.dataset.play : pp.dataset.pause) ?? '');
    if (!paused) restartFill(dots[i]);
    tick();
  });
  document.addEventListener('visibilitychange', tick);
  return {
    start: () => ((awake = true), tick()),
    stop: () => ((awake = false), clearTimeout(timer)),
  };
}
