// Paths that work wherever the site is served from: at the root of the real domain, or under
// /belgian-motorsport/ on the GitHub Pages demo (astro.config.mjs reads SITE and BASE).
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
/** `href('/privacy/')` → '/privacy/' live, '/belgian-motorsport/privacy/' on the demo. */
export const href = (path: string) => (path.startsWith('/') ? `${base}${path}` : path);
/** True for the GitHub Pages demo build: noindex, a preview bar, and the form switched off. */
export const demo = import.meta.env.PUBLIC_DEMO === '1';
