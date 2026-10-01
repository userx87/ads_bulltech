/* Shared by the landing, the intake adapter and the contract tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BulltechAudience = api;
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const ATTRIBUTION_KEY = 'bulltech_ads_attribution_v2';
  const CONSENT_KEY = 'bulltech_ads_consent_v1';
  const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const SERVICES = {
    'assistenza-it-pmi': 'Assistenza IT PMI',
    'firewall-aziende-monza': 'Firewall e Sicurezza',
    'server-aziende-monza': 'Server e Infrastruttura',
    'rete-wifi-aziende-monza': 'Rete e Wi-Fi',
    'assessment-it-monza': 'Assessment IT',
    'noleggio-it-aziende': 'Noleggio IT'
  };
  function storage(store, action, key, value) {
    try { return store[action](key, value); } catch (_) { return null; }
  }
  function readJSON(store, key) {
    try { const value = JSON.parse(storage(store, 'getItem', key)); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
    catch (_) { return {}; }
  }
  function clean(value, max = 160) {
    return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max) : '';
  }
  function campaignValue(value) {
    const text = clean(value);
    return /^[\p{L}\p{N}_.:/ +|%-]+$/u.test(text) && !/@|https?:/i.test(text) ? text : '';
  }
  function pagePath(url) {
    try { return new URL(url).pathname; } catch (_) { return '/'; }
  }
  function captureAttribution(url, previous = {}, now = new Date().toISOString()) {
    const u = new URL(url);
    const current = {};
    for (const key of UTM) { const value = campaignValue(u.searchParams.get(key)); if (value) current[key] = value; }
    for (const key of ['gclid', 'oppref']) {
      const value = clean(u.searchParams.get(key), 512);
      if (/^[a-zA-Z0-9_.~-]+$/.test(value)) current[key] = value;
    }
    // A new tagged entry replaces the complete previous campaign, never mixes A's source with B's content.
    const hasCampaign = Object.keys(current).length > 0;
    const result = hasCampaign ? current : {};
    if (!hasCampaign) {
      for (const key of UTM) if (campaignValue(previous[key])) result[key] = campaignValue(previous[key]);
      for (const key of ['gclid', 'oppref']) if (/^[a-zA-Z0-9_.~-]{1,512}$/.test(previous[key] || '')) result[key] = previous[key];
    }
    const oldPath = clean(previous.landing_path, 250);
    result.landing_path = hasCampaign ? u.pathname : /^\/[a-zA-Z0-9_/-]*$/.test(oldPath) ? oldPath : u.pathname;
    result.captured_at = hasCampaign ? now : clean(previous.captured_at, 40) || now;
    return result;
  }
  function analyticsContext(attribution, context = {}) {
    const result = { service: context.service || 'assessment-it-monza', landing_variant: context.variant || 'control', ab_assignment_source: context.assignmentSource || 'control', landing_path: context.landingPath || '/' };
    for (const key of UTM) if (campaignValue(attribution[key])) result[key] = campaignValue(attribution[key]);
    return result;
  }
  function buildLead(fields, context, attribution, consent, submissionId) {
    const service = context.service || 'assessment-it-monza';
    const result = {
      nome: clean(fields.nome, 120), email: clean(fields.email, 254), telefono: clean(fields.telefono, 40),
      azienda: clean(fields.azienda, 160), messaggio: clean(fields.messaggio, 3000),
      citta: clean(fields.citta, 100), settore: clean(fields.settore, 100),
      dipendenti: clean(fields.dipendenti, 40), ruolo: clean(fields.ruolo, 100), urgenza: clean(fields.urgenza, 100),
      servizio: SERVICES[service] || '', pagina: context.landingPath || '/' + service,
      form_id: 'bulltech-ads-v1', submission_id: submissionId, privacy: fields.privacy === true,
      audience: { version: 1, service, landing_variant: context.variant || 'control', assignment_source: context.assignmentSource || 'control', measurement_consent: consent === true, qualification: 'unknown' }
    };
    if (consent) {
      const safe = captureAttribution('https://ads.bulltech.it' + result.pagina, attribution);
      result.entryLanding = safe.landing_path;
      for (const key of UTM) if (safe[key]) result['entry' + key.split('_').map(s => s[0].toUpperCase() + s.slice(1)).join('')] = safe[key];
      result.audience.attribution = safe;
    }
    return result;
  }
  function validateLead(lead) {
    if (!lead || typeof lead !== 'object' || Array.isArray(lead)) return 'Richiesta non valida.';
    if (!['nome', 'azienda', 'messaggio'].every(key => typeof lead[key] === 'string' && clean(lead[key]))) return 'Completa nome, azienda e richiesta.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email || '')) return 'Inserisci un indirizzo email valido.';
    if (!/^[+()\d .-]{6,40}$/.test(lead.telefono || '')) return 'Inserisci un numero di telefono valido.';
    if (lead.privacy !== true) return 'Leggi e accetta l’informativa privacy.';
    if (!/^btads_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(lead.submission_id || '')) return 'Identificativo della richiesta non valido.';
    if (!Object.hasOwn(SERVICES, lead.audience?.service || '')) return 'Servizio non riconosciuto.';
    return null;
  }
  function verifiedReceipt(body) {
    // This verifies the intake receipt format. Deployment validation must establish the CRM mapping.
    return body && body.accepted === true && /^[1-9]\d*$/.test(String(body.leadId || '')) && /^btads_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(body.submission_id || '');
  }
  return { ATTRIBUTION_KEY, CONSENT_KEY, SERVICES, UTM, storage, readJSON, clean, captureAttribution, analyticsContext, buildLead, validateLead, verifiedReceipt, pagePath };
});
