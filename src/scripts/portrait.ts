// The portraits in About cross-fade every five seconds, with a slow zoom (CSS). Reduced motion:
// the first photo stays.
const box = document.querySelector<HTMLElement>('[data-portraits]');
if (box && document.documentElement.classList.contains('js-motion')) {
  const pics = [...box.querySelectorAll<HTMLElement>('[data-portrait]')];
  if (pics.length > 1) {
    let i = 0;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(timer);
      if (e?.isIntersecting) timer = window.setInterval(next, 5000);
    });
    let timer = 0;
    const next = () => {
      pics[i]!.classList.remove('active');
      i = (i + 1) % pics.length;
      pics[i]!.classList.add('active');
    };
    io.observe(box);
  }
}
