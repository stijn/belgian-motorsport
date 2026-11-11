// The contact form, sent without leaving the page. Without JS the form posts the usual way and the
// Worker answers with a redirect to /thanks/.
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
if (form && !('demo' in form.dataset)) {
  const status = form.querySelector<HTMLElement>('[data-status]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const started = form.querySelector<HTMLInputElement>('input[name="started"]');
  if (started) started.value = String(Date.now());
  // Sent without JavaScript and bounced back here with a reason (see worker/index.ts).
  const bounced = new URLSearchParams(location.search).get('error');
  if (bounced) {
    status.textContent = bounced;
    status.dataset.kind = 'error';
    history.replaceState(null, '', location.pathname);
  }

  const icons = form.querySelector<HTMLTemplateElement>('[data-status-icons]');
  const say = (text: string, kind: 'ok' | 'error' | 'sending' | '') => {
    status.replaceChildren();
    const svg = kind && icons?.content.querySelector(`[data-icon="${kind}"] svg`);
    if (svg) status.append(svg.cloneNode(true));
    status.append(document.createTextNode(text));
    status.dataset.kind = kind;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    say('Sending…', 'sending');
    button.setAttribute('aria-busy', 'true');
    button.disabled = true;
    try {
      const data = Object.fromEntries(new FormData(form).entries());
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && body.ok) {
        form.reset();
        if (started) started.value = String(Date.now());
        form.classList.add('sent');
        say('Thanks, your message is on its way. I’ll get back to you soon.', 'ok');
      } else {
        say(body.error ?? 'That didn’t go through. Please try again in a moment.', 'error');
      }
    } catch {
      say(navigator.onLine ? 'That didn’t go through. Please try again in a moment.' : 'You’re offline. Try again when you have a connection.', 'error');
    } finally {
      button.removeAttribute('aria-busy');
      button.disabled = false;
    }
  });
}
