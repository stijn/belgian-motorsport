#!/usr/bin/env node
// Builds the favicon and home-screen icons from the BM logo. Run `npm run icons` after changing it.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const root = new URL('..', import.meta.url).pathname;
const logo = `${root}src/assets/bm-logo.png`; // 1380×512, transparent
const out = `${root}public/`;
const BG = '#0b0b0c';
await mkdir(out, { recursive: true });

/** The logo centred on a dark square; `inset` is the share of the side kept free around it. */
async function square(size, inset, file) {
  const w = Math.round(size * (1 - 2 * inset));
  const l = await sharp(logo).resize({ width: w }).png().toBuffer();
  const { height } = await sharp(l).metadata();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: l, left: Math.round((size - w) / 2), top: Math.round((size - height) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(out + file);
  console.log(file);
}

await square(48, 0.04, 'favicon.png');
await square(180, 0.1, 'apple-touch-icon.png');
await square(192, 0.1, 'icon-192.png');
await square(512, 0.1, 'icon-512.png');
// Maskable: platforms crop up to 10% on each side, so the logo sits inside the safe zone.
await square(512, 0.2, 'icon-maskable-512.png');

// The share cards are made by tools/share-cards.mjs (npm run cards).
