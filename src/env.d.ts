/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Cloudflare Turnstile site key (public). Empty: the form runs without Turnstile. */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  /** '1' on the GitHub Pages demo build (.github/workflows/pages.yml). */
  readonly PUBLIC_DEMO?: string;
  /** Where the contact Worker lives when the page isn't served by it (the GitHub Pages demo). */
  readonly PUBLIC_API_ORIGIN?: string;
}
