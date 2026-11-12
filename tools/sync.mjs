#!/usr/bin/env node
// Pulls the latest films and albums into the site, so the home page stays current without any
// third-party script on the page itself:
// - YouTube: the channel's RSS feed (no API key) -> src/data/videos.json, thumbnails in src/assets/videos/
// - Flickr: the public albums page -> src/data/albums.json, album covers in src/assets/albums/
// Run `npm run sync`, look at the diff, commit. Nothing on the live site calls YouTube or Flickr.
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const MAX_VIDEOS = 12;

// Keep in step with src/data/site.ts (this script runs without TypeScript).
const YOUTUBE_CHANNEL_ID = 'UCbIYqYGCs_2YK0oTPtDmVnQ';
const FLICKR_PATH_ALIAS = 'belgian-motorsport';

const exists = (p) => access(p).then(() => true, () => false);
const text = async (url) => {
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'en' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
};
const download = async (url, dest) => {
  if (await exists(dest)) return false;
  const res = await fetch(url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return true;
};
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, '’').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
const tag = (xml, name) => xml.match(new RegExp(`<${name}[^>]*>([^<]*)</${name}>`))?.[1] ?? '';

async function youtube() {
  const xml = await text(`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`);
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
  const dir = join(root, 'src/assets/videos');
  await mkdir(dir, { recursive: true });
  const videos = [];
  for (const e of entries.slice(0, MAX_VIDEOS)) {
    const id = tag(e, 'yt:videoId');
    const title = decode(tag(e, 'title'));
    // The full timestamp with its zone: the VideoObject's uploadDate wants one.
    const published = tag(e, 'published');
    // The first paragraph of his YouTube description (event, date, series), one line, for the VideoObject.
    const description = decode(tag(e, 'media:description')).split(/\n\s*\n/)[0].replace(/\s*\n\s*/g, ', ').trim().slice(0, 200);
    const views = Number(e.match(/<media:statistics views="(\d+)"/)?.[1] ?? 0);
    // The largest thumbnail YouTube has for it; older uploads only have hqdefault.
    let got = false;
    for (const name of ['maxresdefault', 'sddefault', 'hqdefault']) {
      try {
        const res = await fetch(`https://i.ytimg.com/vi/${id}/${name}.jpg`, { headers: { 'user-agent': UA } });
        if (res.ok && Number(res.headers.get('content-length')) > 2000) {
          if (!(await exists(join(dir, `${id}.jpg`)))) await writeFile(join(dir, `${id}.jpg`), Buffer.from(await res.arrayBuffer()));
          got = true;
          break;
        }
      } catch {}
    }
    if (!got) console.warn(`no thumbnail for ${id}`);
    videos.push({ id, title, published, description, views });
  }
  await writeFile(join(root, 'src/data/videos.json'), JSON.stringify(videos, null, 2) + '\n');
  console.log(`YouTube: ${videos.length} films, newest ${videos[0]?.published.slice(0, 10)} "${videos[0]?.title}"`);
}

/** Flickr's page data is wrapped as {data, exportMetaType} at every level. */
const unwrap = (o) => {
  if (Array.isArray(o)) return o.map(unwrap);
  if (o && typeof o === 'object') {
    if ('exportMetaType' in o && 'data' in o) return unwrap(o.data);
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, unwrap(v)]));
  }
  return o;
};
const flickrModel = (html) => {
  const i = html.indexOf('modelExport:');
  if (i < 0) throw new Error('Flickr page without model data (blocked? try again later)');
  const line = html.slice(i + 'modelExport:'.length, html.indexOf('\n', i)).trim().replace(/,$/, '');
  return unwrap(JSON.parse(line)).main;
};
const slug = (s) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function flickr() {
  const html = await text(`https://www.flickr.com/photos/${FLICKR_PATH_ALIAS}/albums/`);
  const m = flickrModel(html);
  const list = m['sets-models'][0].albumsList._data.filter(Boolean);
  const dir = join(root, 'src/assets/albums');
  await mkdir(dir, { recursive: true });
  const albums = [];
  for (const a of list) {
    const sizes = a.primaryPhotoSizes ?? {};
    const s = sizes.c ?? sizes.l ?? sizes.z ?? sizes.m;
    if (!s) continue;
    const src = (s.src ?? s.url ?? s.displayUrl).replace(/^\/\//, 'https://');
    const file = `${a.id}.jpg`;
    try {
      await download(src, join(dir, file));
    } catch (e) {
      console.warn(`cover for "${a.title}": ${e.message}`);
      continue;
    }
    const year = a.title.match(/20\d\d/)?.[0] ?? '';
    albums.push({
      id: a.id,
      title: decode(a.title),
      slug: slug(a.title),
      year: year ? Number(year) : null,
      photos: a.photoCount ?? a.countPhotos ?? null,
      cover: file,
      url: `https://www.flickr.com/photos/${FLICKR_PATH_ALIAS}/albums/${a.id}/`,
    });
  }
  await writeFile(join(root, 'src/data/albums.json'), JSON.stringify(albums, null, 2) + '\n');
  // The totals, for the numbers in src/data/site.ts (stats.albums, the photos and photo views).
  const total = m['sets-models'][0].albumsList.totalItems;
  let views = '';
  try {
    const people = await text(`https://www.flickr.com/people/${FLICKR_PATH_ALIAS}/`);
    views = people.match(/"totalViews":(\d+)/)?.[1] ?? '';
  } catch {}
  console.log(`Flickr: newest ${albums.length} of ${total} albums (newest "${albums[0]?.title}")${views ? `, ${Number(views).toLocaleString('en')} photo views` : ''}: update stats in src/data/site.ts if they moved`);
}

const what = process.argv.slice(2);
const all = what.length === 0;
try {
  if (all || what.includes('youtube')) await youtube();
  if (all || what.includes('flickr')) await flickr();
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
