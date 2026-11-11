// Photos fade in over their dark placeholder once they arrive (load events don't bubble: capture).
const mark = (img: HTMLImageElement) => img.classList.add('is-loaded');
document.addEventListener('load', (e) => e.target instanceof HTMLImageElement && mark(e.target), true);
document.querySelectorAll<HTMLImageElement>('.ph img').forEach((img) => img.complete && img.naturalWidth > 0 && mark(img));
