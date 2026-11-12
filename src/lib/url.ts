// Paths that work wherever the site is served from: at the root of the real domain, or under a
// base path when BASE is set (astro.config.mjs reads SITE and BASE), and in any of the languages
// (English at the root, the others under /nl/, /fr/, /de/, /it/, /es/).
import { defaultLang, prefix, type Lang } from '../i18n';

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** `href('/privacy/', 'nl')` → '/nl/privacy/' (with the base path in front, when there is one). */
export const href = (path: string, lang: Lang = defaultLang) => (path.startsWith('/') ? `${base}${prefix(lang)}${path}` : path);
