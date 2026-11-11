// Small things to find: the hero logo revs when hovered (a quick lean, like a car on the throttle),
// and the footer logo sends a car racing along the tricolour. Nothing runs with motion reduced.
const motion = document.documentElement.classList.contains('js-motion');
if (motion) {
  for (const el of document.querySelectorAll<HTMLElement>('[data-delight="rev"]')) {
    el.addEventListener('mouseenter', () => {
      el.classList.remove('rev');
      void el.offsetWidth;
      el.classList.add('rev');
    });
  }
  const footer = document.querySelector<HTMLElement>('[data-footer]');
  for (const el of document.querySelectorAll<HTMLElement>('[data-delight="race"]')) {
    const go = () => {
      if (!footer || footer.classList.contains('racing')) return;
      footer.classList.add('racing');
      setTimeout(() => footer.classList.remove('racing'), 1700);
    };
    el.addEventListener('mouseenter', go);
    el.addEventListener('focus', go);
  }
}
