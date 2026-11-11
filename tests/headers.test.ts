// public/_headers allows the one inline script in src/layouts/Base.astro by its hash. If someone
// changes the script and forgets the hash, every browser would block it: this test catches that.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const layout = readFileSync(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8');
const headers = readFileSync(new URL('../public/_headers', import.meta.url), 'utf8');

describe('Content-Security-Policy', () => {
  it('allows the head script in Base.astro by its hash', () => {
    const m = layout.match(/<script is:inline>([\s\S]*?)<\/script>/);
    expect(m, 'the inline head script').toBeTruthy();
    const hash = createHash('sha256').update(m![1]!).digest('base64');
    expect(headers).toContain(`'sha256-${hash}'`);
  });
});
