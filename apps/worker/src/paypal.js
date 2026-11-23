// PayPal Orders API v2 client (server side). Docs: developer.paypal.com/docs/api/orders/v2/
// Secrets come from Worker secrets PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET; PAYPAL_ENV = "sandbox" | "live".

const BASE = { sandbox: 'https://api-m.sandbox.paypal.com', live: 'https://api-m.paypal.com' };

export class PaypalError extends Error {
  constructor(message, status, details) { super(message); this.status = status; this.details = details; }
  get issue() { return this.details?.details?.[0]?.issue; }
}

export const paypalConfigured = (env) => Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
export const paypalMode = (env) => (env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox');
const base = (env) => BASE[paypalMode(env)];
const money = (n) => ({ currency_code: 'USD', value: n.toFixed(2) });

let cached = null; // { key, token, exp }
export const _resetTokenCache = () => { cached = null; };

export async function getAccessToken(env, fetchImpl = fetch) {
  const key = `${paypalMode(env)}:${env.PAYPAL_CLIENT_ID}`;
  if (cached && cached.key === key && cached.exp > Date.now() + 60_000) return cached.token;
  const res = await fetchImpl(`${base(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: { authorization: 'Basic ' + btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`), 'content-type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new PaypalError('PayPal login failed (check PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET and PAYPAL_ENV)', res.status, data);
  cached = { key, token: data.access_token, exp: Date.now() + (data.expires_in || 300) * 1000 };
  return cached.token;
}

async function call(env, fetchImpl, method, path, body, headers = {}) {
  const token = await getAccessToken(env, fetchImpl);
  const res = await fetchImpl(`${base(env)}${path}`, {
    method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', prefer: 'return=representation', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new PaypalError(`PayPal ${method} ${path} failed (${res.status})`, res.status, data);
  return data;
}

/** Creates a PayPal order whose amount and items come only from our server-priced cart. */
export function createPaypalOrder(env, { orderNumber, cart }, fetchImpl = fetch) {
  return call(env, fetchImpl, 'POST', '/v2/checkout/orders', {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: orderNumber, custom_id: orderNumber, invoice_id: orderNumber,
      description: 'Good Tail Co. order',
      amount: { ...money(cart.totalUsd), breakdown: { item_total: money(cart.subtotalUsd), shipping: money(cart.shippingUsd) } },
      items: cart.lines.map((l) => ({ name: l.name.slice(0, 127), sku: l.sku, quantity: String(l.qty), unit_amount: money(l.unitUsd), category: 'PHYSICAL_GOODS' })),
    }],
  }, { 'paypal-request-id': `${orderNumber}-create` });
}

export const capturePaypalOrder = (env, paypalOrderId, orderNumber, fetchImpl = fetch) =>
  call(env, fetchImpl, 'POST', `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, undefined, { 'paypal-request-id': `${orderNumber}-capture` });

export const getPaypalOrder = (env, paypalOrderId, fetchImpl = fetch) =>
  call(env, fetchImpl, 'GET', `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);

/** Pulls what we need out of a captured PayPal order. */
export function readCapture(ppOrder) {
  const pu = ppOrder?.purchase_units?.[0] || {};
  const cap = pu.payments?.captures?.[0] || {};
  const a = pu.shipping?.address || {};
  return {
    orderStatus: ppOrder?.status,
    captureId: cap.id || null,
    captureStatus: cap.status || null,
    amountUsd: cap.amount?.currency_code === 'USD' ? Number(cap.amount.value) : NaN,
    email: ppOrder?.payer?.email_address || null,
    name: pu.shipping?.name?.full_name || [ppOrder?.payer?.name?.given_name, ppOrder?.payer?.name?.surname].filter(Boolean).join(' ') || null,
    address: a.country_code ? { line1: a.address_line_1 || '', line2: a.address_line_2 || '', city: a.admin_area_2 || '', state: a.admin_area_1 || '', zip: a.postal_code || '', country: a.country_code } : null,
  };
}
