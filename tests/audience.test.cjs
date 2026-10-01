const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../audience-core.js');
const handler = require('../api/lead.js');
const id = 'btads_12345678-1234-1234-1234-123456789abc';
const fields = { nome: 'TEST FIX15', azienda: 'TEST - non contattare', email: 'test@example.invalid', telefono: '0000000000', messaggio: 'Test tecnico, nessuna richiesta commerciale.', privacy: true, settore: 'Test', dipendenti: '11–50', ruolo: 'Test', urgenza: 'Da definire' };
const context = { service: 'assistenza-it-pmi', landingPath: '/assistenza-it-pmi', variant: 'b', assignmentSource: 'paid_random' };
const attribution = core.captureAttribution('https://ads.bulltech.it/assistenza-it-pmi?utm_source=chatgpt&utm_medium=paid&utm_campaign=test&utm_content=assistenza_c&oppref=test-id');

test('new campaign replaces old campaign and click reference together', () => {
  const next = core.captureAttribution('https://ads.bulltech.it/server-aziende-monza?utm_source=google&utm_campaign=new', attribution);
  assert.equal(next.utm_source, 'google');
  assert.equal(next.utm_content, undefined);
  assert.equal(next.oppref, undefined);
  assert.equal(next.landing_path, '/server-aziende-monza');
});
test('same-session navigation preserves complete attribution', () => {
  const next = core.captureAttribution('https://ads.bulltech.it/server-aziende-monza', attribution);
  assert.equal(next.utm_content, 'assistenza_c');
  assert.equal(next.landing_path, '/assistenza-it-pmi');
});
test('URL fragments and arbitrary query values do not enter measurement data', () => {
  const a = core.captureAttribution('https://ads.bulltech.it/assistenza-it-pmi?email=someone@example.com&utm_term=someone@example.com#secret');
  assert.equal(a.email, undefined);
  assert.equal(a.utm_term, undefined);
  assert.equal(a.landing_path, '/assistenza-it-pmi');
  const b = core.captureAttribution('https://ads.bulltech.it/', { utm_source: 'x@y.it', oppref: 'x@y.it', landing_path: '//evil?email=x' });
  assert.equal(b.utm_source, undefined);
  assert.equal(b.oppref, undefined);
  assert.equal(b.landing_path, '/');
});
test('blocked storage does not break the form or consent controls', () => {
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
  assert.deepEqual(core.readJSON(blocked, 'key'), {});
  assert.equal(core.storage(blocked, 'setItem', 'key', 'x'), null);
});
test('business request works without advertising consent and does not include click identifiers', () => {
  const lead = core.buildLead(fields, context, attribution, false, id);
  assert.equal(core.validateLead(lead), null);
  assert.equal(lead.entryUtmSource, undefined);
  assert.equal(lead.audience.attribution, undefined);
  assert.equal(lead.audience.qualification, 'unknown');
});
test('lead carries ad variant and independent landing variant when consented', () => {
  const lead = core.buildLead(fields, context, attribution, true, id);
  assert.equal(lead.entryUtmContent, 'assistenza_c');
  assert.equal(lead.audience.landing_variant, 'b');
  assert.equal(lead.audience.attribution.oppref, 'test-id');
});
test('analytics excludes submitted business fields and click reference', () => {
  const data = core.analyticsContext({ ...attribution, ...fields }, context);
  for (const key of ['nome', 'email', 'telefono', 'azienda', 'messaggio', 'oppref']) assert.equal(data[key], undefined);
});
test('only an identified intake receipt counts as acceptance', () => {
  assert.equal(Boolean(core.verifiedReceipt({ success: true })), false);
  assert.equal(core.verifiedReceipt({ accepted: true, leadId: '123', submission_id: id }), true);
  assert.equal(core.verifiedReceipt({ accepted: true, leadId: '0', submission_id: id }), false);
});
test('validation rejects non-text business fields and inherited service names', () => {
  const lead = core.buildLead(fields, context, attribution, true, id);
  assert.notEqual(core.validateLead({ ...lead, nome: {} }), null);
  assert.notEqual(core.validateLead({ ...lead, azienda: '   ' }), null);
  assert.notEqual(core.validateLead({ ...lead, audience: { service: '__proto__' } }), null);
  assert.notEqual(core.validateLead({ ...lead, submission_id: 'btads_' + '-'.repeat(36) }), null);
});

function response() {
  return { headers: {}, statusCode: 200, setHeader(k, v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; } };
}
function request(body = core.buildLead(fields, context, attribution, true, id)) {
  return { method: 'POST', headers: { origin: 'https://ads.bulltech.it', 'content-type': 'application/json' }, body };
}
test('adapter is disabled by default, including direct POST', async () => {
  const previous = process.env.BULLTECH_LEAD_FORM_ENABLED;
  delete process.env.BULLTECH_LEAD_FORM_ENABLED;
  try {
    const get = response(); await handler({ method: 'GET' }, get); assert.equal(get.body.enabled, false);
    const post = response(); await handler(request(), post); assert.equal(post.statusCode, 503);
  } finally { if (previous === undefined) delete process.env.BULLTECH_LEAD_FORM_ENABLED; else process.env.BULLTECH_LEAD_FORM_ENABLED = previous; }
});
test('adapter validates origin, input and upstream acceptance; uncertain writes are not retried', async () => {
  const originalFetch = global.fetch;
  const previous = process.env.BULLTECH_LEAD_FORM_ENABLED;
  process.env.BULLTECH_LEAD_FORM_ENABLED = 'true';
  const sent = [];
  global.fetch = async (url, options) => { sent.push({ url, body: JSON.parse(options.body) }); return { ok: true, json: async () => ({ leadId: 123456, leadToken: 'do-not-expose' }) }; };
  try {
    const wrongOrigin = request(); wrongOrigin.headers.origin = 'https://example.com';
    const forbidden = response(); await handler(wrongOrigin, forbidden); assert.equal(forbidden.statusCode, 403); assert.equal(sent.length, 0);
    const invalid = response(); await handler(request({}), invalid); assert.equal(invalid.statusCode, 400); assert.equal(sent.length, 0);
    for (let i = 0; i < 2; i++) { const r = response(); await handler(request(), r); assert.equal(r.statusCode, 200); assert.equal(r.body.submission_id, id); assert.equal(r.body.leadToken, undefined); }
    assert.equal(sent[0].body.submission_id, sent[1].body.submission_id);
    assert.match(sent[0].body.messaggio, /BT_ADS_V1/);
    assert.equal(sent[0].url, 'https://bulltech.it/api/contact');
    global.fetch = async () => ({ ok: true, json: async () => ({ success: true }) });
    const missing = response(); await handler(request(), missing); assert.equal(missing.statusCode, 502);
    let calls = 0; global.fetch = async () => { calls++; throw Error('timeout'); };
    const timedout = response(); await handler(request(), timedout); assert.equal(timedout.statusCode, 502); assert.equal(calls, 1);
  } finally { global.fetch = originalFetch; if (previous === undefined) delete process.env.BULLTECH_LEAD_FORM_ENABLED; else process.env.BULLTECH_LEAD_FORM_ENABLED = previous; }
});
