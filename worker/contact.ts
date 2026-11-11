// The contact form, server side: checks the message, keeps spam out, and builds the email.
// Pure functions, so worker/contact.test.ts can run them without Cloudflare.

export interface ContactInput {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  /** Honeypot: people never see this field. Anything in it means a bot. */
  website?: unknown;
  /** Date.now() when the page was opened. A form filled in under 3 seconds is a bot. */
  started?: unknown;
  /** Cloudflare Turnstile token, when Turnstile is switched on. */
  'cf-turnstile-response'?: unknown;
}

export interface Message {
  name: string;
  email: string;
  message: string;
}

export type Check = { ok: true; message: Message } | { ok: false; error: string; status: number; silent?: boolean };

const MIN_SECONDS = 3;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').trim().slice(0, max) : '');

/** Validates the form. `silent` failures (bots) still get a friendly answer, so they learn nothing. */
export function check(input: ContactInput, now = Date.now()): Check {
  if (str(input.website, 10)) return { ok: false, error: 'Thanks.', status: 200, silent: true };
  const started = Number(input.started);
  if (started && now - started < MIN_SECONDS * 1000) return { ok: false, error: 'Thanks.', status: 200, silent: true };

  const name = str(input.name, 100);
  const email = str(input.email, 200);
  const message = str(input.message, 5000);
  if (!name) return { ok: false, error: 'Please fill in your name.', status: 400 };
  if (!EMAIL.test(email)) return { ok: false, error: 'That email address doesn’t look right.', status: 400 };
  if (message.length < 10) return { ok: false, error: 'Please write a few words more.', status: 400 };
  // Links by the handful are spam; one or two are fine (a car for sale, a team site).
  if ((message.match(/https?:\/\//gi) ?? []).length > 3) return { ok: false, error: 'Thanks.', status: 200, silent: true };
  return { ok: true, message: { name, email, message } };
}

/** Header values must stay on one line and free of anything that could inject another header. */
const headerSafe = (s: string) => s.replace(/[\r\n\t]+/g, ' ').replace(/["<>]/g, '').trim();

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export interface Outgoing {
  from: { email: string; name: string };
  to: string;
  replyTo: { email: string; name: string };
  subject: string;
  text: string;
  html: string;
}

/** The email he receives: plain text and HTML, reply-to set to the sender. */
export function buildEmail(m: Message, opts: { from: string; fromName: string; to: string; site: string; ip?: string; country?: string }): Outgoing {
  const name = headerSafe(m.name);
  const subject = `Website message from ${name}`;
  const where = [opts.country, opts.ip].filter(Boolean).join(', ');
  const text = [
    `New message through the contact form on ${opts.site}.`,
    '',
    `From: ${m.name} <${m.email}>`,
    where ? `Sent from: ${where}` : '',
    '',
    m.message,
    '',
    '—',
    'Reply to this email to answer; it goes to the address above.',
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n');
  const html = `<!doctype html><html><body style="font:16px/1.5 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111;max-width:640px">
<p style="color:#666;font-size:14px">New message through the contact form on ${escapeHtml(opts.site)}.</p>
<p><strong>From:</strong> ${escapeHtml(m.name)} &lt;<a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a>&gt;${where ? `<br><strong>Sent from:</strong> ${escapeHtml(where)}` : ''}</p>
<div style="white-space:pre-wrap;border-left:3px solid #e10600;padding:4px 16px;margin:16px 0">${escapeHtml(m.message)}</div>
<p style="color:#666;font-size:14px">Reply to this email to answer; it goes to the address above.</p>
</body></html>`;
  return {
    from: { email: opts.from, name: opts.fromName },
    to: opts.to,
    replyTo: { email: m.email, name },
    subject,
    text,
    html,
  };
}

/** Reads the form from JSON (the script) or a form post (no JavaScript). */
export async function readInput(request: Request): Promise<ContactInput | null> {
  const type = request.headers.get('content-type') ?? '';
  try {
    if (type.includes('application/json')) return (await request.json()) as ContactInput;
    if (type.includes('form')) return Object.fromEntries((await request.formData()).entries()) as ContactInput;
  } catch {
    /* fall through */
  }
  return null;
}

/** Cloudflare Turnstile: only when a secret is configured. */
export async function verifyTurnstile(secret: string, token: unknown, ip?: string): Promise<boolean> {
  if (typeof token !== 'string' || !token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return data.success === true;
}
