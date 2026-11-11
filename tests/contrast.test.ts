// Every colour pair the site uses for text, checked against WCAG 2.2 AAA: 7:1 for normal text,
// 4.5:1 for large text (at least 24px, or 18.66px bold). The tokens are read from global.css, so
// a change there that drops below the line fails here.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const token = (name: string) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${name} not found`);
  return m[1]!;
};

type RGB = [number, number, number];
const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;
const lum = ([r, g, b]: RGB) => {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (fg: string | RGB, bg: string | RGB) => {
  const a = lum(typeof fg === 'string' ? rgb(fg) : fg);
  const b = lum(typeof bg === 'string' ? rgb(bg) : bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
/** `fg` at `alpha` over `bg`, in sRGB, as the browser blends it. */
const over = (fg: string, alpha: number, bg: string): RGB =>
  rgb(fg).map((c, i) => Math.round(c * alpha + rgb(bg)[i]! * (1 - alpha))) as RGB;

const bg = token('bg');
const bg2 = token('bg-2');
const bg3 = token('bg-3');
const text = token('text');
const text2 = token('text-2');
const text3 = token('text-3');
const redInk = token('red-ink');
const red = token('red');

describe('AAA contrast, normal text (7:1)', () => {
  const pairs: [string, string, string][] = [
    ['text on bg', text, bg],
    ['text-2 on bg', text2, bg],
    ['text-3 on bg', text3, bg],
    ['red-ink on bg', redInk, bg],
    ['text on bg-2', text, bg2],
    ['text-2 on bg-2', text2, bg2],
    ['text-3 on bg-2', text3, bg2],
    ['red-ink on bg-2', redInk, bg2],
    ['text on bg-3', text, bg3],
    ['text-2 on bg-3', text2, bg3],
    ['bg on text (default button)', bg, text],
    ['status ok on bg-2', '#7ed9a0', bg2],
  ];
  for (const [name, fg, back] of pairs) {
    it(name, () => expect(ratio(fg, back)).toBeGreaterThanOrEqual(7));
  }
});

describe('AAA contrast, large text (4.5:1)', () => {
  it('white on the brand red (buttons, 19.2px bold)', () => expect(ratio('#ffffff', red)).toBeGreaterThanOrEqual(4.5));
});

// The hero's words sit over the photo with a dark text halo (text-shadow), which WCAG counts as the
// text's background when the halo is at least a pixel wide; the halo colour is #000 against --text.
describe('the hero halo', () => {
  it('keeps text at 7:1 against the halo', () => expect(ratio(text, '#000000')).toBeGreaterThanOrEqual(7));
  it('keeps red-ink at 4.5:1 against the halo (the tagline is large, bold)', () => expect(ratio(redInk, '#000000')).toBeGreaterThanOrEqual(4.5));
});
