// API routes. Kept separate from index.js because a Worker's entry module may only export handlers.
export const VERSION = '0.1.0';

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export async function handleApi(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/health' && request.method === 'GET') {
    return json({ ok: true, service: 'goodtail', version: VERSION,
      integrations: { paypal: Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET), cj: Boolean(env.CJ_API_KEY), database: Boolean(env.DB) } });
  }
  return json({ ok: false, error: 'Not found' }, 404);
}
