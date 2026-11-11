// The web app manifest: the site on a phone's home screen, from the words in src/data/site.ts.
import type { APIRoute } from 'astro';
import { site } from '../data/site';

export const GET: APIRoute = () => {
  const manifest = {
    name: site.name,
    short_name: 'BM',
    description: site.description,
    lang: site.language,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
};
