// The hero's photos: one every six seconds, the control's dots following; a dot jumps, the pause
// button holds the photo (src/scripts/slides.ts). Paused while the tab is hidden.
import { slideshow } from './slides';

const hero = document.querySelector<HTMLElement>('[data-hero]');
if (hero) {
  const slides = [...hero.querySelectorAll<HTMLElement>('[data-slide]')];
  const motion = document.documentElement.classList.contains('js-motion');
  slideshow(hero, slides, { interval: Number(hero.dataset.interval) || 6000, leaveMs: 1300, autoplay: motion }).start();
}
