// Order lifecycle. Every status change goes through transition(), so an order can
// never skip a step (e.g. "shipped" without the supplier having been paid).

export const STATUSES = Object.freeze([
  'pending_payment',  // cart created, customer at PayPal
  'paid',             // PayPal capture COMPLETED (verified server-side)
  'awaiting_approval',// held by a money rule; owner must approve in the dashboard
  'supplier_ordered', // CJ order created and paid from balance
  'shipped',          // tracking number received
  'delivered',
  'needs_attention',  // something failed; owner alerted
  'cancelled',
  'refunded',
]);

const NEXT = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['supplier_ordered', 'awaiting_approval', 'needs_attention', 'cancelled', 'refunded'],
  awaiting_approval: ['supplier_ordered', 'cancelled', 'refunded', 'needs_attention'],
  supplier_ordered: ['shipped', 'needs_attention', 'refunded'],
  shipped: ['delivered', 'needs_attention', 'refunded'],
  delivered: ['refunded', 'needs_attention'],
  needs_attention: ['supplier_ordered', 'awaiting_approval', 'shipped', 'delivered', 'cancelled', 'refunded'],
  cancelled: [],
  refunded: [],
};

export function canTransition(from, to) {
  return (NEXT[from] || []).includes(to);
}

/** Returns a new order object with the status changed and an audit event appended. Throws on an illegal move. */
export function transition(order, to, { reason = '', at = new Date().toISOString(), actor = 'system' } = {}) {
  if (!STATUSES.includes(to)) throw new Error(`Unknown status "${to}"`);
  if (!canTransition(order.status, to)) throw new Error(`Illegal transition ${order.status} -> ${to}`);
  return { ...order, status: to, events: [...(order.events || []), { from: order.status, to, reason, at, actor }] };
}
