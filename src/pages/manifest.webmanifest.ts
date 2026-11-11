// The web app manifest: the site on a phone's home screen, from the words in src/data/site.ts.
import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { href } from '../lib/url';
import { t } from '../i18n';

export const GET: APIRoute = () => {
  const manifest = {
    name: site.name,
    short_name: 'Belgian Motorsport',
    description: t('en').meta.description,
    lang: 'en',
    start_url: href('/'),
    scope: href('/'),
    display: 'standalone',
    background_color: site.themeColor,
    theme_color: site.themeColor,
    icons: [
      { src: href('/icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: href('/icon-512.png'), sizes: '512x512', type: 'image/png' },
      { src: href('/icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/manifest+json' } });
};
