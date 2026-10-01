'use strict';
const core = require('../audience-core.js');

// Enable only after the existing intake has passed the CRM and retry checks in docs/audience.md.
// The destination is fixed: never accept a URL, token, board or CRM ID from the browser.
const UPSTREAM = 'https://bulltech.it/api/contact';

module.exports = async function leadHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const enabled = process.env.BULLTECH_LEAD_FORM_ENABLED === 'true';
  if (req.method === 'GET') return res.status(200).json({ enabled });
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'method' }); }
  if (!enabled) return res.status(503).json({ error: 'not_configured' });
  const origin = req.headers.origin;
  const allowedOrigins = ['https://ads.bulltech.it'];
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) allowedOrigins.push('https://' + process.env.VERCEL_URL);
  if (!allowedOrigins.includes(origin)) return res.status(403).json({ error: 'origin' });
  if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) return res.status(415).json({ error: 'content_type' });
  let input;
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!raw || Buffer.byteLength(raw) > 12000) return res.status(413).json({ error: 'size' });
    input = JSON.parse(raw);
  } catch (_) { return res.status(400).json({ error: 'json' }); }
  if (core.validateLead(input)) return res.status(400).json({ error: 'validation' });
  const lead = core.buildLead(input, {
    service: input.audience.service,
    landingPath: ['/' + input.audience.service, '/' + input.audience.service + '-a', '/' + input.audience.service + '-b'].includes(input.pagina) ? input.pagina : '/' + input.audience.service,
    variant: ['a', 'b'].includes(input.audience.landing_variant) ? input.audience.landing_variant : 'control',
    assignmentSource: core.clean(input.audience.assignment_source, 40)
  }, input.audience.attribution || {}, input.audience.measurement_consent === true, input.submission_id);
  if (core.validateLead(lead)) return res.status(400).json({ error: 'validation' });
  // Preserve qualification and measurement metadata in the existing message as well as typed fields.
  // This fallback must be checked against the actual CRM mapping before enabling the form.
  const details = [
    ['Servizio', lead.servizio], ['Città', lead.citta], ['Settore', lead.settore],
    ['Dipendenti', lead.dipendenti], ['Ruolo', lead.ruolo], ['Tempi', lead.urgenza]
  ].filter(([, value]) => value).map(([label, value]) => label + ': ' + value).join('\n');
  const payload = { ...lead, messaggio: lead.messaggio + '\n\n' + details + '\n[BT_ADS_V1] ' + JSON.stringify(lead.audience) };
  try {
    const response = await fetch(UPSTREAM, { method: 'POST', redirect: 'error', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(15000) });
    if (!response.ok) return res.status(response.status === 429 ? 429 : 502).json({ error: 'intake_unavailable' });
    const body = await response.json();
    if (!body || body.success === false || !/^[1-9]\d*$/.test(String(body.leadId || ''))) return res.status(502).json({ error: 'intake_unverified' });
    return res.status(200).json({ accepted: true, leadId: String(body.leadId), submission_id: lead.submission_id });
  } catch (_) {
    // Never retry an uncertain upstream write here. The next request must reuse submission_id.
    return res.status(502).json({ error: 'receipt_unverified' });
  }
};
