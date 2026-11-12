// Blurred thumbnails for the photos: a 20 px wide WebP of each image under src/assets/{hero,gallery,
// albums,videos,portrait}, as a data URI in src/data/lqip.json, keyed "folder/file". The components
// paint it behind the photo (src/lib/lqip.ts), so something shows at once on a slow connection and
// the real photo fades in over it. Runs before every build (npm run build); `npm run lqip` by hand.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const FOLDERS = ['hero', 'gallery', 'albums', 'videos', 'portrait'];
const WIDTH = 20;
const out = {};
let bytes = 0;
for (const folder of FOLDERS) {
  const dir = join('src/assets', folder);
  let files = [];
  try {
    files = (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
  } catch {
    continue;
  }
  for (const file of files) {
    const buf = await sharp(await readFile(join(dir, file))).resize({ width: WIDTH }).webp({ quality: 40, alphaQuality: 40 }).toBuffer();
    out[`${folder}/${file}`] = `data:image/webp;base64,${buf.toString('base64')}`;
    bytes += buf.length;
  }
}
await writeFile('src/data/lqip.json', JSON.stringify(out, null, 0) + '\n');
console.log(`lqip: ${Object.keys(out).length} thumbnails, ${Math.round(bytes / 1024)} KB of WebP (${Math.round((bytes * 4) / 3 / 1024)} KB as text)`);
