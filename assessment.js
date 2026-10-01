(function () {
  'use strict';
  const core = window.BulltechAudience;
  if (!core) return;
  let local, session;
  try { local = window.localStorage; } catch (_) {}
  try { session = window.sessionStorage; } catch (_) {}
  let consent = false, initialSent = false, pixelInitialized = false;
  let activeMs = 0, tickAt = performance.now(), visible = document.visibilityState === 'visible';
  const timed = new Set(), leads = new Set(), depths = new Set();
  let contactVisible = false, contactSent = false, contactObserver;
  const context = () => window.bulltechLandingContext || { service: 'assessment-it-monza', variant: 'control', landingPath: location.pathname };
  window.bulltechAdsAttribution = {};
  function pixel() {
    if (!consent || pixelInitialized) return;
    if (typeof window.oaiq !== 'function') {
      const q = function () { q.q.push(arguments); }; q.q = []; window.oaiq = q;
      const s = document.createElement('script'); s.id = 'openai-pixel'; s.async = true;
      s.src = 'https://bzrcdn.openai.com/sdk/oaiq.min.js'; document.head.appendChild(s);
    }
    window.oaiq('consent', false);
    window.oaiq('init', { pixelId: '81rwBC2brbap1uYMRAQYtN' });
    window.oaiq('consent', true); pixelInitialized = true;
  }
  function push(name, extra = {}) {
    if (!consent) return;
    window.dataLayer.push({ event: name, ...core.analyticsContext(window.bulltechAdsAttribution, context()), ...extra });
  }
  function custom(name) {
    if (consent && typeof window.oaiq === 'function') window.oaiq('measure', 'custom', { type: 'custom' }, { custom_event_name: name, opt_out: true });
  }
  function event(name, extra = {}, pixelName = name) { if (consent) { push(name, extra); custom(pixelName); } }
  function tick() {
    const now = performance.now();
    if (consent && visible) activeMs += now - tickAt;
    tickAt = now; visible = document.visibilityState === 'visible';
    if (!consent) return;
    for (const seconds of [15, 30, 60]) if (activeMs >= seconds * 1000 && !timed.has(seconds)) {
      timed.add(seconds); event('engaged_' + seconds + 's', { seconds });
    }
  }
  function setConsent(value) {
    tick(); consent = value === 'granted';
    core.storage(local, 'setItem', core.CONSENT_KEY, value);
    if (typeof window.gtag === 'function') window.gtag('consent', 'update', {
      ad_storage: consent ? 'granted' : 'denied', analytics_storage: consent ? 'granted' : 'denied',
      ad_user_data: consent ? 'granted' : 'denied', ad_personalization: consent ? 'granted' : 'denied'
    });
    if (consent) {
      window.bulltechAdsAttribution = core.captureAttribution(location.href, core.readJSON(session, core.ATTRIBUTION_KEY));
      core.storage(session, 'setItem', core.ATTRIBUTION_KEY, JSON.stringify(window.bulltechAdsAttribution));
      pixel(); window.oaiq('consent', true);
      measureContact();
      if (!document.getElementById('gtm-loader')) {
        const s = document.createElement('script'); s.id = 'gtm-loader'; s.async = true;
        s.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-MX6XC96N';
        window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' }); document.head.appendChild(s);
      }
      if (!initialSent) {
        initialSent = true;
        const ctx = context();
        window.oaiq('measure', 'page_viewed', { type: 'contents', contents: [{ id: location.pathname, name: document.title, content_type: 'page' }] }, { opt_out: true });
        push('landing_loaded'); custom('landing_' + (ctx.variant || 'control'));
        if (['a', 'b'].includes(ctx.variant)) {
          push('experiment_assignment', { experiment: 'service_landing_ab_v1', variant: ctx.variant, assignment_source: ctx.assignmentSource });
          core.storage(local, 'setItem', 'bulltech_lp_ab_v1:' + ctx.basePath, ctx.variant);
        }
      }
    } else {
      window.bulltechAdsAttribution = {};
      core.storage(session, 'removeItem', core.ATTRIBUTION_KEY);
      core.storage(session, 'removeItem', 'bulltech_ads_attribution_v1');
      try { Object.keys(local).filter(k => k.startsWith('bulltech_lp_ab_v1:')).forEach(k => local.removeItem(k)); } catch (_) {}
      if (typeof window.oaiq === 'function') window.oaiq('consent', false);
    }
    document.getElementById('cookie-banner')?.setAttribute('hidden', '');
  }
  window.bulltechMeasurement = {
    hasConsent: () => consent,
    leadCreated: id => {
      if (!consent || !/^btads_[a-f0-9-]{36}$/.test(id)) return;
      const key = 'bulltech_lead_measured:' + id;
      if (leads.has(id) || core.storage(session, 'getItem', key)) return;
      leads.add(id); core.storage(session, 'setItem', key, '1');
      push('lead_created', { event_id: id });
      window.oaiq('measure', 'lead_created', { type: 'customer_action' }, { event_id: id, opt_out: true });
    }
  };
  const banner = document.getElementById('cookie-banner');
  const saved = core.storage(local, 'getItem', core.CONSENT_KEY);
  if (saved === 'granted' || saved === 'denied') setConsent(saved); else banner?.removeAttribute('hidden');
  document.getElementById('cookie-accept')?.addEventListener('click', () => setConsent('granted'));
  document.getElementById('cookie-reject')?.addEventListener('click', () => setConsent('denied'));
  document.getElementById('cookie-settings')?.addEventListener('click', () => banner?.removeAttribute('hidden'));
  function placement(el) {
    for (const [selector, name] of [['header','header'],['.hero','hero'],['.final-cta','final'],['.inline-cta','mid'],['.mobile-contact-bar','sticky']]) if (el.closest(selector)) return name;
    return 'page';
  }
  for (const type of ['phone','email']) document.querySelectorAll('.track-' + type).forEach(el => el.addEventListener('click', () => {
    const section = placement(el);
    event(type + '_click', { placement: section === 'sticky' ? 'sticky' : 'page', cta_section: section }, type + '_click_' + section);
  }));
  document.querySelectorAll('.track-cta').forEach(el => el.addEventListener('click', () => event('cta_click')));
  document.querySelectorAll('.faq-list details').forEach((el,i) => el.addEventListener('toggle', () => { if (el.open) event('faq_open', { faq_index: i+1 }); }));
  window.addEventListener('scroll', () => {
    if (!consent) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const pct = Math.round(window.scrollY / max * 100);
    for (const t of [25,50,75,90]) if (pct >= t && !depths.has(t)) { depths.add(t); event('scroll_depth', { percent:t }, 'scroll_' + t); }
  }, { passive:true });
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', tick);
  window.addEventListener('pagehide', tick);
  const contact = document.getElementById('contatti');
  function measureContact() {
    if (consent && contactVisible && !contactSent) { contactSent = true; event('contact_section_view'); contactObserver?.disconnect(); }
  }
  if (contact && 'IntersectionObserver' in window) {
    contactObserver = new IntersectionObserver(entries => {
      contactVisible = entries.some(e => e.isIntersecting && e.intersectionRatio >= .35);
      measureContact();
    }, { threshold:.35 }); contactObserver.observe(contact);
  }
})();
