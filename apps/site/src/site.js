// Storefront behaviour: menu, videos, bag (localStorage), checkout via PayPal, order tracking.
// Prices shown here are display-only; the server re-prices every order from the catalog.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const money = (n) => '$' + n.toFixed(2);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---- menu + videos ----
  const h = $('.header'), mb = $('.menu-btn');
  mb && mb.addEventListener('click', () => { const o = h.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: 0.35 });
    $$('video[muted]').forEach((v) => io.observe(v));
  }

  // ---- bag ----
  const KEY = 'gt_bag_v1';
  const read = () => { try { const b = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(b) ? b.filter((i) => i && typeof i.sku === 'string' && Number.isInteger(i.qty) && i.qty > 0) : []; } catch { return []; } };
  const write = (b) => { try { localStorage.setItem(KEY, JSON.stringify(b)); } catch {} renderCount(); };
  const count = () => read().reduce((a, i) => a + i.qty, 0);
  function renderCount() { $$('[data-bag-count]').forEach((el) => { el.textContent = count(); }); }
  function add(sku, qty = 1) {
    const b = read(); const line = b.find((i) => i.sku === sku);
    if (line) line.qty = Math.min(10, line.qty + qty); else b.push({ sku, qty });
    write(b);
  }
  renderCount();

  let toastTimer;
  function toast(html) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.innerHTML = html; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
  }
  $$('[data-add]').forEach((btn) => btn.addEventListener('click', () => {
    add(btn.dataset.add);
    const label = btn.textContent; btn.textContent = 'Added ✓'; setTimeout(() => { btn.textContent = label; }, 1500);
    toast('Added to your bag · <a href="/cart">View bag</a>');
  }));

  // ---- cart page ----
  const cartRoot = $('#cart');
  if (cartRoot) {
    const catalog = JSON.parse($('#catalog-data').textContent);
    const msg = $('#checkout-msg');
    const render = () => {
      const b = read().filter((i) => catalog[i.sku]);
      if (b.length !== read().length) write(b);
      if (!b.length) { cartRoot.classList.add('empty'); $('#bag-lines').innerHTML = '<p class="empty-msg">Your bag is empty.</p><a class="btn" href="/#shop">Shop bestsellers</a>'; }
      else {
        cartRoot.classList.remove('empty');
        $('#bag-lines').innerHTML = b.map((i) => { const p = catalog[i.sku]; return `
          <div class="line"><a href="${p.url}"><img src="${p.image}" alt=""></a>
            <div class="li-main"><a href="${p.url}" class="li-name">${esc(p.name)}</a><div class="li-price">${money(p.price)}</div>
              <div class="qty"><button data-dec="${i.sku}" aria-label="One less">−</button><span>${i.qty}</span><button data-inc="${i.sku}" aria-label="One more">+</button>
              <button class="li-remove" data-rm="${i.sku}">Remove</button></div></div>
            <div class="li-total">${money(p.price * i.qty)}</div></div>`; }).join('');
      }
      const sub = b.reduce((a, i) => a + catalog[i.sku].price * i.qty, 0);
      $('#bag-sub').textContent = money(sub); $('#bag-total').textContent = money(sub);
    };
    cartRoot.addEventListener('click', (e) => {
      const t = e.target.closest('button'); if (!t) return;
      const b = read();
      const sku = t.dataset.inc || t.dataset.dec || t.dataset.rm; const line = b.find((i) => i.sku === sku); if (!line) return;
      if (t.dataset.inc) line.qty = Math.min(10, line.qty + 1);
      if (t.dataset.dec) line.qty -= 1;
      write(t.dataset.rm ? b.filter((i) => i.sku !== sku) : b.filter((i) => i.qty > 0)); render();
    });
    render();

    const post = (url, body) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
      .then(async (r) => { const d = await r.json().catch(() => ({})); if (!r.ok || !d.ok) throw new Error(d.error || 'Something went wrong'); return d; });

    fetch('/api/config').then((r) => r.json()).then((cfg) => {
      if (!cfg.checkoutEnabled) { msg.textContent = 'Checkout is opening soon. Your bag will be saved on this device.'; return; }
      const s = document.createElement('script');
      s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cfg.paypalClientId)}&currency=USD&intent=capture&enable-funding=venmo`;
      s.onload = () => {
        msg.textContent = cfg.paypalMode === 'sandbox' ? 'Test mode: no real money is charged.' : 'Secure checkout with PayPal, Venmo or card.';
        window.paypal.Buttons({
          style: { layout: 'vertical', shape: 'rect', color: 'black', label: 'checkout' },
          onClick: (_, actions) => (read().length ? actions.resolve() : actions.reject()),
          createOrder: () => post('/api/checkout/create', { items: read().map(({ sku, qty }) => ({ sku, qty })) }).then((d) => d.id),
          onApprove: (data) => post('/api/checkout/capture', { orderID: data.orderID }).then((d) => {
            write([]); location.href = `/thanks?order=${encodeURIComponent(d.orderNumber)}&status=${encodeURIComponent(d.status)}`;
          }),
          onError: (err) => { msg.textContent = (err && err.message) || 'Payment could not be completed. Please try again.'; },
        }).render('#paypal-buttons');
      };
      s.onerror = () => { msg.textContent = 'PayPal could not load. Check your connection and refresh.'; };
      document.head.appendChild(s);
    }).catch(() => { msg.textContent = 'Checkout is unavailable right now. Please try again shortly.'; });
  }

  // ---- thanks page ----
  const thanks = $('#order-ref');
  if (thanks) {
    const q = new URLSearchParams(location.search);
    const n = q.get('order');
    if (n && /^GT-[A-Z0-9]{8}$/.test(n)) thanks.innerHTML = `Your order number is <b>${n}</b>. Keep it to <a class="link" href="/track">track your order</a>.`;
    if (q.get('status') === 'pending_payment') thanks.innerHTML += ' PayPal is still confirming your payment; we’ll ship as soon as it clears.';
  }

  // ---- track page ----
  const tf = $('#track-form');
  if (tf) {
    const out = $('#track-result');
    const LABEL = { pending_payment: 'Waiting for payment', paid: 'Paid, preparing to ship', awaiting_approval: 'Being checked by our team', supplier_ordered: 'Being packed',
      shipped: 'Shipped', delivered: 'Delivered', needs_attention: 'Being checked by our team', cancelled: 'Cancelled', refunded: 'Refunded' };
    tf.addEventListener('submit', async (e) => {
      e.preventDefault(); out.textContent = 'Looking up your order…';
      const p = new URLSearchParams({ number: tf.number.value.trim(), email: tf.email.value.trim() });
      try {
        const r = await fetch('/api/orders/track?' + p); const d = await r.json();
        if (!d.ok) { out.textContent = d.error; return; }
        const o = d.order;
        out.innerHTML = `<h2>${esc(LABEL[o.status] || o.status)}</h2><p>Order <b>${esc(o.number)}</b> · placed ${new Date(o.placedAt).toLocaleDateString()}</p>
          <ul>${o.items.map((i) => `<li>${i.qty} × ${esc(i.name)}</li>`).join('')}</ul>
          ${o.trackingNumber ? `<p>Tracking: <b>${esc(o.trackingNumber)}</b>${o.carrier ? ' (' + esc(o.carrier) + ')' : ''} · <a class="link" href="https://t.17track.net/en#nums=${encodeURIComponent(o.trackingNumber)}" target="_blank" rel="noopener">Follow the package</a></p>` : '<p>We’ll email your tracking number as soon as it ships (usually 1–3 business days).</p>'}`;
      } catch { out.textContent = 'Lookup failed. Please try again.'; }
    });
  }
})();
