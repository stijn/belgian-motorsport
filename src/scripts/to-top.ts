// The chequered flag appears once the first screen has scrolled away, and takes you back up.
const flag = document.querySelector<HTMLAnchorElement>('[data-to-top]');
if (flag) {
  const onScroll = () => flag.classList.toggle('show', window.scrollY > window.innerHeight * 0.8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  flag.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: document.documentElement.classList.contains('js-motion') ? 'smooth' : 'auto' });
    document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
  });
}
