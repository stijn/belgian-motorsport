// One <dialog> lightbox for the photos (and the films, see video.ts): arrow keys, swipe, the caption
// with a link to the photo on Flickr. Each figure button carries data-full, data-alt, data-caption
// and data-link; labels and icons come from the <template data-lightbox-icons> in Gallery.astro.
const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-lightbox]')];
const tpl = document.querySelector<HTMLTemplateElement>('[data-lightbox-icons]');

export function makeDialog(className: string) {
  const dlg = document.createElement('dialog');
  dlg.className = `lightbox ${className}`;
  document.body.append(dlg);
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || (e.target as HTMLElement).classList.contains('lb-stage')) dlg.close();
  });
  return dlg;
}
export const iconFor = (name: string) => tpl?.content.querySelector(`[data-icon="${name}"] svg`)?.cloneNode(true);

if (buttons.length && tpl) {
  const L = tpl.dataset;
  const dlg = makeDialog('lightbox-photos');
  dlg.innerHTML = `
    <div class="lb-stage">
      <img alt="" decoding="async" />
      <p class="lb-caption"><span></span></p>
    </div>
    <button type="button" class="lb-btn lb-prev" aria-label="${L.prev}" data-tip="${L.prev}" data-replay></button>
    <button type="button" class="lb-btn lb-next" aria-label="${L.next}" data-tip="${L.next}" data-replay></button>
    <button type="button" class="lb-btn lb-close tip-left" aria-label="${L.close}" data-tip="${L.close}" data-replay></button>
    <p class="lb-count" aria-live="polite"></p>`;
  for (const [name, sel] of [['prev', '.lb-prev'], ['next', '.lb-next'], ['close', '.lb-close']] as const) {
    const svg = iconFor(name);
    if (svg) dlg.querySelector(sel)!.replaceChildren(svg);
  }
  const img = dlg.querySelector('img')!;
  const cap = dlg.querySelector<HTMLElement>('.lb-caption span')!;
  const capP = dlg.querySelector<HTMLElement>('.lb-caption')!;
  const link = document.createElement('a');
  link.target = '_blank';
  link.rel = 'noopener';
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
    link.href = b.dataset.link ?? '';
    link.textContent = L.see ?? 'Flickr';
    if (!link.isConnected) capP.append(link);
    count.textContent = `${i + 1} / ${buttons.length}`;
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
  dlg.addEventListener('close', () => {
    document.body.style.overflow = '';
    img.removeAttribute('src');
    opener?.focus();
  });
  buttons.forEach((b, n) => b.addEventListener('click', () => open(n, b)));
  dlg.querySelector('.lb-prev')!.addEventListener('click', () => show(i - 1));
  dlg.querySelector('.lb-next')!.addEventListener('click', () => show(i + 1));
  dlg.querySelector('.lb-close')!.addEventListener('click', () => dlg.close());
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
