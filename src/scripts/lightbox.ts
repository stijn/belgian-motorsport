// A lightbox for the photo grid: one <dialog>, arrow keys, swipe, and the photo's caption.
// Each figure button carries data-full (a large WebP), data-alt and data-caption.
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-lightbox]')];
if (buttons.length) {
  const dlg = document.createElement('dialog');
  dlg.className = 'lightbox';
  dlg.innerHTML = `
    <div class="lb-stage">
      <img alt="" decoding="async" />
      <p class="lb-caption"></p>
    </div>
    <button type="button" class="lb-btn lb-prev" aria-label="Previous photo" data-replay>&#8592;</button>
    <button type="button" class="lb-btn lb-next" aria-label="Next photo" data-replay>&#8594;</button>
    <button type="button" class="lb-btn lb-close" aria-label="Close" data-replay>&#215;</button>
    <p class="lb-count" aria-live="polite"></p>`;
  // The animated icons rendered by Gallery.astro replace the text arrows.
  const tpl = document.querySelector<HTMLTemplateElement>('[data-lightbox-icons]');
  for (const [name, sel] of [['prev', '.lb-prev'], ['next', '.lb-next'], ['close', '.lb-close']] as const) {
    const svg = tpl?.content.querySelector(`[data-icon="${name}"] svg`);
    if (svg) dlg.querySelector(sel)!.replaceChildren(svg.cloneNode(true));
  }
  document.body.append(dlg);
  const img = dlg.querySelector('img')!;
  const cap = dlg.querySelector<HTMLElement>('.lb-caption')!;
  const count = dlg.querySelector<HTMLElement>('.lb-count')!;
  let i = 0;
  let opener: HTMLElement | null = null;

  const show = (n: number) => {
    i = (n + buttons.length) % buttons.length;
    const b = buttons[i]!;
    img.classList.remove('lb-switch');
    void img.offsetWidth; // restart the switch animation
    img.classList.add('lb-switch');
    img.src = b.dataset.full ?? '';
    img.alt = b.dataset.alt ?? '';
    cap.textContent = b.dataset.caption ?? '';
    count.textContent = `${i + 1} / ${buttons.length}`;
    // Warm up the neighbours.
    for (const d of [1, -1]) {
      const n2 = buttons[(i + d + buttons.length) % buttons.length];
      if (n2?.dataset.full) new Image().src = n2.dataset.full;
    }
  };
  const open = (n: number, from: HTMLElement) => {
    opener = from;
    show(n);
    dlg.showModal();
    document.body.style.overflow = 'hidden';
  };
  const close = () => dlg.close();
  dlg.addEventListener('close', () => {
    document.body.style.overflow = '';
    img.removeAttribute('src');
    opener?.focus();
  });

  buttons.forEach((b, n) => b.addEventListener('click', () => open(n, b)));
  dlg.querySelector('.lb-prev')!.addEventListener('click', () => show(i - 1));
  dlg.querySelector('.lb-next')!.addEventListener('click', () => show(i + 1));
  dlg.querySelector('.lb-close')!.addEventListener('click', close);
  dlg.addEventListener('click', (e) => {
    // The backdrop, or the empty stage around the photo.
    if (e.target === dlg || (e.target as HTMLElement).classList.contains('lb-stage')) close();
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(i + 1);
    else if (e.key === 'ArrowLeft') show(i - 1);
  });
  let x0 = 0;
  dlg.addEventListener('touchstart', (e) => (x0 = e.touches[0]!.clientX), { passive: true });
  dlg.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0]!.clientX - x0;
    if (Math.abs(dx) > 50) show(dx < 0 ? i + 1 : i - 1);
  });
}
