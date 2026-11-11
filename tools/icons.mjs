#!/usr/bin/env node
// Builds the favicon, home-screen icons and the sharing image from the BM logo and one of his photos.
// Run `npm run icons` after changing the logo or the share photo.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const root = new URL('..', import.meta.url).pathname;
const logo = `${root}src/assets/bm-logo.png`; // 1380×512, transparent
const photo = `${root}src/assets/hero/bmw-m1-procar.jpg`;
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

// Share image, 1200×630: the photo darkened at the bottom, the logo, the name and the tagline.
const W = 1200, H = 630;
const pic = await sharp(photo).resize(W, H, { fit: 'cover', position: 'centre' }).toBuffer();
const shade = Buffer.from(`<svg width="${W}" height="${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="#000" stop-opacity="0.05"/><stop offset="1" stop-color="#0b0b0c" stop-opacity="0.92"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="0" y="${H - 8}" width="${W / 3}" height="8" fill="#000"/><rect x="${W / 3}" y="${H - 8}" width="${W / 3}" height="8" fill="#fdda24"/><rect x="${(2 * W) / 3}" y="${H - 8}" width="${W / 3}" height="8" fill="#e10600"/>
  <text x="72" y="${H - 112}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="800" font-size="84" fill="#fff" letter-spacing="-1">BELGIAN MOTORSPORT</text>
  <text x="76" y="${H - 60}" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-weight="700" font-size="30" fill="#ff2a20" letter-spacing="9">PASSIONATE ABOUT CARS</text>
</svg>`);
const mark = await sharp(logo).resize({ width: 300 }).png().toBuffer();
await sharp(pic)
  .composite([{ input: shade, left: 0, top: 0 }, { input: mark, left: 72, top: 64 }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(out + 'og.jpg');
console.log('og.jpg');
