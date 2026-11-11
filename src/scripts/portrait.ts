// The portraits in About cross-fade every six seconds, with a slow drift (CSS). The photo on its way
// out keeps .leaving for the length of the fade, so its drift runs on instead of snapping back.
// Reduced motion: the first photo stays.
const box = document.querySelector<HTMLElement>('[data-portraits]');
if (box && document.documentElement.classList.contains('js-motion')) {
  const pics = [...box.querySelectorAll<HTMLElement>('[data-portrait]')];
  if (pics.length > 1) {
    let i = 0;
    let timer = 0;
    const next = () => {
      const old = pics[i]!;
      old.classList.remove('active');
      old.classList.add('leaving');
      setTimeout(() => old.classList.remove('leaving'), 1500);
      i = (i + 1) % pics.length;
      pics[i]!.classList.add('active');
    };
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e?.isIntersecting) timer = window.setInterval(next, 6000);
    });
    io.observe(box);
  }
}
