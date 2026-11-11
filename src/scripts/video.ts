// Films open in the lightbox, from the no-cookie domain, only after a click. Until then each one is a
// still from the site itself, so the page sends nothing to Google. Previous and next (buttons and
// arrow keys) move through the films without leaving the lightbox; closing removes the player.
import { makeDialog } from './lightbox';

const cards = [...document.querySelectorAll<HTMLElement>('[data-video]')];
const tpl = document.querySelector<HTMLTemplateElement>('[data-film-icons]');

if (cards.length && tpl) {
  const L = tpl.dataset;
  const dlg = makeDialog('lightbox-film');
  dlg.innerHTML = `
    <div class="lb-stage">
      <div class="lb-frame"></div>
      <p class="lb-caption"><span></span><a target="_blank" rel="noopener"></a></p>
    </div>
    <button type="button" class="lb-btn lb-prev" aria-label="${L.prev}" data-tip="${L.prev}" data-replay></button>
    <button type="button" class="lb-btn lb-next" aria-label="${L.next}" data-tip="${L.next}" data-replay></button>
    <button type="button" class="lb-btn lb-close tip-left" aria-label="${L.close}" data-tip="${L.close}" data-replay></button>
    <p class="lb-count" aria-live="polite"></p>`;
  for (const [name, sel] of [['prev', '.lb-prev'], ['next', '.lb-next'], ['close', '.lb-close']] as const) {
    const svg = tpl.content.querySelector(`[data-icon="${name}"] svg`)?.cloneNode(true);
    if (svg) dlg.querySelector(sel)!.replaceChildren(svg);
  }
  const frame = dlg.querySelector<HTMLElement>('.lb-frame')!;
  const cap = dlg.querySelector<HTMLElement>('.lb-caption span')!;
  const link = dlg.querySelector<HTMLAnchorElement>('.lb-caption a')!;
  const count = dlg.querySelector<HTMLElement>('.lb-count')!;
  let i = 0;
  let opener: HTMLElement | null = null;

  const show = (n: number) => {
    i = (n + cards.length) % cards.length;
    const card = cards[i]!;
    const id = card.dataset.video!;
    const player = document.createElement('iframe');
    player.className = 'lb-film';
    player.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`;
    player.title = card.dataset.title ?? 'Video';
    player.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.replaceChildren(player); // the old player goes with its sound
    cap.textContent = card.dataset.title ?? '';
    link.href = `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
    link.textContent = L.watch ?? 'YouTube';
    count.textContent = `${i + 1} / ${cards.length}`;
  };
  const open = (n: number, from: HTMLElement) => {
    opener = from;
    show(n);
    dlg.showModal();
    document.body.style.overflow = 'hidden';
    dlg.querySelector<HTMLElement>('.lb-next')?.focus();
  };
  dlg.addEventListener('close', () => {
    frame.replaceChildren(); // stops the sound
    document.body.style.overflow = '';
    opener?.focus();
  });
  cards.forEach((card, n) => card.querySelector<HTMLButtonElement>('[data-play]')?.addEventListener('click', (e) => open(n, e.currentTarget as HTMLElement)));
  dlg.querySelector('.lb-prev')!.addEventListener('click', () => show(i - 1));
  dlg.querySelector('.lb-next')!.addEventListener('click', () => show(i + 1));
  dlg.querySelector('.lb-close')!.addEventListener('click', () => dlg.close());
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(i + 1);
    else if (e.key === 'ArrowLeft') show(i - 1);
  });
}
