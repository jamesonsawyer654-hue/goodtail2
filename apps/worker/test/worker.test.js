import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { handleApi } from '../src/api.js';

test('health reports which integrations are configured, without exposing secrets', async () => {
  const res = await handleApi(new Request('https://x/api/health'), { PAYPAL_CLIENT_ID: 'id', PAYPAL_CLIENT_SECRET: 's3cret' });
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.deepEqual(body.integrations, { paypal: true, cj: false, database: false });
  assert.ok(!JSON.stringify(body).includes('s3cret'));
});
test('unknown API routes return 404 JSON', async () => {
  const res = await handleApi(new Request('https://x/api/nope'), {});
  assert.equal(res.status, 404);
});
test('non-API requests are served from static assets', async () => {
  const env = { ASSETS: { fetch: async () => new Response('page') } };
  const res = await worker.fetch(new Request('https://x/products/brush.html'), env);
  assert.equal(await res.text(), 'page');
});
test('entry module exports only the default handler (Workers runtime requirement)', async () => {
  const mod = await import('../src/index.js');
  assert.deepEqual(Object.keys(mod), ['default']);
});
