// D1 schema, migrations and order storage.
// Migrations are applied by the Worker itself (idempotent, tracked in schema_migrations),
// so a deploy never needs a manual database step.

export const MIGRATIONS = [
  { id: 1, name: 'orders, events, approvals, alerts, expenses', sql: `
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,                 -- public order number, e.g. GT-7KQ2M9XA
      status TEXT NOT NULL,
      paypal_order_id TEXT UNIQUE,
      paypal_capture_id TEXT,
      email TEXT, name TEXT, ship_json TEXT,
      items_json TEXT NOT NULL,
      subtotal_usd REAL NOT NULL, shipping_usd REAL NOT NULL, total_usd REAL NOT NULL,
      paid_usd REAL, refunded_usd REAL NOT NULL DEFAULT 0,
      supplier_order_id TEXT, supplier_cost_usd REAL,
      tracking_number TEXT, carrier TEXT,
      shipped_at TEXT, delivered_at TEXT, last_tracking_at TEXT,
      flags_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS orders_email ON orders(email);
    CREATE TABLE IF NOT EXISTS order_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL,
      from_status TEXT, to_status TEXT NOT NULL, reason TEXT, actor TEXT NOT NULL, at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS order_events_order ON order_events(order_id);
    CREATE TABLE IF NOT EXISTS approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, ref_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', reasons_json TEXT NOT NULL, payload_json TEXT,
      created_at TEXT NOT NULL, decided_at TEXT, decided_by TEXT
    );
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, level TEXT NOT NULL, message TEXT NOT NULL, ref_id TEXT,
      created_at TEXT NOT NULL, sent_at TEXT
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT, amount_usd REAL NOT NULL, category TEXT NOT NULL, note TEXT, at TEXT NOT NULL
    );` },
];

let migrated = false;
/** Applies pending migrations once per Worker instance. */
export async function migrate(db) {
  if (migrated) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS schema_migrations (id INTEGER PRIMARY KEY, name TEXT, applied_at TEXT)').run();
  const done = new Set(((await db.prepare('SELECT id FROM schema_migrations').all()).results || []).map((r) => r.id));
  for (const m of MIGRATIONS) {
    if (done.has(m.id)) continue;
    const stmts = m.sql.split(';').map((s) => s.trim()).filter(Boolean).map((s) => db.prepare(s));
    stmts.push(db.prepare('INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)').bind(m.id, m.name, new Date().toISOString()));
    await db.batch(stmts); // all-or-nothing per migration
  }
  migrated = true;
}
export const _resetMigrationFlag = () => { migrated = false; }; // tests only

const now = () => new Date().toISOString();
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // no 0/O/1/I/L confusion

export function newOrderNumber() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return 'GT-' + [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('');
}

export const rowToOrder = (r) => r && {
  id: r.id, status: r.status, paypalOrderId: r.paypal_order_id, paypalCaptureId: r.paypal_capture_id,
  email: r.email, name: r.name, shippingAddress: r.ship_json ? JSON.parse(r.ship_json) : null,
  items: JSON.parse(r.items_json), subtotalUsd: r.subtotal_usd, shippingUsd: r.shipping_usd, totalUsd: r.total_usd,
  paidUsd: r.paid_usd, refundedUsd: r.refunded_usd, trackingNumber: r.tracking_number, carrier: r.carrier,
  shippedAt: r.shipped_at, deliveredAt: r.delivered_at, flags: JSON.parse(r.flags_json || '[]'), createdAt: r.created_at,
};

export async function insertPendingOrder(db, { id, paypalOrderId, cart }) {
  const t = now();
  await db.prepare(`INSERT INTO orders (id, status, paypal_order_id, items_json, subtotal_usd, shipping_usd, total_usd, created_at, updated_at)
    VALUES (?, 'pending_payment', ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, paypalOrderId, JSON.stringify(cart.lines), cart.subtotalUsd, cart.shippingUsd, cart.totalUsd, t, t).run();
}

export async function getOrderByPaypalId(db, paypalOrderId) {
  return rowToOrder(await db.prepare('SELECT * FROM orders WHERE paypal_order_id = ?').bind(paypalOrderId).first());
}
export async function getOrder(db, id) {
  return rowToOrder(await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first());
}

/** Writes a status change and its audit event atomically. `fields` are extra columns to set. */
export async function saveTransition(db, before, after, fields = {}) {
  const ev = after.events[after.events.length - 1];
  const cols = Object.keys(fields);
  const set = ['status = ?', 'updated_at = ?', ...cols.map((c) => `${c} = ?`)].join(', ');
  await db.batch([
    db.prepare(`UPDATE orders SET ${set} WHERE id = ? AND status = ?`).bind(after.status, ev.at, ...cols.map((c) => fields[c]), before.id, before.status),
    db.prepare('INSERT INTO order_events (order_id, from_status, to_status, reason, actor, at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(before.id, ev.from, ev.to, ev.reason, ev.actor, ev.at),
  ]);
}

export async function addAlert(db, level, message, refId = null) {
  await db.prepare('INSERT INTO alerts (level, message, ref_id, created_at) VALUES (?, ?, ?, ?)').bind(level, message, refId, now()).run();
}
