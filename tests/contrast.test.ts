// Every colour pair the site uses for text, checked against WCAG 2.2 AAA: 7:1 for normal text,
// 4.5:1 for large text (at least 24px, or 18.66px bold). The tokens are read from global.css, so
// a change there that drops below the line fails here. There is one red, used as a surface: white
// on it is bold large text (buttons, the tagline plate, red words in headlines), and icons on the
// dark backgrounds meet the 3:1 non-text rule.
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
const ratio = (fg: string, bg: string) => {
  const a = lum(rgb(fg));
  const b = lum(rgb(bg));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const bg = token('bg');
const bg2 = token('bg-2');
const bg3 = token('bg-3');
const text = token('text');
const text2 = token('text-2');
const text3 = token('text-3');
const red = token('red');

describe('AAA contrast, normal text (7:1)', () => {
  const pairs: [string, string, string][] = [
    ['text on bg', text, bg],
    ['text-2 on bg', text2, bg],
    ['text-3 on bg', text3, bg],
    ['text on bg-2', text, bg2],
    ['text-2 on bg-2', text2, bg2],
    ['text-3 on bg-2', text3, bg2],
    ['text on bg-3', text, bg3],
    ['text-2 on bg-3', text2, bg3],
    ['bg on text (default button)', bg, text],
    ['status ok on bg-2', '#7ed9a0', bg2],
    ['text against the hero halo', text, '#000000'],
  ];
  for (const [name, fg, back] of pairs) {
    it(name, () => expect(ratio(fg, back)).toBeGreaterThanOrEqual(7));
  }
});

describe('AAA contrast, large bold text on the red (4.5:1)', () => {
  it('white on the brand red: buttons, the tagline plate, menu hover', () => expect(ratio('#ffffff', red)).toBeGreaterThanOrEqual(4.5));
});

describe('non-text contrast (3:1)', () => {
  it('red icons and lines on bg', () => expect(ratio(red, bg)).toBeGreaterThanOrEqual(3));
  it('red icons and lines on bg-2', () => expect(ratio(red, bg2)).toBeGreaterThanOrEqual(3));
});

describe('AAA contrast, red words in headlines (large bold text, 4.5:1)', () => {
  const redText = token('red-text');
  it('red-text on bg', () => expect(ratio(redText, bg)).toBeGreaterThanOrEqual(4.5));
  it('red-text on bg-2', () => expect(ratio(redText, bg2)).toBeGreaterThanOrEqual(4.5));
});

describe('one red', () => {
  it('global.css defines no second red', () => {
    expect(css).not.toMatch(/--red-2|--red-ink/);
  });
});
