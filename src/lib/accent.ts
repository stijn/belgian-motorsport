// Headings carry one accent written *like this*; it becomes <em class="accent">, red text.
// Everything else in the string is escaped, so the dictionaries can't inject markup.
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const accent = (s: string) =>
  s
    .split(/(\*[^*]+\*)/)
    .map((part) => (part.startsWith('*') && part.endsWith('*') ? `<em class="accent">${esc(part.slice(1, -1))}</em>` : esc(part)))
    .join('');

/** The same string without the markers, for places that take plain text (titles, alt). */
export const plain = (s: string) => s.replace(/\*/g, '');
