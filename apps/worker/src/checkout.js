// Checkout flows: create (price cart, open PayPal order, store pending order) and
// capture (capture at PayPal, verify the money, mark paid). Nothing is marked paid
// unless PayPal reports a COMPLETED capture for exactly the amount we priced.

import { priceCart, CartError } from '../../../packages/core/src/cart.js';
import { transition } from '../../../packages/core/src/orders.js';
import { createPaypalOrder, capturePaypalOrder, getPaypalOrder, readCapture, PaypalError } from './paypal.js';
import { newOrderNumber, insertPendingOrder, getOrderByPaypalId, saveTransition, addAlert } from './db.js';

export class UserError extends Error { constructor(msg, status = 400) { super(msg); this.status = status; } }

export async function createCheckout(env, body, { catalog, fetchImpl = fetch }) {
  let cart;
  try { cart = priceCart(catalog, body?.items); } catch (e) { if (e instanceof CartError) throw new UserError(e.message); throw e; }
  const orderNumber = newOrderNumber();
  const pp = await createPaypalOrder(env, { orderNumber, cart }, fetchImpl);
  await insertPendingOrder(env.DB, { id: orderNumber, paypalOrderId: pp.id, cart });
  return { id: pp.id, orderNumber, totalUsd: cart.totalUsd };
}

export async function captureCheckout(env, body, { fetchImpl = fetch }) {
  const paypalOrderId = body?.orderID;
  if (typeof paypalOrderId !== 'string' || !/^[A-Z0-9]{10,40}$/i.test(paypalOrderId)) throw new UserError('Invalid order reference');
  const order = await getOrderByPaypalId(env.DB, paypalOrderId);
  if (!order) throw new UserError('Order not found', 404);
  if (order.status !== 'pending_payment') return { orderNumber: order.id, status: order.status }; // already handled (idempotent)

  let pp;
  try {
    pp = await capturePaypalOrder(env, paypalOrderId, order.id, fetchImpl);
  } catch (e) {
    if (e instanceof PaypalError && e.issue === 'ORDER_ALREADY_CAPTURED') pp = await getPaypalOrder(env, paypalOrderId, fetchImpl);
    else if (e instanceof PaypalError && e.status === 422) throw new UserError('PayPal could not complete the payment. Please try again or use another payment method.', 402);
    else throw e;
  }
  const c = readCapture(pp);
  const fields = { paypal_capture_id: c.captureId, email: c.email, name: c.name, ship_json: c.address ? JSON.stringify(c.address) : null, paid_usd: Number.isFinite(c.amountUsd) ? c.amountUsd : null };

  if (c.captureStatus === 'COMPLETED' && Math.round(c.amountUsd * 100) === Math.round(order.totalUsd * 100)) {
    const paid = transition(order, 'paid', { reason: `PayPal capture ${c.captureId}`, actor: 'paypal' });
    await saveTransition(env.DB, order, paid, fields);
    return { orderNumber: order.id, status: 'paid' };
  }
  if (c.captureStatus === 'PENDING') {
    await addAlert(env.DB, 'warn', `Order ${order.id}: PayPal payment is pending review; do not ship until it completes.`, order.id);
    return { orderNumber: order.id, status: 'pending_payment' };
  }
  const bad = transition(order, 'needs_attention', { reason: `Capture ${c.captureStatus || 'missing'}; PayPal amount ${c.amountUsd} vs order ${order.totalUsd}`, actor: 'paypal' });
  await saveTransition(env.DB, order, bad, fields);
  await addAlert(env.DB, 'error', `Order ${order.id}: PayPal capture did not match (status ${c.captureStatus}, amount ${c.amountUsd} vs ${order.totalUsd}). Check PayPal before shipping.`, order.id);
  return { orderNumber: order.id, status: 'needs_attention' };
}
