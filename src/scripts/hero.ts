// The hero's photos: one every six seconds, each bar filling while its photo shows; a press on a bar
// jumps to that photo and restarts the clock. Paused while the tab is hidden. With motion reduced
// there is no clock: the first photo stays until a bar is pressed.
const hero = document.querySelector<HTMLElement>('[data-hero]');
if (hero) {
  const slides = [...hero.querySelectorAll<HTMLElement>('[data-slide]')];
  const bars = [...hero.querySelectorAll<HTMLButtonElement>('[data-go]')];
  const interval = Number(hero.dataset.interval) || 6000;
  const motion = document.documentElement.classList.contains('js-motion');
  let i = 0;
  let timer = 0;

  const show = (n: number) => {
    const next = (n + slides.length) % slides.length;
    if (next === i) return;
    const old = slides[i]!;
    old.classList.remove('active');
    old.classList.add('leaving');
    setTimeout(() => old.classList.remove('leaving'), 1300);
    i = next;
    slides[i]!.classList.add('active');
    bars.forEach((b, k) => {
      b.classList.toggle('active', k === i);
      b.setAttribute('aria-pressed', String(k === i));
      if (k === i) {
        // Restart the bar's fill from zero.
        const fill = b.querySelector<HTMLElement>('.fill');
        if (fill) {
          fill.style.animation = 'none';
          void fill.offsetWidth;
          fill.style.animation = '';
        }
      }
    });
  };
  const tick = () => {
    clearTimeout(timer);
    if (motion && !document.hidden) timer = window.setTimeout(() => (show(i + 1), tick()), interval);
  };
  bars.forEach((b) => b.addEventListener('click', () => (show(Number(b.dataset.go)), tick())));
  document.addEventListener('visibilitychange', tick);
  tick();
}
