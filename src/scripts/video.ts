// Films load from YouTube only after a click, from the no-cookie domain. Until then each one is a
// still from the site itself, so the page sends nothing to Google.
document.querySelectorAll<HTMLElement>('[data-video]').forEach((card) => {
  const btn = card.querySelector<HTMLButtonElement>('button');
  btn?.addEventListener('click', () => {
    const id = card.dataset.video!;
    const title = card.dataset.title ?? 'Video';
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&modestbranding=1`;
    frame.title = title;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    card.querySelector('.yt-still')?.replaceWith(frame);
    card.classList.add('playing');
    frame.focus();
  });
});
