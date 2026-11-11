// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/data/site.ts';

// The real site lives at the root of its domain. The demo on GitHub Pages lives under
// https://stijn.github.io/belgian-motorsport/ (set by .github/workflows/pages.yml).
const SITE = process.env.SITE ?? site.url;
const BASE = process.env.BASE ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  trailingSlash: 'always',
  // The stylesheet goes inside each page: the first paint needs one download instead of two.
  build: { inlineStylesheets: 'always' },
  // Scripts stay separate files (never inlined), so the Content-Security-Policy can allow only the
  // site's own files and the service worker can keep them.
  vite: { build: { assetsInlineLimit: 0 } },
  image: {
    // Every <Picture> states its own widths and sizes; AVIF first, WebP second, JPEG for the rest.
  },
  integrations: [
    sitemap({
      filter: (page) => !/\/(404|thanks)\/?$/.test(page) && !/\.webmanifest$/.test(page),
      changefreq: 'monthly',
      lastmod: new Date(),
    }),
  ],
});
