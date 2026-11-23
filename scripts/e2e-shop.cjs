// Shopper flow test against a running site (default: wrangler dev on :8787).
// Add to bag -> bag count -> bag page totals -> quantity change -> checkout state -> order tracking.
const { chromium } = require('playwright');
const BASE = (process.argv[2] || 'http://127.0.0.1:8787').replace(/\/$/, '');
const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exitCode = 1; } else console.log('ok -', m); };

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errors = []; p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(BASE + '/products/brush');
  await p.click('.panel [data-add]');
  assert((await p.textContent('.bag-link [data-bag-count]')) === '1', 'adding to bag updates the header count');
  assert(await p.isVisible('#toast'), 'shows an "added" confirmation');
  await p.goto(BASE + '/products/kit');
  await p.click('.panel [data-add]');
  await p.goto(BASE + '/cart');
  await p.waitForSelector('.line');
  assert((await p.$$('.line')).length === 2, 'bag lists both items');
  assert((await p.textContent('#bag-total')) === '$59.98', 'bag total is $19.99 + $39.99');
  await p.click('[data-inc="GTC-BRUSH"]');
  assert((await p.textContent('#bag-total')) === '$79.97', 'quantity + updates the total');
  await p.click('[data-rm="GTC-KIT"]');
  assert((await p.textContent('#bag-total')) === '$39.98' && (await p.textContent('.bag-link [data-bag-count]')) === '2', 'remove updates total and count');
  await p.waitForFunction(() => !/Loading/.test(document.querySelector('#checkout-msg').textContent));
  const cfg = await (await p.request.get(BASE + '/api/config')).json();
  const msg = await p.textContent('#checkout-msg');
  assert(cfg.checkoutEnabled ? (await p.$('#paypal-buttons > *')) !== null : /opening soon/.test(msg),
    cfg.checkoutEnabled ? 'PayPal buttons render' : 'checkout honestly says it is not open yet (no fake button)');
  await p.reload(); await p.waitForSelector('.line');
  assert((await p.$$('.line')).length === 1, 'bag survives a page reload');
  await p.goto(BASE + '/track');
  await p.fill('[name=number]', 'GT-AAAAAAAA'); await p.fill('[name=email]', 'nobody@example.com'); await p.click('#track-form button');
  await p.waitForFunction(() => !/Looking up/.test(document.querySelector('#track-result').textContent));
  assert(/couldn’t find/.test(await p.textContent('#track-result')), 'tracking an unknown order gives a clear message');
  assert(errors.length === 0, 'no JavaScript errors' + (errors.length ? ': ' + errors.join('; ') : ''));
  await b.close();
})();
