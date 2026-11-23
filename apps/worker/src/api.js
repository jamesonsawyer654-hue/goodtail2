// API routes. Kept separate from index.js because a Worker's entry module may only export handlers.
import catalog from '../../../catalog/products.json' with { type: 'json' };
import { migrate, getOrder } from './db.js';
import { paypalConfigured, paypalMode, PaypalError } from './paypal.js';
import { createCheckout, captureCheckout, UserError } from './checkout.js';

export const VERSION = '0.2.0';

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

async function readJson(request, maxBytes = 10_000) {
  const text = await request.text();
  if (text.length > maxBytes) throw new UserError('Request too large', 413);
  try { return JSON.parse(text || '{}'); } catch { throw new UserError('Invalid JSON'); }
}

const checkoutReady = (env) => paypalConfigured(env) && Boolean(env.DB);

export async function handleApi(request, env, deps = {}) {
  const url = new URL(request.url);
  const route = `${request.method} ${url.pathname}`;
  const d = { catalog, fetchImpl: deps.fetchImpl || fetch };
  try {
    if (env.DB) await migrate(env.DB);
    switch (route) {
      case 'GET /api/health':
        return json({ ok: true, service: 'goodtail', version: VERSION,
          integrations: { paypal: paypalConfigured(env), paypalMode: paypalMode(env), cj: Boolean(env.CJ_API_KEY), database: Boolean(env.DB) } });

      case 'GET /api/config': // public values only
        return json({ checkoutEnabled: checkoutReady(env), paypalClientId: checkoutReady(env) ? env.PAYPAL_CLIENT_ID : null, paypalMode: paypalMode(env), currency: 'USD' });

      case 'POST /api/checkout/create':
        if (!checkoutReady(env)) return json({ ok: false, error: 'Checkout is not open yet' }, 503);
        return json({ ok: true, ...(await createCheckout(env, await readJson(request), d)) });

      case 'POST /api/checkout/capture':
        if (!checkoutReady(env)) return json({ ok: false, error: 'Checkout is not open yet' }, 503);
        return json({ ok: true, ...(await captureCheckout(env, await readJson(request), d)) });

      case 'GET /api/orders/track': {
        if (!env.DB) return json({ ok: false, error: 'Order lookup is not available yet' }, 503);
        const number = (url.searchParams.get('number') || '').trim().toUpperCase();
        const email = (url.searchParams.get('email') || '').trim().toLowerCase();
        const o = /^GT-[A-Z0-9]{8}$/.test(number) && email ? await getOrder(env.DB, number) : null;
        // Same answer for "no such order" and "wrong email", so order numbers can't be probed.
        if (!o || (o.email || '').toLowerCase() !== email) return json({ ok: false, error: 'We couldn’t find an order with that number and email.' }, 404);
        return json({ ok: true, order: { number: o.id, status: o.status, placedAt: o.createdAt, items: o.items.map(({ name, qty }) => ({ name, qty })),
          totalUsd: o.totalUsd, trackingNumber: o.trackingNumber, carrier: o.carrier, shippedAt: o.shippedAt, deliveredAt: o.deliveredAt } });
      }
    }
    return json({ ok: false, error: 'Not found' }, 404);
  } catch (e) {
    if (e instanceof UserError) return json({ ok: false, error: e.message }, e.status);
    console.error(route, e instanceof PaypalError ? { msg: e.message, status: e.status, debug: e.details?.debug_id } : e);
    return json({ ok: false, error: 'Something went wrong. Please try again in a moment.' }, 502);
  }
}
