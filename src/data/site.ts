// Everything about the site that is data rather than words. The words are in src/i18n/ (one file per
// language). Name, tagline and the BM logo stay as they were on the old site; the tagline is the brand
// and stays English in every language.

export const site = {
  name: 'Belgian Motorsport',
  tagline: 'Passionate about cars',
  /** The canonical domain. belgianmotorsport.com redirects here (see docs/go-live.md). */
  url: 'https://belgian-motorsport.com',
  /** Where he is based, for the structured data. */
  based: 'Belgium',
  themeColor: '#0b0b0c',
} as const;

/** The four places his work lives, with the labels from the old footer. Order as on the old site.
 *  `count` is the following there, rounded down, read on stats.asOf; the words are in src/i18n/ (about.counts). */
export const socials = [
  {
    key: 'youtube',
    name: 'YouTube',
    label: 'YouTube racing videos',
    handle: '@Belgian-Motorsport',
    url: 'https://www.youtube.com/@Belgian-Motorsport',
    color: '#ff0000',
    count: '125K',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    label: 'Instagram pictures',
    handle: '@belgianmotorsport',
    url: 'https://www.instagram.com/belgianmotorsport/',
    color: '#e1306c',
    count: '23K',
  },
  {
    key: 'facebook',
    name: 'Facebook',
    label: 'Facebook community',
    handle: 'Belgian.Motorsport',
    url: 'https://www.facebook.com/Belgian.Motorsport',
    color: '#1877f2',
    count: '11K',
  },
  {
    key: 'flickr',
    name: 'Flickr',
    label: 'Flickr photo albums',
    handle: 'belgian-motorsport',
    url: 'https://www.flickr.com/photos/belgian-motorsport/albums/',
    color: '#ff0084',
    count: '9,500',
  },
] as const;

export type SocialKey = (typeof socials)[number]['key'];

/** YouTube channel and Flickr account, for the sync script and the structured data. */
export const accounts = {
  youtubeChannelId: 'UCbIYqYGCs_2YK0oTPtDmVnQ',
  flickrUserId: '57775472@N04',
  flickrPathAlias: 'belgian-motorsport',
} as const;

/**
 * The numbers on the home page. They come from the channel and Flickr pages; rounded down so they
 * stay true for a while. Update `asOf` when you refresh them. The labels are in src/i18n/ (stats.*),
 * the icons are line-md names.
 */
export const stats = {
  asOf: '2026-11-11',
  since: 2006,
  items: [
    // In order of weight: on a phone only the first ones show without scrolling.
    { key: 'subscribers', value: '125K', icon: 'account' },
    { key: 'views', value: '62M', icon: 'play' },
    { key: 'photoViews', value: '5.7M', icon: 'image' },
    { key: 'films', value: '2,750', icon: 'youtube' },
    { key: 'photos', value: '9,500', icon: 'camera' },
  ],
  /** Albums on Flickr (the Events section shows the newest; `npm run sync` prints the current total). */
  albums: '430',
} as const;

/** Icons (Font Awesome) for the four services; the words are in src/i18n/ (about.services). */
export const serviceIcons = ['flag', 'users', 'car', 'video'] as const;

/** The sections of the home page, with their line-md icons. Labels come from src/i18n/ (nav.*). */
export const sections = [
  { id: 'photos', key: 'photos', icon: 'camera' },
  { id: 'film', key: 'film', icon: 'play' },
  { id: 'events', key: 'events', icon: 'calendar' },
  { id: 'about', key: 'about', icon: 'account' },
  { id: 'contact', key: 'contact', icon: 'email' },
] as const;

export const contact = {
  /** The form posts here; the Cloudflare Worker that serves the site sends it on by email. His
   *  address is a secret on the Worker. */
  endpoint: '/api/contact',
  /** Cloudflare Turnstile site key. Leave empty to run without it (the honeypot and rate limit stay). */
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '',
} as const;
