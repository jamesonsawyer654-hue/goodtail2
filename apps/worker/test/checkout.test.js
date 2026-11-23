import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { handleApi } from '../src/api.js';
import { _resetMigrationFlag } from '../src/db.js';
import { _resetTokenCache } from '../src/paypal.js';
import { fakeD1, fakePaypal } from './helpers.js';

const SECRET = 'sk-not-for-browsers';
let env;
beforeEach(() => {
  _resetMigrationFlag(); _resetTokenCache();
  env = { DB: fakeD1(), PAYPAL_CLIENT_ID: 'client-id-public', PAYPAL_CLIENT_SECRET: SECRET, PAYPAL_ENV: 'sandbox' };
});
const call = async (method, path, body, fetchImpl) => {
  const res = await handleApi(new Request('https://shop.test' + path, { method, body: body ? JSON.stringify(body) : undefined }), env, { fetchImpl });
  return { status: res.status, body: await res.json() };
};
const createOrder = (pp, items = [{ sku: 'GTC-BRUSH', qty: 2 }]) => call('POST', '/api/checkout/create', { items }, pp.fetchImpl);

test('migrations create the schema and are safe to run twice', async () => {
  await call('GET', '/api/health'); _resetMigrationFlag(); await call('GET', '/api/health');
  const tables = env.DB.raw.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name);
  for (const t of ['orders', 'order_events', 'approvals', 'alerts', 'expenses', 'schema_migrations']) assert.ok(tables.includes(t), t);
});

test('config exposes the public client id only when checkout is ready, never the secret', async () => {
  const on = await call('GET', '/api/config');
  assert.equal(on.body.checkoutEnabled, true); assert.equal(on.body.paypalClientId, 'client-id-public');
  assert.ok(!JSON.stringify(on.body).includes(SECRET));
  delete env.PAYPAL_CLIENT_SECRET;
  const off = await call('GET', '/api/config');
  assert.equal(off.body.checkoutEnabled, false); assert.equal(off.body.paypalClientId, null);
});

test('checkout refuses to start when PayPal is not configured', async () => {
  delete env.PAYPAL_CLIENT_ID;
  const r = await createOrder(fakePaypal());
  assert.equal(r.status, 503);
});

test('create: PayPal gets server prices and the sandbox host; a pending order is stored', async () => {
  const pp = fakePaypal();
  const r = await call('POST', '/api/checkout/create', { items: [{ sku: 'GTC-BRUSH', qty: 2, price: 0.01 }] }, pp.fetchImpl);
  assert.equal(r.status, 200); assert.match(r.body.orderNumber, /^GT-[A-Z0-9]{8}$/); assert.equal(r.body.totalUsd, 39.98);
  const sent = JSON.parse(pp.calls.find((c) => c.path === '/v2/checkout/orders').body);
  assert.equal(sent.purchase_units[0].amount.value, '39.98');
  assert.equal(sent.purchase_units[0].items[0].unit_amount.value, '19.99');
  assert.ok(pp.calls.every((c) => c.host === 'api-m.sandbox.paypal.com'));
  const row = env.DB.raw.prepare('SELECT status, total_usd FROM orders WHERE id = ?').get(r.body.orderNumber);
  assert.equal(row.status, 'pending_payment'); assert.equal(row.total_usd, 39.98);
});

test('create rejects bad carts with a clear message', async () => {
  const r = await createOrder(fakePaypal(), [{ sku: 'GTC-NOPE', qty: 1 }]);
  assert.equal(r.status, 400); assert.match(r.body.error, /no longer available/);
});

test('capture: verified COMPLETED payment marks the order paid and stores buyer details + audit event', async () => {
  const pp = fakePaypal();
  const c = await createOrder(pp);
  const r = await call('POST', '/api/checkout/capture', { orderID: c.body.id }, pp.fetchImpl);
  assert.equal(r.body.status, 'paid');
  const row = env.DB.raw.prepare('SELECT * FROM orders WHERE id = ?').get(c.body.orderNumber);
  assert.equal(row.paid_usd, 39.98); assert.equal(row.paypal_capture_id, 'CAP123'); assert.equal(JSON.parse(row.ship_json).state, 'TX');
  const ev = env.DB.raw.prepare('SELECT * FROM order_events WHERE order_id = ?').all(c.body.orderNumber);
  assert.equal(ev.length, 1); assert.equal(ev[0].to_status, 'paid'); assert.equal(ev[0].actor, 'paypal');
});

test('capture is idempotent: a second call does not charge or change anything', async () => {
  const pp = fakePaypal();
  const c = await createOrder(pp);
  await call('POST', '/api/checkout/capture', { orderID: c.body.id }, pp.fetchImpl);
  const before = pp.calls.length;
  const again = await call('POST', '/api/checkout/capture', { orderID: c.body.id }, pp.fetchImpl);
  assert.equal(again.body.status, 'paid'); assert.equal(pp.calls.length, before);
});

test('capture with a wrong amount is never marked paid; it is flagged and alerted', async () => {
  const pp = fakePaypal({ captureAmount: '1.00' });
  const c = await createOrder(pp);
  const r = await call('POST', '/api/checkout/capture', { orderID: c.body.id }, pp.fetchImpl);
  assert.equal(r.body.status, 'needs_attention');
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) n FROM alerts WHERE level = ?').get('error').n, 1);
});

test('a PENDING PayPal capture stays unpaid and alerts the owner', async () => {
  const pp = fakePaypal({ captureStatus: 'PENDING' });
  const c = await createOrder(pp);
  const r = await call('POST', '/api/checkout/capture', { orderID: c.body.id }, pp.fetchImpl);
  assert.equal(r.body.status, 'pending_payment');
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) n FROM alerts').get().n, 1);
});

test('ORDER_ALREADY_CAPTURED is reconciled by reading the order from PayPal', async () => {
  const pp = fakePaypal({ alreadyCaptured: true });
  const c = await createOrder(pp);
  const r = await call('POST', '/api/checkout/capture', { orderID: c.body.id }, pp.fetchImpl);
  assert.equal(r.body.status, 'paid');
  assert.ok(pp.calls.some((x) => x.method === 'GET' && x.path === `/v2/checkout/orders/${c.body.id}`));
});

test('capture rejects unknown or malformed order references', async () => {
  const pp = fakePaypal();
  assert.equal((await call('POST', '/api/checkout/capture', { orderID: 'x' }, pp.fetchImpl)).status, 400);
  assert.equal((await call('POST', '/api/checkout/capture', { orderID: 'UNKNOWN12345' }, pp.fetchImpl)).status, 404);
});

test('order tracking needs the matching email (case-insensitive) and gives the same answer otherwise', async () => {
  const pp = fakePaypal();
  const c = await createOrder(pp);
  await call('POST', '/api/checkout/capture', { orderID: c.body.id }, pp.fetchImpl);
  const ok = await call('GET', `/api/orders/track?number=${c.body.orderNumber.toLowerCase()}&email=buyer@example.com`);
  assert.equal(ok.status, 200); assert.equal(ok.body.order.status, 'paid'); assert.equal(ok.body.order.items[0].qty, 2);
  assert.ok(!JSON.stringify(ok.body).includes('Main St'), 'no address in tracking response');
  const wrong = await call('GET', `/api/orders/track?number=${c.body.orderNumber}&email=someone@else.com`);
  const missing = await call('GET', '/api/orders/track?number=GT-AAAAAAAA&email=buyer@example.com');
  assert.equal(wrong.status, 404); assert.deepEqual(wrong.body, missing.body);
});

test('the PayPal login token is reused across requests', async () => {
  const pp = fakePaypal();
  await createOrder(pp); await createOrder(pp);
  assert.equal(pp.calls.filter((c) => c.path === '/v1/oauth2/token').length, 1);
});
