// Films open in the lightbox, from the no-cookie domain, only after a click. Until then each one is a
// still from the site itself, so the page sends nothing to Google. Closing removes the player.
import { makeDialog } from './lightbox';

const cards = [...document.querySelectorAll<HTMLElement>('[data-video]')];
const tpl = document.querySelector<HTMLTemplateElement>('[data-film-icons]');

if (cards.length) {
  const dlg = makeDialog('lightbox-film');
  dlg.innerHTML = `
    <div class="lb-stage"></div>
    <button type="button" class="lb-btn lb-close tip-left" aria-label="${tpl?.dataset.close ?? 'Close'}" data-tip="${tpl?.dataset.close ?? 'Close'}" data-replay></button>`;
  const svg = tpl?.content.querySelector('[data-icon="close"] svg')?.cloneNode(true);
  if (svg) dlg.querySelector('.lb-close')!.replaceChildren(svg);
  const stage = dlg.querySelector<HTMLElement>('.lb-stage')!;
  let opener: HTMLElement | null = null;

  const play = (card: HTMLElement, from: HTMLElement) => {
    const id = card.dataset.video!;
    const frame = document.createElement('iframe');
    frame.className = 'lb-film';
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`;
    frame.title = card.dataset.title ?? 'Video';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    stage.replaceChildren(frame);
    opener = from;
    dlg.showModal();
    document.body.style.overflow = 'hidden';
    frame.focus();
  };
  dlg.addEventListener('close', () => {
    stage.replaceChildren(); // stops the sound
    document.body.style.overflow = '';
    opener?.focus();
  });
  dlg.querySelector('.lb-close')!.addEventListener('click', () => dlg.close());
  cards.forEach((card) => {
    const btn = card.querySelector<HTMLButtonElement>('[data-play]');
    btn?.addEventListener('click', () => play(card, btn));
  });
}
