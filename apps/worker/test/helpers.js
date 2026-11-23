// Test doubles: a D1-compatible wrapper over node:sqlite, and a PayPal sandbox stand-in
// that follows the documented Orders v2 request/response shapes.
import { DatabaseSync } from 'node:sqlite';

export function fakeD1() {
  const db = new DatabaseSync(':memory:');
  const stmt = (sql, params = []) => ({
    bind: (...p) => stmt(sql, p),
    run: async () => { const r = db.prepare(sql).run(...params); return { success: true, meta: { changes: Number(r.changes) } }; },
    first: async () => db.prepare(sql).get(...params) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...params) }),
    _exec: () => db.prepare(sql).run(...params),
  });
  return {
    prepare: (sql) => stmt(sql),
    batch: async (stmts) => {
      db.exec('BEGIN');
      try { const out = stmts.map((s) => s._exec()); db.exec('COMMIT'); return out; } catch (e) { db.exec('ROLLBACK'); throw e; }
    },
    raw: db,
  };
}

export function fakePaypal({ captureStatus = 'COMPLETED', captureAmount = null, alreadyCaptured = false } = {}) {
  const calls = [], orders = new Map();
  const respond = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
  const fetchImpl = async (url, init = {}) => {
    const u = new URL(url);
    calls.push({ host: u.host, path: u.pathname, method: init.method || 'GET', body: init.body, headers: init.headers || {} });
    if (u.pathname === '/v1/oauth2/token') return respond(200, { access_token: 'TEST_TOKEN', expires_in: 32400 });
    if (u.pathname === '/v2/checkout/orders' && init.method === 'POST') {
      const id = 'PPORDER' + String(orders.size + 1).padStart(6, '0');
      orders.set(id, JSON.parse(init.body));
      return respond(201, { id, status: 'CREATED' });
    }
    const m = u.pathname.match(/^\/v2\/checkout\/orders\/([^/]+)(\/capture)?$/);
    if (m && orders.has(m[1])) {
      if (m[2] && alreadyCaptured) return respond(422, { name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'ORDER_ALREADY_CAPTURED' }], debug_id: 'dbg' });
      const value = captureAmount ?? orders.get(m[1]).purchase_units[0].amount.value;
      return respond(m[2] ? 201 : 200, {
        id: m[1], status: 'COMPLETED',
        payer: { email_address: 'Buyer@Example.com', name: { given_name: 'Pat', surname: 'Lee' } },
        purchase_units: [{
          shipping: { name: { full_name: 'Pat Lee' }, address: { address_line_1: '1 Main St', admin_area_2: 'Austin', admin_area_1: 'TX', postal_code: '78701', country_code: 'US' } },
          payments: { captures: [{ id: 'CAP123', status: captureStatus, amount: { currency_code: 'USD', value } }] },
        }],
      });
    }
    return respond(404, { name: 'RESOURCE_NOT_FOUND' });
  };
  return { fetchImpl, calls, orders };
}
