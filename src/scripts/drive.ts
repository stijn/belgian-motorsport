// The cars on the divider lines (Drive.astro): while a line is on screen, a car crosses it a few
// seconds after it appears and then every quarter of a minute or so, in a random size, speed and
// colour. Nothing runs with motion reduced or in a hidden tab.
const motion = document.documentElement.classList.contains('js-motion');
const tracks = [...document.querySelectorAll<HTMLElement>('[data-track]')];

if (motion && tracks.length && 'IntersectionObserver' in window) {
  const timers = new Map<HTMLElement, number>();
  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  const run = (track: HTMLElement) => {
    const car = track.querySelector<HTMLElement>('[data-drive]');
    if (!car) return;
    car.style.setProperty('--w', `${track.offsetWidth}px`);
    car.style.setProperty('--t', `${rand(2.2, 3.6).toFixed(2)}s`);
    car.classList.toggle('alt', Math.random() < 0.5);
    car.classList.toggle('red', Math.random() < 0.15);
    car.classList.remove('go');
    void car.offsetWidth;
    car.classList.add('go');
    car.addEventListener('animationend', () => car.classList.remove('go'), { once: true });
  };
  const schedule = (track: HTMLElement, first: boolean) => {
    clearTimeout(timers.get(track));
    const wait = (first ? rand(3, 8) : rand(12, 28)) * 1000;
    timers.set(
      track,
      window.setTimeout(() => {
        if (!document.hidden) run(track);
        schedule(track, false);
      }, wait),
    );
  };
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const t = e.target as HTMLElement;
        if (e.isIntersecting) schedule(t, true);
        else {
          clearTimeout(timers.get(t));
          timers.delete(t);
        }
      }
    },
    { threshold: 0.5 },
  );
  tracks.forEach((t) => io.observe(t));
}

export {};
