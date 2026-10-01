(function () {
  'use strict';
  const core = window.BulltechAudience;
  if (!core || !document.querySelector('main')) return;
  const section = document.createElement('section');
  section.id = 'richiesta';
  section.className = 'section lead-section';
  section.hidden = true;
  section.innerHTML = `
    <div class="container lead-layout">
      <div><div class="kicker">Parliamo della tua azienda</div><h2>Raccontaci cosa ti serve.</h2>
        <p>Lascia i tuoi riferimenti e descrivi la richiesta. Ti ricontatteremo per capire il contesto e il prossimo passo.</p>
        <p>Preferisci parlarne? <a href="tel:+390395787212">039 5787 212</a></p></div>
      <form id="lead-form" class="lead-form">
        <div class="lead-grid">
          <label>Nome e cognome <input name="nome" autocomplete="name" maxlength="120" required></label>
          <label>Azienda <input name="azienda" autocomplete="organization" maxlength="160" required></label>
          <label>Email di lavoro <input name="email" type="email" autocomplete="email" maxlength="254" required></label>
          <label>Telefono <input name="telefono" type="tel" autocomplete="tel" maxlength="40" required></label>
        </div>
        <label>Di cosa hai bisogno? <textarea name="messaggio" rows="4" maxlength="3000" required></textarea></label>
        <details class="lead-details"><summary>Aggiungi qualche dettaglio sull’azienda (facoltativo)</summary>
          <div class="lead-grid">
            <label>Città <input name="citta" autocomplete="address-level2" maxlength="100"></label>
            <label>Settore <input name="settore" maxlength="100" placeholder="Es. manifatturiero, studio professionale"></label>
            <label>Persone in azienda <select name="dipendenti"><option value="">Seleziona</option><option>1–10</option><option>11–50</option><option>51–200</option><option>Oltre 200</option></select></label>
            <label>Il tuo ruolo <input name="ruolo" autocomplete="organization-title" maxlength="100"></label>
            <label>Quando vorresti intervenire? <select name="urgenza"><option value="">Da definire</option><option>Appena possibile</option><option>Entro un mese</option><option>Entro tre mesi</option><option>Sto raccogliendo informazioni</option></select></label>
          </div>
        </details>
        <div class="lead-honeypot" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>
        <label class="lead-privacy"><input name="privacy" type="checkbox" required><span>Ho letto l’<a href="https://bulltech.it/privacy-policy" target="_blank" rel="noopener">informativa privacy</a> e acconsento al trattamento dei dati per gestire questa richiesta.</span></label>
        <button type="submit" class="btn">Invia la richiesta</button>
        <p id="lead-status" role="status" aria-live="polite"></p>
      </form>
    </div>`;
  document.querySelector('main').appendChild(section);
  const form = document.getElementById('lead-form');
  if (!core || !form) return;
  const status = document.getElementById('lead-status');
  const button = form.querySelector('button[type="submit"]');
  let pending = false;
  let submitted = false;
  let submissionId = null;
  let submittedPayload = null;
  let submittedFields = null;
  let session;
  try { session = window.sessionStorage; } catch (_) {}
  const service = (window.bulltechLandingContext || {}).service || 'assessment-it-monza';
  const requestKey = 'bulltech_pending_lead:' + service;
  // Keep only a request ID and fingerprint, never contact details, across a page reload.
  const previousRequest = core.readJSON(session, requestKey);
  if (/^btads_[a-f0-9-]{36}$/.test(previousRequest.id || '')) submissionId = previousRequest.id;

  // The public form is shown only when the server-side integration is enabled.
  fetch('/api/lead', { credentials: 'same-origin', cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(config => {
      if (config?.enabled !== true) return;
      section.hidden = false;
      const link = document.createElement('a');
      link.href = '#richiesta'; link.className = 'text-link'; link.textContent = 'Invia una richiesta';
      document.querySelector('.hero-actions')?.appendChild(link);
    }).catch(() => {});

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (pending || submitted || !form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    if (values.website) return;
    const context = window.bulltechLandingContext || { service: 'assessment-it-monza', landingPath: location.pathname, variant: 'control' };
    const consent = window.bulltechMeasurement?.hasConsent() === true;
    if (!submissionId) submissionId = 'btads_' + crypto.randomUUID();
    const lead = core.buildLead({ ...values, privacy: values.privacy === 'on' }, context, window.bulltechAdsAttribution || {}, consent, submissionId);
    const error = core.validateLead(lead);
    if (error) { status.textContent = error; return; }
    // Retry the same request after a network failure; do not create a new ID on an uncertain response.
    const businessFields = JSON.stringify([lead.nome, lead.azienda, lead.email, lead.telefono, lead.messaggio, lead.citta, lead.settore, lead.dipendenti, lead.ruolo, lead.urgenza, lead.privacy]);
    if (submittedFields && businessFields !== submittedFields) {
      status.textContent = 'La richiesta precedente è ancora da verificare. Riprova con gli stessi dati oppure contattaci per telefono.';
      return;
    }
    pending = true;
    button.disabled = true;
    let fingerprint;
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(businessFields));
      fingerprint = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
    } catch (_) { /* Storage and hashing may be unavailable: in-page retry still uses the same ID. */ }
    if (fingerprint && previousRequest.fingerprint && previousRequest.fingerprint !== fingerprint) {
      status.textContent = 'C’è già una richiesta da verificare in questa sessione. Reinserisci gli stessi dati oppure contattaci per telefono.';
      pending = false; button.disabled = false; return;
    }
    if (fingerprint) core.storage(session, 'setItem', requestKey, JSON.stringify({ id: submissionId, fingerprint }));
    submittedPayload = JSON.stringify(lead);
    submittedFields = businessFields;
    status.textContent = 'Invio in corso…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('/api/lead', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: submittedPayload, signal: controller.signal });
      const receipt = await response.json();
      if (response.status === 400) {
        submittedFields = null;
        core.storage(session, 'removeItem', requestKey);
        delete previousRequest.fingerprint;
        status.textContent = 'Controlla i dati della richiesta e riprova.';
        button.disabled = false;
        return;
      }
      if (!response.ok || !core.verifiedReceipt(receipt) || receipt.submission_id !== submissionId) throw new Error('unverified');
      submitted = true;
      core.storage(session, 'removeItem', requestKey);
      status.textContent = 'Richiesta ricevuta. Il nostro team ti ricontatterà per approfondire.';
      form.querySelectorAll('input, textarea, select, button').forEach(el => { el.disabled = true; });
      window.bulltechMeasurement?.leadCreated(submissionId);
    } catch (_) {
      status.textContent = 'Non possiamo confermare la ricezione. Puoi riprovare con gli stessi dati oppure chiamare lo 039 5787 212.';
      button.disabled = false;
    } finally {
      clearTimeout(timeout);
      pending = false;
    }
  });
})();
