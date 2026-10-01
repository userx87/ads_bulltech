'use strict';
// Browser tests use local files and stub every external request. They cannot create real leads or Ads events.
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const rewrites = require('../vercel.json').rewrites;
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const target = rewrites.find(r => r.source === pathname)?.destination || pathname;
  const file = path.resolve(root, '.' + target);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end(); }
  res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' })[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
const results = [];
let browser, origin;
async function fixture(options = {}) {
  const context = await browser.newContext({ viewport: options.mobile ? { width: 390, height: 844 } : { width: 1440, height: 960 } });
  const page = await context.newPage();
  const posts = [], external = [], errors = [];
  page.on('pageerror', e => errors.push(e.message));
  if (options.blockedStorage) await page.addInitScript(() => {
    for (const key of ['localStorage', 'sessionStorage']) Object.defineProperty(window, key, { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  await context.route('**/*', async route => {
    const req = route.request(), u = new URL(req.url());
    if (u.origin !== origin) { external.push(req.url()); return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }); }
    if (u.pathname !== '/api/lead') return route.continue();
    if (req.method() === 'GET') return route.fulfill({ json: { enabled: options.enabled !== false } });
    const payload = req.postDataJSON(); posts.push(payload);
    if (options.onPost) return options.onPost(route, payload, posts.length);
    return route.fulfill({ json: { accepted: true, leadId: '123', submission_id: payload.submission_id } });
  });
  const open = async (url = '/assistenza-it-pmi?utm_source=chatgpt&utm_medium=paid&utm_campaign=test&utm_content=assistenza_c&oppref=test-click') => {
    await page.goto(origin + url);
    await page.waitForFunction(() => Boolean(window.bulltechMeasurement));
    if (options.enabled !== false) await page.locator('#richiesta').waitFor({ state: 'visible' });
  };
  const fill = async () => {
    for (const [name, value] of Object.entries({ nome: 'TEST FIX15', azienda: 'TEST NON CONTATTARE', email: 'test@example.invalid', telefono: '0000000000', messaggio: 'Test tecnico senza contatti reali.' })) await page.locator(`[name="${name}"]`).fill(value);
    await page.locator('[name="privacy"]').check();
  };
  return { page, context, posts, external, errors, open, fill, close: () => context.close() };
}
async function check(name, run) { await run(); results.push({ test: name, passed: true }); console.log('PASS ' + name); }
async function events(page) { return page.evaluate(() => window.dataLayer.filter(x => x.event)); }
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = 'http://127.0.0.1:' + server.address().port;
  try { browser = await chromium.launch({ headless: true }); } catch (_) { browser = await chromium.launch({ headless: true, channel: 'chrome' }); }
  try {
    await check('disabled integration stays hidden and existing contact links remain', async () => {
      const f = await fixture({ enabled: false }); await f.open();
      assert.equal(await f.page.locator('#richiesta').isHidden(), true);
      assert.ok(await f.page.locator('a[href^="tel:"]').count() > 0);
      assert.deepEqual(f.errors, []); await f.close();
    });
    await check('consent rejection allows a lead but no SDK request, UTM, click ID or conversion', async () => {
      const f = await fixture(); await f.open();
      assert.equal(f.external.length, 0);
      await f.page.locator('#cookie-reject').click(); await f.fill();
      await f.page.locator('#lead-form button[type="submit"]').click();
      await f.page.waitForFunction(() => document.querySelector('#lead-status').textContent.startsWith('Richiesta ricevuta'));
      assert.equal(f.posts.length, 1); assert.equal(f.posts[0].audience.attribution, undefined);
      assert.equal(f.posts[0].entryUtmSource, undefined); assert.equal(f.external.length, 0);
      assert.equal((await events(f.page)).filter(x => x.event === 'lead_created').length, 0);
      assert.deepEqual(f.errors, []); await f.close();
    });
    await check('consented lead records separate ad/landing variants, one conversion and no contact fields', async () => {
      const f = await fixture(); await f.open('/assistenza-it-pmi-b?utm_source=chatgpt&utm_content=assistenza_c&oppref=test-click');
      await f.page.locator('#cookie-accept').click(); await f.fill();
      await f.page.locator('#lead-form button[type="submit"]').click();
      await f.page.waitForFunction(() => document.querySelector('#lead-status').textContent.startsWith('Richiesta ricevuta'));
      const p = f.posts[0]; assert.equal(p.entryUtmContent, 'assistenza_c'); assert.equal(p.audience.landing_variant, 'b');
      await f.page.evaluate(id => window.bulltechMeasurement.leadCreated(id), p.submission_id);
      const recorded = await events(f.page);
      assert.equal(recorded.filter(x => x.event === 'lead_created').length, 1);
      const queue = await f.page.evaluate(() => window.oaiq.q.map(a => Array.from(a)));
      assert.equal(queue.filter(x => x[0] === 'measure' && x[1] === 'lead_created').length, 1);
      assert.equal(queue.find(x => x[1] === 'lead_created')[3].event_id, p.submission_id);
      assert.ok(!JSON.stringify(recorded).includes('test@example.invalid'));
      assert.ok(!JSON.stringify(recorded).includes('test-click'));
      assert.deepEqual(f.errors, []); await f.close();
    });
    await check('an ambiguous 200 is not accepted; a retry reuses the request ID', async () => {
      const f = await fixture({ onPost: (r, p, count) => r.fulfill({ json: count === 1 ? { success: true } : { accepted: true, leadId: '123', submission_id: p.submission_id } }) });
      await f.open(); await f.page.locator('#cookie-accept').click(); await f.fill();
      await f.page.locator('#lead-form button[type="submit"]').click();
      await f.page.waitForFunction(() => document.querySelector('#lead-status').textContent.startsWith('Non possiamo'));
      assert.equal((await events(f.page)).filter(x => x.event === 'lead_created').length, 0);
      await f.page.locator('#lead-form button[type="submit"]').click();
      await f.page.waitForFunction(() => document.querySelector('#lead-status').textContent.startsWith('Richiesta ricevuta'));
      assert.equal(f.posts.length, 2); assert.equal(f.posts[0].submission_id, f.posts[1].submission_id);
      assert.deepEqual(f.errors, []); await f.close();
    });
    await check('uncertain submission survives reload without storing contact details', async () => {
      const f = await fixture({ onPost: (r, p, count) => r.fulfill({ status: count === 1 ? 502 : 200, json: count === 1 ? {} : { accepted: true, leadId: '123', submission_id: p.submission_id } }) });
      await f.open(); await f.page.locator('#cookie-reject').click(); await f.fill();
      await f.page.locator('#lead-form button[type="submit"]').click();
      await f.page.waitForFunction(() => document.querySelector('#lead-status').textContent.startsWith('Non possiamo'));
      const saved = await f.page.evaluate(() => JSON.stringify(sessionStorage));
      assert.ok(!saved.includes('test@example.invalid')); assert.ok(!saved.includes('TEST NON CONTATTARE'));
      await f.open(); await f.fill(); await f.page.locator('#lead-form button[type="submit"]').click();
      await f.page.waitForFunction(() => document.querySelector('#lead-status').textContent.startsWith('Richiesta ricevuta'));
      assert.equal(f.posts[0].submission_id, f.posts[1].submission_id); await f.close();
    });
    await check('two simultaneous submits result in one network request', async () => {
      const f = await fixture(); await f.open(); await f.page.locator('#cookie-reject').click(); await f.fill();
      await f.page.evaluate(() => { const form = document.querySelector('#lead-form'); form.requestSubmit(); form.requestSubmit(); });
      await f.page.waitForFunction(() => document.querySelector('#lead-status').textContent.startsWith('Richiesta ricevuta'));
      assert.equal(f.posts.length, 1); await f.close();
    });
    await check('blocked storage still permits consent and sending a request', async () => {
      const f = await fixture({ blockedStorage: true }); await f.open(); await f.page.locator('#cookie-reject').click(); await f.fill();
      await f.page.locator('#lead-form button[type="submit"]').click();
      await f.page.waitForFunction(() => document.querySelector('#lead-status').textContent.startsWith('Richiesta ricevuta'));
      assert.deepEqual(f.errors, []); await f.close();
    });
    await check('revocation clears attribution and stops subsequent conversion measurement', async () => {
      const f = await fixture(); await f.open(); await f.page.locator('#cookie-accept').click();
      await f.page.locator('#cookie-settings').click(); await f.page.locator('#cookie-reject').click();
      assert.equal(await f.page.evaluate(() => window.bulltechMeasurement.hasConsent()), false);
      assert.deepEqual(await f.page.evaluate(() => window.bulltechAdsAttribution), {});
      await f.fill(); await f.page.locator('#lead-form button[type="submit"]').click();
      await f.page.waitForFunction(() => document.querySelector('#lead-status').textContent.startsWith('Richiesta ricevuta'));
      assert.equal(f.posts[0].audience.attribution, undefined);
      assert.equal((await events(f.page)).filter(x => x.event === 'lead_created').length, 0);
      await f.close();
    });
    await check('14 service/variant routes work on mobile without horizontal overflow', async () => {
      const f = await fixture({ mobile: true });
      const routes = rewrites.filter(r => ['/service.html', '/assessment-it-monza.html'].includes(r.destination));
      assert.equal(routes.length, 14);
      for (const r of routes) {
        await f.open(r.source); if (await f.page.locator('#cookie-reject').isVisible()) await f.page.locator('#cookie-reject').click();
        assert.ok(await f.page.locator('h1').innerText());
        assert.equal(await f.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, r.source);
        assert.equal(await f.page.locator('#lead-form').count(), 1);
      }
      await f.page.locator('#richiesta').scrollIntoViewIfNeeded();
      fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
      await f.page.screenshot({ path: path.join(root, 'test-results/audience-mobile.png'), fullPage: false });
      assert.deepEqual(f.errors, []); await f.close();
    });
    await check('desktop form renders the optional qualification fields', async () => {
      const f = await fixture(); await f.open(); await f.page.locator('#cookie-reject').click();
      await f.page.locator('.lead-details summary').click();
      for (const name of ['citta', 'settore', 'dipendenti', 'ruolo', 'urgenza']) assert.equal(await f.page.locator(`[name="${name}"]`).isVisible(), true);
      await f.page.locator('#richiesta').scrollIntoViewIfNeeded();
      await f.page.screenshot({ path: path.join(root, 'test-results/audience-desktop.png'), fullPage: false });
      assert.deepEqual(f.errors, []); await f.close();
    });
  } finally {
    fs.mkdirSync(path.join(root, 'test-results'), { recursive: true });
    fs.writeFileSync(path.join(root, 'test-results/browser.json'), JSON.stringify({ externalTrafficStubbed: true, results }, null, 2));
    await browser.close(); await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
