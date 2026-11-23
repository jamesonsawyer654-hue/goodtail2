import { test } from 'node:test';
import assert from 'node:assert/strict';
import { supplierAutoPayDecision, refundDecision, spendDecision, DEFAULT_SETTINGS } from '../src/rules.js';
import { paymentFee, orderEconomics, periodSummary, suggestPrice } from '../src/profit.js';
import { transition, canTransition } from '../src/orders.js';

const addr = { country: 'US', line1: '1 Main St', city: 'Austin', state: 'TX', zip: '78701' };
const paidOrder = { status: 'paid', paidAmountUsd: 39.99, expectedAmountUsd: 39.99, shippingAddress: addr, flags: [] };

// ---------- supplier auto-pay ----------
test('auto-pays a normal paid order', () => {
  const d = supplierAutoPayDecision(paidOrder, { supplierCostUsd: 20 }, { balanceUsd: 50 });
  assert.equal(d.allowed, true); assert.deepEqual(d.reasons, []);
});
test('holds when customer payment does not match the order total', () => {
  const d = supplierAutoPayDecision({ ...paidOrder, paidAmountUsd: 1 }, { supplierCostUsd: 20 }, { balanceUsd: 50 });
  assert.equal(d.allowed, false); assert.match(d.reasons.join(), /order total/);
});
test('holds when the order is not paid yet', () => {
  assert.equal(supplierAutoPayDecision({ ...paidOrder, status: 'pending_payment' }, { supplierCostUsd: 20 }, { balanceUsd: 50 }).allowed, false);
});
test('holds above the per-order cap and when the order would lose money', () => {
  const d = supplierAutoPayDecision({ ...paidOrder, paidAmountUsd: 70, expectedAmountUsd: 70 }, { supplierCostUsd: 65 }, { balanceUsd: 100 });
  assert.equal(d.allowed, false);
  assert.ok(d.reasons.some((r) => r.includes('cap')));
  assert.ok(d.reasons.some((r) => r.includes('lose money')));
});
test('holds when CJ balance is too low', () => {
  const d = supplierAutoPayDecision(paidOrder, { supplierCostUsd: 20 }, { balanceUsd: 5 });
  assert.match(d.reasons.join(), /top it up/);
});
test('holds non-US or incomplete addresses and flagged orders', () => {
  const d = supplierAutoPayDecision({ ...paidOrder, shippingAddress: { country: 'CA' }, flags: ['possible fraud'] }, { supplierCostUsd: 20 }, { balanceUsd: 50 });
  assert.equal(d.reasons.length, 3);
});
test('respects auto-pay switched off', () => {
  assert.equal(supplierAutoPayDecision(paidOrder, { supplierCostUsd: 20 }, { balanceUsd: 50 }, { ...DEFAULT_SETTINGS, supplierAutoPay: false }).allowed, false);
});

// ---------- refunds ----------
const now = new Date('2026-12-01T00:00:00Z');
const delivered = { status: 'delivered', totalUsd: 19.99, refundedUsd: 0, shippedAt: '2026-11-10', deliveredAt: '2026-11-20' };
test('auto-refunds a damaged item with a photo inside the window', () => {
  assert.equal(refundDecision({ amountUsd: 19.99, reason: 'damaged', hasPhoto: true }, delivered, now).allowed, true);
});
test('damaged item without a photo needs approval', () => {
  assert.equal(refundDecision({ amountUsd: 19.99, reason: 'damaged', hasPhoto: false }, delivered, now).allowed, false);
});
test('refunds of $25 or more always need approval', () => {
  const d = refundDecision({ amountUsd: 39.99, reason: 'damaged', hasPhoto: true }, { ...delivered, totalUsd: 39.99 }, now);
  assert.match(d.reasons.join(), /automatic limit/);
});
test('lost in transit: too early vs. stale tracking', () => {
  const shipped = { status: 'shipped', totalUsd: 19.99, refundedUsd: 0, shippedAt: '2026-11-01', lastTrackingEventAt: '2026-11-25' };
  assert.equal(refundDecision({ amountUsd: 19.99, reason: 'lost_in_transit' }, shipped, now).allowed, false);
  assert.equal(refundDecision({ amountUsd: 19.99, reason: 'lost_in_transit' }, { ...shipped, lastTrackingEventAt: '2026-11-05' }, now).allowed, true);
});
test('change of mind and double refunds always need approval', () => {
  assert.equal(refundDecision({ amountUsd: 5, reason: 'changed_mind' }, delivered, now).allowed, false);
  assert.equal(refundDecision({ amountUsd: 5, reason: 'damaged', hasPhoto: true }, { ...delivered, refundedUsd: 5 }, now).allowed, false);
});
test('a refund can never exceed what was paid', () => {
  assert.match(refundDecision({ amountUsd: 20, reason: 'damaged', hasPhoto: true }, { ...delivered, totalUsd: 12.99 }, now).reasons.join(), /exceed/);
});
test('any spending needs approval', () => {
  assert.equal(spendDecision({ amountUsd: 10, category: 'ads' }).allowed, false);
});

// ---------- profit ----------
test('PayPal fee is 3.49% + $0.49', () => {
  assert.equal(paymentFee(19.99), 1.19); assert.equal(paymentFee(39.99), 1.89); assert.equal(paymentFee(0), 0);
});
test('order economics subtract fee, product, shipping and refunds', () => {
  const e = orderEconomics({ revenueUsd: 19.99, productCostUsd: 2.5, supplierShippingUsd: 6.5, refundedUsd: 0 });
  assert.equal(e.netUsd, 9.8);
});
test('a fully refunded order still costs the PayPal fee and goods', () => {
  const e = orderEconomics({ revenueUsd: 19.99, productCostUsd: 2.5, supplierShippingUsd: 6.5, refundedUsd: 19.99 });
  assert.equal(e.netUsd, -10.19);
});
test('period summary includes ads and fixed expenses', () => {
  const s = periodSummary(
    [{ revenueUsd: 19.99, productCostUsd: 2.5, supplierShippingUsd: 6.5 }, { revenueUsd: 39.99, productCostUsd: 8, supplierShippingUsd: 12 }],
    [{ amountUsd: 10, category: 'ads' }, { amountUsd: 11, category: 'domain' }]);
  assert.equal(s.orders, 2); assert.equal(s.revenueUsd, 59.98); assert.equal(s.paymentFeesUsd, 3.08);
  assert.equal(s.netProfitUsd, round(59.98 - 29 - 3.08 - 21)); assert.equal(s.averageOrderValueUsd, 29.99);
});
test('price suggestion keeps landed cost <= 40% and ends in .99', () => {
  const p = suggestPrice(9);
  assert.equal(p.priceUsd, 22.99); assert.equal(p.ok, true);
});

// ---------- order lifecycle ----------
test('orders cannot skip the supplier step', () => {
  assert.equal(canTransition('paid', 'shipped'), false);
  assert.throws(() => transition({ status: 'paid' }, 'shipped'));
});
test('transitions are audited', () => {
  const o = transition({ status: 'paid', events: [] }, 'supplier_ordered', { reason: 'auto-pay', at: 'T' });
  assert.equal(o.status, 'supplier_ordered'); assert.deepEqual(o.events[0], { from: 'paid', to: 'supplier_ordered', reason: 'auto-pay', at: 'T', actor: 'system' });
});
test('final states are final', () => {
  assert.equal(canTransition('refunded', 'paid'), false); assert.equal(canTransition('cancelled', 'paid'), false);
});

function round(n) { return Math.round(n * 100) / 100; }
