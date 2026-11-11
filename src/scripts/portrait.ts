// The portraits in About cross-fade every six seconds while they are on screen, with the small
// control under them (src/scripts/slides.ts). Reduced motion: the first photo stays.
import { slideshow } from './slides';

const box = document.querySelector<HTMLElement>('[data-portraits]');
if (box) {
  const pics = [...box.querySelectorAll<HTMLElement>('[data-portrait]')];
  if (pics.length > 1) {
    const motion = document.documentElement.classList.contains('js-motion');
    const show = slideshow(box, pics, { interval: 6000, leaveMs: 1500, autoplay: motion });
    new IntersectionObserver(([e]) => (e?.isIntersecting ? show.start() : show.stop())).observe(box);
  }
}
