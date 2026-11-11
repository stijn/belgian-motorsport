// line-md icons draw themselves with SVG <animate>, which starts the moment the page loads. Here
// each one waits until it's on screen, and inside a [data-replay] element (a link, a button) it
// draws again on hover or focus. With motion reduced every icon shows its finished shape.
const motion = document.documentElement.classList.contains('js-motion');

const finish = (svg: SVGSVGElement) => {
  svg.setCurrentTime?.(10);
  svg.pauseAnimations?.();
};
export const replay = (svg: SVGSVGElement) => {
  if (!motion) return;
  svg.setCurrentTime?.(0);
  svg.unpauseAnimations?.();
};

const icons = [...document.querySelectorAll<SVGSVGElement>('svg[data-line-md]')];

if (!motion || !('IntersectionObserver' in window)) {
  icons.forEach(finish);
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        replay(e.target as SVGSVGElement);
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  for (const svg of icons) {
    const r = svg.getBoundingClientRect();
    const onScreen = r.top < innerHeight && r.bottom > 0 && r.width > 0;
    if (onScreen) continue; // let it draw now
    svg.pauseAnimations?.();
    svg.setCurrentTime?.(0);
    io.observe(svg);
  }
  // Hover or focus replays the icons inside the element.
  for (const host of document.querySelectorAll<HTMLElement>('[data-replay]')) {
    const again = () => host.querySelectorAll<SVGSVGElement>('svg[data-line-md]').forEach(replay);
    host.addEventListener('mouseenter', again);
    host.addEventListener('focusin', again);
  }
}

// Icons added later (the lightbox, the form's status) draw themselves when they appear.
new MutationObserver((records) => {
  for (const r of records) {
    r.addedNodes.forEach((n) => {
      if (!(n instanceof Element)) return;
      const list = n.matches('svg[data-line-md]') ? [n as SVGSVGElement] : [...n.querySelectorAll<SVGSVGElement>('svg[data-line-md]')];
      list.forEach((svg) => (motion ? replay(svg) : finish(svg)));
    });
  }
}).observe(document.body, { childList: true, subtree: true });
