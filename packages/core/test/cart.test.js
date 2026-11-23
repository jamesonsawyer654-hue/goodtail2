import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { priceCart, CartError } from '../src/cart.js';

const catalog = JSON.parse(readFileSync(new URL('../../../catalog/products.json', import.meta.url)));

test('prices come from the catalog, not the browser', () => {
  const c = priceCart(catalog, [{ sku: 'GTC-BRUSH', qty: 2, price: 0.01 }]);
  assert.equal(c.lines[0].unitUsd, 19.99); assert.equal(c.totalUsd, 39.98); assert.equal(c.shippingUsd, 0);
});
test('duplicate lines are merged and bundles are sellable', () => {
  const c = priceCart(catalog, [{ sku: 'GTC-BRUSH', qty: 1 }, { sku: 'GTC-KIT', qty: 1 }, { sku: 'GTC-BRUSH', qty: 1 }]);
  assert.equal(c.lines.length, 2); assert.equal(c.totalUsd, 79.97);
});
test('rejects unknown SKUs, bad quantities, empty and oversized bags', () => {
  assert.throws(() => priceCart(catalog, [{ sku: 'NOPE', qty: 1 }]), CartError);
  for (const qty of [0, -1, 1.5, '2', null]) assert.throws(() => priceCart(catalog, [{ sku: 'GTC-BRUSH', qty }]), CartError);
  assert.throws(() => priceCart(catalog, []), CartError);
  assert.throws(() => priceCart(catalog, [{ sku: 'GTC-BRUSH', qty: 11 }]), /Max 10/);
});
test('inactive products cannot be bought', () => {
  const c2 = { ...catalog, products: catalog.products.map((p) => (p.sku === 'GTC-BRUSH' ? { ...p, active: false } : p)) };
  assert.throws(() => priceCart(c2, [{ sku: 'GTC-BRUSH', qty: 1 }]), CartError);
});
