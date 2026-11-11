import { describe, expect, it } from 'vitest';
import { buildEmail, check, readInput, toResend } from './contact';

const good = { name: 'Ann Example', email: 'ann@example.com', message: 'Could you shoot our car at Zolder next month?', started: String(Date.now() - 10_000) };

describe('check', () => {
  it('accepts a normal message', () => {
    const r = check(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.message).toEqual({ name: 'Ann Example', email: 'ann@example.com', message: good.message });
  });

  it('quietly drops the honeypot', () => {
    const r = check({ ...good, website: 'http://spam.example' });
    expect(r).toMatchObject({ ok: false, silent: true, status: 200 });
  });

  it('quietly drops a form filled in under three seconds', () => {
    const now = Date.now();
    const r = check({ ...good, started: String(now - 1000) }, now);
    expect(r).toMatchObject({ ok: false, silent: true });
  });

  it('quietly drops a message stuffed with links', () => {
    const r = check({ ...good, message: 'http://a.example http://b.example http://c.example http://d.example' });
    expect(r).toMatchObject({ ok: false, silent: true });
  });

  it('asks for a name, a real email and a few words', () => {
    expect(check({ ...good, name: '' })).toMatchObject({ ok: false, status: 400 });
    expect(check({ ...good, email: 'nope' })).toMatchObject({ ok: false, status: 400 });
    expect(check({ ...good, message: 'hi' })).toMatchObject({ ok: false, status: 400 });
  });

  it('trims and caps the fields', () => {
    const r = check({ ...good, name: '  ' + 'x'.repeat(500), message: 'y'.repeat(6000) });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.message.name.length).toBe(100);
      expect(r.message.message.length).toBe(5000);
    }
  });
});

describe('buildEmail', () => {
  const opts = { from: 'contact@belgian-motorsport.com', fromName: 'Website', to: 'him@example.com', site: 'belgian-motorsport.com', ip: '203.0.113.9', country: 'BE' };

  it('replies to the sender and never puts his address in the body', () => {
    const r = check(good);
    if (!r.ok) throw new Error('expected ok');
    const mail = buildEmail(r.message, opts);
    expect(mail.to).toBe('him@example.com');
    expect(mail.replyTo).toEqual({ email: 'ann@example.com', name: 'Ann Example' });
    expect(mail.subject).toBe('Website message from Ann Example');
    expect(mail.text).toContain(good.message);
    expect(mail.text).not.toContain('him@example.com');
    expect(mail.html).not.toContain('him@example.com');
  });

  it('escapes HTML and keeps header fields on one line', () => {
    const r = check({ ...good, name: 'Eve\r\nBcc: x@example.com', message: '<script>alert(1)</script> ten chars' });
    if (!r.ok) throw new Error('expected ok');
    const mail = buildEmail(r.message, opts);
    expect(mail.subject).not.toMatch(/[\r\n]/);
    expect(mail.replyTo.name).not.toMatch(/[\r\n]/);
    expect(mail.html).toContain('&lt;script&gt;');
    expect(mail.html).not.toContain('<script>');
  });
});

describe('toResend', () => {
  it('puts the names and addresses in Resend’s shape, reply-to on the sender', () => {
    const r = check(good);
    if (!r.ok) throw new Error('expected ok');
    const body = toResend(buildEmail(r.message, { from: 'contact@belgian-motorsport.com', fromName: 'Website', to: 'him@example.com', site: 'belgian-motorsport.com' }));
    expect(body).toMatchObject({ from: 'Website <contact@belgian-motorsport.com>', to: ['him@example.com'], reply_to: 'Ann Example <ann@example.com>', subject: 'Website message from Ann Example' });
    expect(body.text).toContain(good.message);
  });
});

describe('readInput', () => {
  it('reads JSON and form posts', async () => {
    const j = await readInput(new Request('http://x/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(good) }));
    expect(j).toMatchObject({ name: 'Ann Example' });
    const fd = new FormData();
    fd.set('name', 'Bob');
    const f = await readInput(new Request('http://x/api/contact', { method: 'POST', body: fd }));
    expect(f).toMatchObject({ name: 'Bob' });
    const bad = await readInput(new Request('http://x/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }));
    expect(bad).toBeNull();
  });
});
