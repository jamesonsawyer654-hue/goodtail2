// Money and approval rules. Pure functions: no I/O, fully unit-tested.
// Every decision returns { allowed, requiresApproval, reasons[] } so the dashboard
// can show *why* something was held, and nothing moves money without an explicit "allowed".

export const DEFAULT_SETTINGS = Object.freeze({
  supplierAutoPay: true,          // owner decision (interview, group 3)
  supplierPerOrderCapUsd: 60,     // hard cap per supplier payment
  supplierMaxCostRatio: 0.8,      // supplier cost may not exceed 80% of what the customer paid
  refundAutoMaxUsd: 25,           // owner decision: auto-refund only below this amount
  refundWindowDays: 30,
  lostInTransitDays: 21,          // no tracking movement for this long counts as lost
});

const result = (reasons) => ({ allowed: reasons.length === 0, requiresApproval: reasons.length > 0, reasons });
const round2 = (n) => Math.round(n * 100) / 100;

/**
 * May we pay the supplier for this order automatically?
 * @param {object} order   { status, paidAmountUsd, expectedAmountUsd, shippingAddress, flags[] }
 * @param {object} quote   { supplierCostUsd } total CJ charge (products + shipping)
 * @param {object} wallet  { balanceUsd }
 */
export function supplierAutoPayDecision(order, quote, wallet, settings = DEFAULT_SETTINGS) {
  const r = [];
  if (!settings.supplierAutoPay) r.push('Automatic supplier payment is turned off');
  if (order.status !== 'paid') r.push(`Order is "${order.status}", not "paid"`);
  if (round2(order.paidAmountUsd) !== round2(order.expectedAmountUsd))
    r.push(`Customer paid $${round2(order.paidAmountUsd)} but the order total is $${round2(order.expectedAmountUsd)}`);
  if (!(quote.supplierCostUsd > 0)) r.push('No valid supplier quote');
  if (quote.supplierCostUsd > settings.supplierPerOrderCapUsd)
    r.push(`Supplier cost $${round2(quote.supplierCostUsd)} is above the $${settings.supplierPerOrderCapUsd} per-order cap`);
  if (quote.supplierCostUsd > order.paidAmountUsd * settings.supplierMaxCostRatio)
    r.push(`Supplier cost is more than ${settings.supplierMaxCostRatio * 100}% of what the customer paid (order would lose money)`);
  if (!(wallet.balanceUsd >= quote.supplierCostUsd)) r.push(`CJ balance $${round2(wallet.balanceUsd)} is too low; top it up`);
  const a = order.shippingAddress || {};
  if (a.country !== 'US') r.push('Shipping address is not in the US');
  if (!a.line1 || !a.city || !a.state || !a.zip) r.push('Shipping address is incomplete');
  for (const f of order.flags || []) r.push(`Order flagged: ${f}`);
  return result(r);
}

/**
 * May this refund be issued automatically?
 * @param {object} req    { amountUsd, reason: 'damaged'|'lost_in_transit'|'wrong_item'|'changed_mind'|'other', hasPhoto }
 * @param {object} order  { status, totalUsd, refundedUsd, deliveredAt, lastTrackingEventAt, shippedAt }
 * @param {Date}   now
 */
export function refundDecision(req, order, now = new Date(), settings = DEFAULT_SETTINGS) {
  const r = [];
  const days = (d) => (now - new Date(d)) / 86400000;
  if (!(req.amountUsd > 0)) r.push('Refund amount must be positive');
  if (req.amountUsd > settings.refundAutoMaxUsd) r.push(`Amount is above the $${settings.refundAutoMaxUsd} automatic limit`);
  if (round2((order.refundedUsd || 0) + req.amountUsd) > round2(order.totalUsd)) r.push('Refund would exceed what the customer paid');
  if (order.refundedUsd > 0) r.push('Order already has a refund; a person should look at it');
  if (req.reason === 'damaged' || req.reason === 'wrong_item') {
    if (!req.hasPhoto) r.push('Damage or wrong item needs a photo first');
    if (!order.deliveredAt) r.push('Order is not marked delivered');
    else if (days(order.deliveredAt) > settings.refundWindowDays) r.push(`Outside the ${settings.refundWindowDays}-day window`);
  } else if (req.reason === 'lost_in_transit') {
    if (!order.shippedAt) r.push('Order has not shipped yet; cancel instead of refunding');
    const last = order.lastTrackingEventAt || order.shippedAt;
    if (order.deliveredAt) r.push('Tracking shows the order was delivered');
    else if (last && days(last) < settings.lostInTransitDays) r.push(`Tracking moved within the last ${settings.lostInTransitDays} days; too early to call it lost`);
  } else {
    r.push(`Reason "${req.reason}" always needs your approval`);
  }
  return result(r);
}

/** Anything that spends business money (ads, subscriptions, samples, domains) always needs approval. */
export function spendDecision(spend) {
  return result([`Spending $${round2(spend.amountUsd)} on ${spend.category} needs your approval`]);
}
