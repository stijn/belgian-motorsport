/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Cloudflare Turnstile site key (public). Empty: the form runs without Turnstile. */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}
