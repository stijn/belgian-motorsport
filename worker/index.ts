// The one piece of server code: POST /api/contact sends the form on by email through Cloudflare's
// Email Sending binding. Everything else on the site is a static file in dist/ (wrangler.jsonc only
// runs this Worker for /api/*). His address is the CONTACT_TO secret: it never appears in the site.
import { buildEmail, check, readInput, verifyTurnstile } from './contact';

export interface Env {
  ASSETS: Fetcher;
  EMAIL: SendEmail;
  CONTACT_LIMIT: RateLimit;
  CONTACT_FROM: string;
  CONTACT_FROM_NAME: string;
  SITE_ORIGIN: string;
  /** Secrets */
  CONTACT_TO?: string;
  TURNSTILE_SECRET?: string;
}

const json = (body: unknown, status = 200, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });

const wantsJson = (req: Request) => (req.headers.get('accept') ?? '').includes('application/json') || (req.headers.get('content-type') ?? '').includes('application/json');

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact') return contact(request, env, ctx);
    if (url.pathname.startsWith('/api/')) return json({ ok: false, error: 'Not found' }, 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

async function contact(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405, { allow: 'POST' });

  // Only the site's own pages may post here (the live domain, or wherever this Worker is served from:
  // the workers.dev preview, or wrangler dev locally).
  const self = new URL(request.url).origin;
  const origin = request.headers.get('origin') ?? (request.headers.get('referer') ? new URL(request.headers.get('referer')!).origin : null);
  if (origin && origin !== env.SITE_ORIGIN && origin !== self) {
    return json({ ok: false, error: 'Forbidden' }, 403);
  }

  const ip = request.headers.get('cf-connecting-ip') ?? '';
  const asJson = wantsJson(request);
  const answer = (ok: boolean, error: string | undefined, status: number) => {
    if (asJson) return json(ok ? { ok } : { ok, error }, status);
    // Without JavaScript the form posts the usual way: send people on to a page.
    const to = ok ? '/thanks/' : `/contact/?error=${encodeURIComponent(error ?? '')}`;
    return Response.redirect(new URL(to, self).href, 303);
  };

  const { success } = await env.CONTACT_LIMIT.limit({ key: ip || 'unknown' });
  if (!success) return answer(false, 'Too many messages in a row. Please try again in a minute.', 429);

  const input = await readInput(request);
  if (!input) return answer(false, 'The form didn’t arrive in one piece. Please try again.', 400);

  const result = check(input);
  if (!result.ok) {
    // Bots get a cheerful "ok" and nothing happens.
    if (result.silent) return answer(true, undefined, 200);
    return answer(false, result.error, result.status);
  }

  if (env.TURNSTILE_SECRET) {
    const human = await verifyTurnstile(env.TURNSTILE_SECRET, input['cf-turnstile-response'], ip);
    if (!human) return answer(false, 'The spam check didn’t pass. Please reload the page and try again.', 400);
  }

  if (!env.CONTACT_TO) {
    console.error('CONTACT_TO is not set: run `npx wrangler secret put CONTACT_TO`');
    return answer(false, 'The form isn’t connected yet. Please try again later.', 503);
  }

  const mail = buildEmail(result.message, {
    from: env.CONTACT_FROM,
    fromName: env.CONTACT_FROM_NAME,
    to: env.CONTACT_TO,
    site: new URL(env.SITE_ORIGIN).host,
    ip,
    country: request.headers.get('cf-ipcountry') ?? undefined,
  });

  try {
    const sent = await env.EMAIL.send(mail);
    ctx.waitUntil(Promise.resolve(console.log(`contact: sent ${sent.messageId}`)));
    return answer(true, undefined, 200);
  } catch (e) {
    const err = e as { code?: string; message?: string };
    console.error('contact: send failed', err.code, err.message);
    return answer(false, 'The message couldn’t be sent right now. Please try again in a moment.', 502);
  }
}
