// Six languages. English lives at the root, the others under /nl/, /fr/, /de/, /it/, /es/.
import { en, type Dict } from './en';
import { nl } from './nl';
import { fr } from './fr';
import { de } from './de';
import { it } from './it';
import { es } from './es';

export const langs = ['en', 'nl', 'fr', 'de', 'it', 'es'] as const;
export type Lang = (typeof langs)[number];
export const defaultLang: Lang = 'en';

const dicts: Record<Lang, Dict> = { en, nl, fr, de, it, es };

export const t = (lang: Lang): Dict => dicts[lang];

/** Fills {name} slots: fill('{n} photos', { n: 8 }). */
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));

/** The URL prefix of a language: '' for English, '/nl' for Dutch. */
export const prefix = (lang: Lang) => (lang === defaultLang ? '' : `/${lang}`);

export const isLang = (s: string | undefined): s is Lang => (langs as readonly string[]).includes(s ?? '');
