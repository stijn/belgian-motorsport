// Everything about the site that is words rather than code. Edit here; the pages read from it.
// Name, tagline and the BM logo stay as they were on the old site.

export const site = {
  name: 'Belgian Motorsport',
  tagline: 'Passionate about cars',
  /** The canonical domain. belgianmotorsport.com redirects here (see docs/go-live.md). */
  url: 'https://belgian-motorsport.com',
  /** The <title> of the home page and the share cards. */
  title: 'Belgian Motorsport — Motorsport photography and film from Belgium & Europe',
  description:
    'Motorsport photographer and filmmaker from Belgium. Race cars, rally cars and supercars at Spa-Francorchamps, Zolder, the Nürburgring and the rally stages of Belgium and Europe, in photos and film since 2006.',
  locale: 'en_BE',
  language: 'en',
  /** Where he is based: used in the contact section and the structured data. */
  based: 'Belgium',
  themeColor: '#0b0b0c',
} as const;

/** The four places his work lives, with the labels from the old footer. Order as on the old site. */
export const socials = [
  {
    key: 'youtube',
    name: 'YouTube',
    label: 'YouTube racing videos',
    handle: '@Belgian-Motorsport',
    url: 'https://www.youtube.com/@Belgian-Motorsport',
    color: '#ff0000',
  },
  {
    key: 'instagram',
    name: 'Instagram',
    label: 'Instagram pictures',
    handle: '@belgianmotorsport',
    url: 'https://www.instagram.com/belgianmotorsport/',
    color: '#e1306c',
  },
  {
    key: 'facebook',
    name: 'Facebook',
    label: 'Facebook community',
    handle: 'Belgian.Motorsport',
    url: 'https://www.facebook.com/Belgian.Motorsport',
    color: '#1877f2',
  },
  {
    key: 'flickr',
    name: 'Flickr',
    label: 'Flickr photo albums',
    handle: 'belgian-motorsport',
    url: 'https://www.flickr.com/photos/belgian-motorsport/albums/',
    color: '#ff0084',
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
 * stay true for a while. Update `asOf` when you refresh them (npm run sync prints the current values).
 */
export const stats = {
  asOf: '2026-11-11',
  since: 2006,
  items: [
    { value: '125K', label: 'YouTube subscribers' },
    { value: '62M', label: 'video views' },
    { value: '2,750', label: 'films' },
    { value: '9,500', label: 'photos on Flickr' },
  ],
} as const;

/** The About section and the footer. The first two sentences are his own, from the old site. */
export const about = {
  short: 'I am passionate about everything car-related. Mostly racecars and supercars.',
  long: [
    'I am passionate about everything car-related. Mostly racecars and supercars. I film everything, as long as it’s fast and has a beautiful sound.',
    'Since 2006 I have been at the fences and in the pit lanes of Spa-Francorchamps, Zolder and the Nürburgring, and on the rally stages of Limburg, the Ardennes and the Eifel: endurance racing, historic grands prix, hill climbs, track days and test days.',
    'The photos go to Flickr, the films to YouTube, and the best of both to Instagram and Facebook. Everything you see here is mine.',
  ],
  /** What he can be booked for. Edit freely. */
  services: [
    { title: 'Race weekends and track days', text: 'Trackside and pit-lane coverage of a weekend, a race or a single session.' },
    { title: 'Teams, drivers and sponsors', text: 'Action and portrait photography of your car and crew, delivered ready for print and social media.' },
    { title: 'Car portraits and collections', text: 'Static and rolling shots of road cars, classics and supercars, on location.' },
    { title: 'Film with real sound', text: 'Flybys, on-boards and accelerations, cut to the sound of the engine rather than a soundtrack.' },
  ],
} as const;

export const contact = {
  heading: 'Want to work with me?',
  text: 'I’m based in Belgium. Let’s get in touch.',
  /** The form posts here; a Cloudflare Worker sends it on by email. His address is a secret on the Worker. */
  endpoint: '/api/contact',
  /** Cloudflare Turnstile site key. Leave empty to run without it (the honeypot and rate limit stay). */
  turnstileSiteKey: import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? '',
} as const;

export const nav = [
  { href: '/#work', label: 'Photos' },
  { href: '/#film', label: 'Film' },
  { href: '/#events', label: 'Events' },
  { href: '/#about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
] as const;
