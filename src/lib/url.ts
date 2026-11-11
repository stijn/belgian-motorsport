// Paths that work wherever the site is served from: at the root of the real domain, or under
// /belgian-motorsport/ on the GitHub Pages demo (astro.config.mjs reads SITE and BASE), and in any
// of the languages (English at the root, the others under /nl/, /fr/, /de/, /it/, /es/).
import { defaultLang, prefix, type Lang } from '../i18n';

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** `href('/privacy/', 'nl')` → '/nl/privacy/' live, '/belgian-motorsport/nl/privacy/' on the demo. */
export const href = (path: string, lang: Lang = defaultLang) => (path.startsWith('/') ? `${base}${prefix(lang)}${path}` : path);

/** True for the GitHub Pages demo build: noindex, and the form switched off. */
export const demo = import.meta.env.PUBLIC_DEMO === '1';
