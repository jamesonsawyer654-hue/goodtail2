// Server-side cart pricing. The browser only sends SKUs and quantities;
// prices always come from the catalog here, so a shopper can't change what they pay.

export const LIMITS = Object.freeze({ maxLines: 20, maxQty: 10 });
const round2 = (n) => Math.round(n * 100) / 100;

export class CartError extends Error {}

/** All sellable items (products + bundles), keyed by SKU. */
export function indexCatalog(catalog) {
  const idx = new Map();
  for (const p of [...catalog.products, ...(catalog.bundles || [])]) if (p.active) idx.set(p.sku, p);
  return idx;
}

/**
 * @param {object} catalog  parsed catalog/products.json
 * @param {{sku:string, qty:number}[]} items
 * @returns {{ lines: {sku,name,qty,unitUsd,lineUsd}[], subtotalUsd, shippingUsd, totalUsd }}
 */
export function priceCart(catalog, items) {
  if (!Array.isArray(items) || items.length === 0) throw new CartError('Your bag is empty');
  if (items.length > LIMITS.maxLines) throw new CartError('Too many different items');
  const idx = indexCatalog(catalog);
  const merged = new Map();
  for (const it of items) {
    const qty = it && it.qty;
    if (!it || typeof it.sku !== 'string' || !idx.has(it.sku)) throw new CartError('An item in your bag is no longer available');
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1) throw new CartError('Invalid quantity');
    merged.set(it.sku, (merged.get(it.sku) || 0) + qty);
  }
  const lines = [...merged].map(([sku, qty]) => {
    if (qty > LIMITS.maxQty) throw new CartError(`Max ${LIMITS.maxQty} of one item per order`);
    const p = idx.get(sku);
    return { sku, name: p.name, qty, unitUsd: p.price, lineUsd: round2(p.price * qty) };
  });
  const subtotalUsd = round2(lines.reduce((a, l) => a + l.lineUsd, 0));
  const shippingUsd = 0; // free US shipping on every order
  return { lines, subtotalUsd, shippingUsd, totalUsd: round2(subtotalUsd + shippingUsd) };
}
