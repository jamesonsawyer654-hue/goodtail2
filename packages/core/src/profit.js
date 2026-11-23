// Profit math. Every dollar that leaves the business is counted:
// product cost, supplier shipping, payment fees (incl. fees PayPal keeps on refunds),
// refunds, ad spend, and fixed expenses (domain, subscriptions, samples).

export const PAYPAL_FEE = Object.freeze({ pct: 0.0349, fixedUsd: 0.49 }); // US PayPal Checkout / payment links, Nov 2026
const round2 = (n) => Math.round(n * 100) / 100;

export const paymentFee = (amountUsd, fee = PAYPAL_FEE) => (amountUsd > 0 ? round2(amountUsd * fee.pct + fee.fixedUsd) : 0);

/**
 * @param {object} o { revenueUsd, productCostUsd, supplierShippingUsd, refundedUsd, status }
 * Refunds: PayPal does not return its fee, so the fee stays an expense.
 * Cancelled before supplier payment: no product/shipping cost.
 */
export function orderEconomics(o) {
  const fee = paymentFee(o.revenueUsd);
  const cogs = round2((o.productCostUsd || 0) + (o.supplierShippingUsd || 0));
  const refunded = round2(o.refundedUsd || 0);
  const net = round2(o.revenueUsd - fee - cogs - refunded);
  return { revenueUsd: round2(o.revenueUsd), feeUsd: fee, cogsUsd: cogs, refundedUsd: refunded, netUsd: net,
    marginPct: o.revenueUsd > 0 ? round2((net / o.revenueUsd) * 100) : 0 };
}

/**
 * Period summary for the dashboard.
 * @param {object[]} orders   paid orders in the period (see orderEconomics)
 * @param {object[]} expenses { amountUsd, category: 'ads'|'subscription'|'domain'|'samples'|'other' }
 */
export function periodSummary(orders, expenses = []) {
  const sum = (arr, f) => round2(arr.reduce((a, x) => a + f(x), 0));
  const per = orders.map(orderEconomics);
  const revenue = sum(per, (x) => x.revenueUsd);
  const productCost = sum(orders, (o) => o.productCostUsd || 0);
  const shipping = sum(orders, (o) => o.supplierShippingUsd || 0);
  const fees = sum(per, (x) => x.feeUsd);
  const refunds = sum(per, (x) => x.refundedUsd);
  const ads = sum(expenses.filter((e) => e.category === 'ads'), (e) => e.amountUsd);
  const otherExpenses = sum(expenses.filter((e) => e.category !== 'ads'), (e) => e.amountUsd);
  const net = round2(revenue - productCost - shipping - fees - refunds - ads - otherExpenses);
  return {
    orders: orders.length, revenueUsd: revenue, productCostUsd: productCost, shippingUsd: shipping, paymentFeesUsd: fees,
    refundsUsd: refunds, adSpendUsd: ads, otherExpensesUsd: otherExpenses, netProfitUsd: net,
    marginPct: revenue > 0 ? round2((net / revenue) * 100) : 0,
    averageOrderValueUsd: orders.length ? round2(revenue / orders.length) : 0,
  };
}

/**
 * Suggest a retail price from landed cost: keep landed cost <= targetCostRatio of price,
 * round up to .99, and report the resulting margin after PayPal fees.
 */
export function suggestPrice(landedCostUsd, { targetCostRatio = 0.4, minMarginPct = 30 } = {}) {
  const raw = landedCostUsd / targetCostRatio;
  const price = Math.max(Math.ceil(raw) - 0.01, 0.99);
  const e = orderEconomics({ revenueUsd: price, productCostUsd: landedCostUsd });
  return { priceUsd: round2(price), netUsd: e.netUsd, marginPct: e.marginPct, ok: e.marginPct >= minMarginPct };
}
