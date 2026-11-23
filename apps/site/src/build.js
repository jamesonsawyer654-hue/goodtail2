// Static site generator for Good Tail Co. — reads ../config.js, writes the deployable site to OUT.
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.resolve(__dirname, '..'), OUT = process.argv[2] || '/home/user/good-tail-site';
const URL0 = process.env.SITE_URL || 'https://goodtail.jamesonsawyer654.workers.dev';
// Clean URLs: Cloudflare serves /products/brush.html at /products/brush, so links use the clean form.
const pretty = (f) => '/' + f.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '');
const prettyLinks = (html) => html.replace(/href="(?!https?:|mailto:|#|data:)([^"#?]*?)\.html(#[^"]*)?"/g, (_, f, h = '') => {
  const clean = pretty(f.replace(/^\/+/, '') + '.html').replace(/(.)\/$/, '$1');
  return `href="${clean}${h}"`;
});
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(`${SRC}/config.js`, 'utf8'), ctx);
const S = ctx.window.STORE, P = ctx.window.PRODUCTS, K = ctx.window.BUNDLE;
const money = n => '$' + n.toFixed(2);
const live = l => l && l !== '#';
const KIT_IDS = ['brush', 'roller', 'lickmat'];
const kitValue = KIT_IDS.reduce((a, id) => a + P.find(p => p.id === id).price, 0);
const save = money(kitValue - K.price);

// Long-form product copy (honest, matches config claims)
const X = {
  brush: { badge: 'Bestseller pick', cat: 'Grooming', extra: 'groom',
    about: ['Fine bent bristles reach through the topcoat to the loose undercoat that ends up on your floor, clothes and couch.', 'When the brush fills up, press the button: the bristles pull back and the fur slides off in one piece. No picking hair out of pins.'],
    how: ['Brush in the direction the hair grows, using short, gentle strokes.', 'When fur builds up, press the button and wipe the fur off.', 'Release the button and keep going. In shedding season, 5 minutes 2–3 times a week makes a big difference.'],
    box: ['1 self-cleaning slicker brush'], care: 'Rinse the bristles under warm water and let the brush dry before storing.', good: 'Dogs and cats with short or long coats.',
    why: 'Brushing is the single best way to cut down on shedding, but cleaning fur out of a normal slicker brush is the part nobody likes. One button fixes that, so the habit is easier to keep.' },
  roller: { badge: 'Reusable', cat: 'Home', extra: 'roller-wide',
    about: ['Roll it back and forth over fabric and the brush roller lifts pet hair into the built-in chamber.', 'When it’s full, open the chamber and empty it into the trash. No sticky sheets to buy, peel or throw away.'],
    how: ['Roll back and forth with short strokes over the fabric.', 'Hair collects in the chamber as you go.', 'Open the chamber, empty it, close it. Ready for next time.'],
    box: ['1 reusable pet hair remover'], care: 'Wipe the chamber clean now and then. Works best on upholstery, bedding and car seats; test delicate fabrics first.', good: 'Couches, beds, rugs and car seats with dog or cat hair.',
    why: 'Sticky lint sheets work until they run out, and then you’re buying more. We wanted something you buy once that still gets fur off a couch in seconds.' },
  bottle: { badge: 'Walk essential', cat: 'Walks', extra: null,
    about: ['A water bottle with a fold-out drinking trough, so you don’t need to carry a separate bowl.', 'Press to fill the trough, let your dog drink, then tip the leftover water back into the bottle. The lock button keeps it from leaking in your bag.'],
    how: ['Fill the bottle and close it.', 'Unlock, flip out the trough and press the button to fill it.', 'Tip the trough to pour unused water back, fold it away and lock.'],
    box: ['1 dog water bottle with fold-out bowl and wrist strap'], care: 'Rinse after use and let it air-dry. Empty it before storing.', good: 'Walks, hikes, road trips and park days.',
    why: 'Carrying a bottle and a bowl on every walk is a hassle. This puts both in one hand and pours unused water back, so nothing gets wasted.' },
  lickmat: { badge: '2-pack', cat: 'Bath & Calm', extra: 'kit',
    about: ['A textured silicone mat you spread with a soft treat. Licking keeps your pet busy during baths, nail trims and grooming.', 'The suction back sticks to tile, tubs and walls, so the mat stays put while you work.'],
    how: ['Spread a thin layer of xylitol-free peanut butter, plain yogurt or wet food.', 'Stick the mat to a clean, smooth surface like the tub wall.', 'Supervise your pet, then rinse or wash the mat after use.'],
    box: ['2 silicone lick mats'], care: 'Always supervise. Remove the mat if your pet starts chewing pieces off. Never use spreads that contain xylitol, which is toxic to dogs.', good: 'Dogs and cats, bath time, nail trims, busy moments.',
    why: 'Baths and nail trims go better when your pet has something else to focus on. A lick mat and a spoon of a safe spread buys you a calm few minutes.' },
};
const KIT_WHY = 'Shedding season hits the whole house: the dog, the couch and bath time. The kit covers all three for less than buying them separately.';

const pawMark = `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor"><ellipse cx="50" cy="66" rx="22" ry="18"/><ellipse cx="24" cy="44" rx="9" ry="12" transform="rotate(-20 24 44)"/><ellipse cx="40" cy="28" rx="9" ry="12" transform="rotate(-6 40 28)"/><ellipse cx="60" cy="28" rx="9" ry="12" transform="rotate(6 60 28)"/><ellipse cx="76" cy="44" rx="9" ry="12" transform="rotate(20 76 44)"/></g></svg>`;
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#111"/><g fill="#fff" transform="translate(16 14) scale(.68)"><ellipse cx="50" cy="66" rx="22" ry="18"/><ellipse cx="24" cy="44" rx="9" ry="12" transform="rotate(-20 24 44)"/><ellipse cx="40" cy="28" rx="9" ry="12" transform="rotate(-6 40 28)"/><ellipse cx="60" cy="28" rx="9" ry="12" transform="rotate(6 60 28)"/><ellipse cx="76" cy="44" rx="9" ry="12" transform="rotate(20 76 44)"/></g></svg>`;
const buy = (link, label = 'Buy now', cls = '') => live(link) ? `<a class="btn ${cls}" href="${link}">${label}</a>` : `<button class="btn ${cls}" disabled>Coming soon</button>`;

function page({ file, title, desc, body, active = '', og = 'images/og/home.jpg', jsonld = '', bodyClass = '', root }) {
  const r = root ?? '/';
  const canon = `${URL0}${pretty(file)}`;
  const nav = [['index.html#shop', 'Bestsellers', 'shop'], ['products/brush.html', 'Grooming', 'brush'], ['products/roller.html', 'Home', 'roller'], ['products/bottle.html', 'Walks', 'bottle'], ['products/lickmat.html', 'Bath & Calm', 'lickmat'], ['products/kit.html', 'The Kit', 'kit']]
    .map(([h, t, k]) => `<a href="${r}${h}"${active === k ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${canon}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${S.name}">
<meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">
<meta property="og:url" content="${canon}"><meta property="og:image" content="${URL0}/${og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="${r}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}style.css">
${jsonld ? `<script type="application/ld+json">${jsonld}</script>` : ''}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="sr" href="#main">Skip to content</a>
<div class="promo">Free US shipping on every order · ${S.returnDays}-day returns<a href="${r}index.html#shop">Shop now</a></div>
<header class="header"><div class="wrap">
  <a class="logo" href="${r}index.html">${pawMark}${S.name}</a>
  <nav class="nav" aria-label="Main">${nav}</nav>
  <div class="hdr-right"><a class="hide-md" href="${r}shipping.html">Shipping</a><a href="${r}contact.html">Help</a></div>
  <button class="menu-btn" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
</div></header>
<main id="main">
${body.replace(/\{r\}/g, r)}
</main>
<footer><div class="wrap">
  <div class="cols">
    <div><a class="logo" href="${r}index.html">${pawMark}${S.name}</a><p class="blurb">${S.tagline} Simple tools for shedding, pet hair, walks and bath time.</p>
      <div class="pay" aria-label="Payment methods"><span>PayPal</span><span>Venmo</span><span>Visa</span><span>Mastercard</span><span>Amex</span></div></div>
    <div><h4>Shop</h4><ul>${P.map(p => `<li><a href="${r}products/${p.id}.html">${p.name.replace(' (2-Pack)', '')}</a></li>`).join('')}<li><a href="${r}products/kit.html">The Shed-Free Home Kit</a></li></ul></div>
    <div><h4>Help</h4><ul><li><a href="${r}shipping.html">Shipping &amp; delivery</a></li><li><a href="${r}returns.html">Returns &amp; refunds</a></li><li><a href="${r}index.html#faq">FAQ</a></li><li><a href="${r}contact.html">Contact us</a></li></ul></div>
    <div><h4>About</h4><ul><li><a href="${r}about.html">Our story</a></li><li><a href="${r}privacy.html">Privacy</a></li><li><a href="${r}terms.html">Terms</a></li><li><a href="mailto:${S.email}">Email us</a></li></ul></div>
  </div>
  <div class="fine"><span>© ${new Date().getFullYear()} ${S.name}</span><span>Secure checkout with PayPal · Ships to the US</span></div>
</div></footer>
<script src="${r}site.js" defer></script>
</body></html>`;
  fs.mkdirSync(path.dirname(`${OUT}/${file}`), { recursive: true });
  fs.writeFileSync(`${OUT}/${file}`, prettyLinks(html));
}

const pcard = p => `<a class="pcard" href="{r}products/${p.id}.html"><div class="ph"><img src="{r}images/l/${p.id}.jpg" alt="${p.name}" loading="lazy" width="960" height="1200"><span class="badge">${X[p.id].badge}</span></div>
  <h3>${p.name}</h3><div class="pr">${money(p.price)}</div><div class="sub">Free US shipping</div></a>`;
const kitcard = `<a class="pcard" href="{r}products/kit.html"><div class="ph"><img src="{r}images/l/kit.jpg" alt="${K.name}" loading="lazy" width="960" height="1200"><span class="badge">Save ${save}</span></div>
  <h3>${K.name}</h3><div class="pr">${money(K.price)}<s>${money(kitValue)}</s></div><div class="sub">Brush + hair remover + lick mats</div></a>`;

const faqs = [
  ['How long does shipping take?', `Orders ship within 1–3 business days and usually arrive in ${S.shippingTime}. You’ll get a tracking number by email as soon as your order ships.`],
  ['Is shipping really free?', 'Yes. Every order ships free within the United States, with no minimum.'],
  ['Do you ship outside the US?', 'Not yet. We currently ship to US addresses only.'],
  ['How do I pay?', 'Checkout runs on PayPal: pay with your PayPal account, Venmo or a debit/credit card. Your card details never touch our servers.'],
  ['What if it doesn’t work for my pet?', `Contact us within ${S.returnDays} days of delivery. Damaged, wrong or lost items get a free replacement or a full refund. See our <a class="link" href="{r}returns.html">returns policy</a>.`],
  ['Can I change or cancel my order?', 'Yes, any time before it ships. Email us as soon as possible and we’ll fix the address or refund you in full.'],
  ['How do I reach you?', `Email <a class="link" href="mailto:${S.email}">${S.email}</a>. A real person replies within 24 hours, usually much sooner.`],
];
const faqHtml = `<div class="acc faq">${faqs.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
const values = `<div class="values"><div><b>Free US shipping</b><span>On every order, tracked</span></div><div><b>${S.returnDays}-day returns</b><span>Not right? We’ll make it right</span></div><div><b>Secure checkout</b><span>PayPal, Venmo or card</span></div><div><b>Real human support</b><span>Replies within 24 hours</span></div></div>`;

// ---------- HOME ----------
page({ file: 'index.html', active: 'shop', title: `${S.name} — Simple tools for shedding, pet hair and bath time`,
  desc: 'Simple, useful pet products for shedding, pet hair, walks and bath time. Free US shipping and 30-day returns.',
  jsonld: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: S.name, url: URL0, logo: `${URL0}/favicon.svg`, email: S.email }),
  body: `
<section class="hero">
  <picture><source media="(max-width: 700px)" srcset="{r}images/l/hero-m.jpg"><img src="{r}images/l/hero.jpg" alt="A corgi being brushed" width="2400" height="1200"></picture>
  <div class="over"><div class="wrap"><h1>Less fur.<br>More cuddles.</h1><p>Simple tools for shedding, pet hair and bath time. Free US shipping on every order.</p>
    <div class="ctas"><a class="btn white" href="#shop">Shop bestsellers</a><a class="btn white" href="{r}products/kit.html" style="background:transparent;color:#fff">Shop the kit</a></div></div></div>
</section>
<div class="wrap">${values}</div>

<section class="sec"><div class="wrap statement">
  <p class="label">Shedding season</p><h2>Brush less often. Clean the brush in one click.</h2>
  <p>Pull out the loose undercoat, press the button to drop the fur, and keep the couch clean between brushings.</p>
  <div class="ctas"><a class="btn" href="{r}products/brush.html">Shop the brush</a><a class="btn outline" href="{r}products/roller.html">Shop the hair remover</a></div>
</div></section>

<section class="sec" id="shop" style="padding-top:0"><div class="wrap">
  <div class="sec-top"><div><h2>Bestsellers</h2><p>Four tools, four everyday problems solved.</p></div><a class="link" href="{r}products/kit.html">Save ${save} with the kit</a></div>
  <div class="row">${P.map(pcard).join('')}</div>
</div></section>

<section class="sec" style="padding-top:0"><div class="wrap">
  <div class="sec-top"><div><h2>Shop by need</h2></div></div>
  <div class="tiles">
    <a class="tile" href="{r}products/brush.html"><img src="{r}images/l/groom.jpg" alt="" loading="lazy"><span>Shedding</span></a>
    <a class="tile" href="{r}products/roller.html"><img src="{r}images/l/roller.jpg" alt="" loading="lazy"><span>Pet hair</span></a>
    <a class="tile" href="{r}products/bottle.html"><img src="{r}images/l/bottle.jpg" alt="" loading="lazy"><span>Walks</span></a>
    <a class="tile" href="{r}products/lickmat.html"><img src="{r}images/l/lickmat.jpg" alt="" loading="lazy"><span>Bath time</span></a>
  </div>
</div></section>

<section class="feature">
  <div class="txt"><p class="label">See it in action</p><h2>Made for real pet life.</h2><p>Quick to use, easy to clean, built for the messy parts of living with a pet.</p><div class="ctas"><a class="btn" href="#shop">Shop all</a></div></div>
  <div class="media"><video src="{r}v/bottle.mp4" poster="{r}v/bottle.jpg" muted loop playsinline preload="none" aria-label="Product video"></video></div>
</section>
<section class="feature rev" style="background:#fff">
  <div class="txt"><p class="label">Best value · save ${save}</p><h2>${K.name}</h2><p>The self-cleaning brush, the reusable hair remover and a lick mat 2-pack. Everything for shedding season, in one box, for ${money(K.price)}.</p><div class="ctas"><a class="btn" href="{r}products/kit.html">Shop the kit</a></div></div>
  <div class="media"><img src="{r}images/l/kit.jpg" alt="Dog sitting in a bathtub" loading="lazy"></div>
</section>

<section class="sec"><div class="wrap"><div class="cards2">
  <a class="ecard" href="{r}products/roller.html"><img src="{r}images/l/roller-wide.jpg" alt="Golden retriever on a sofa" loading="lazy"><h3>Your couch, minus the fur</h3><p>Roll, empty, reuse. No batteries and no sticky sheets to keep buying.</p><span class="link">Shop the hair remover</span></a>
  <a class="ecard" href="{r}about.html"><img src="{r}images/l/groom-wide.jpg" alt="Brushing a fluffy dog" loading="lazy"><h3>Our promise</h3><p>Free tracked shipping, ${S.returnDays}-day returns and a real person on every email. No fake reviews, no fake “original” prices.</p><span class="link">How we work</span></a>
</div></div></section>

<section class="sec" id="faq" style="padding-top:0"><div class="wrap"><div class="sec-top" style="justify-content:center;text-align:center"><div><h2>Questions, answered</h2></div></div>${faqHtml}</div></section>
<div class="brandtext"><p>New to ${S.name}? We make a small set of simple tools for the messy parts of pet life. Start with the one-click brush.</p><a class="btn outline" href="{r}products/brush.html">Start here</a></div>
` });

// ---------- PRODUCT PAGES ----------
function pdp(p, isKit = false) {
  const id = isKit ? 'kit' : p.id, x = isKit ? null : X[id];
  const name = isKit ? K.name : p.name, price = isKit ? K.price : p.price, link = isKit ? K.buyLink : p.buyLink;
  const tiles = isKit
    ? [`<div><img src="{r}images/l/kit.jpg" alt="${name}" width="960" height="1200"></div>`, ...KIT_IDS.map(i => `<div><img src="{r}images/l/${i}.jpg" alt="" loading="lazy"></div>`)]
    : [`<div><img src="{r}images/l/${id}.jpg" alt="${name}" width="960" height="1200"></div>`,
       `<div><video src="{r}v/${id}.mp4" poster="{r}v/${id}.jpg" muted loop playsinline autoplay preload="metadata" aria-label="${name} video"></video></div>`,
       `<div class="how"><img src="{r}images/how/${id}.svg" alt="Illustration of the ${name}" loading="lazy"></div>`,
       ...(x.extra ? [`<div><img src="{r}images/l/${x.extra}.jpg" alt="" loading="lazy"></div>`] : [])];
  const pts = isKit ? ['One-Click Self-Cleaning Brush', 'Reusable Pet Hair Remover', 'Calm-Down Lick Mat (2-Pack)'] : p.bullets;
  const acc = isKit
    ? `<details open><summary>What’s in the kit</summary><ul>${KIT_IDS.map(i => { const q = P.find(z => z.id === i); return `<li><a class="link" href="{r}products/${i}.html">${q.name}</a>: ${q.short}</li>`; }).join('')}</ul></details>`
    : `<details open><summary>Details</summary>${x.about.map(t => `<p>${t}</p>`).join('')}<p><b>Great for:</b> ${x.good}</p></details>
       <details><summary>How to use</summary><ol>${x.how.map(t => `<li>${t}</li>`).join('')}</ol></details>
       <details><summary>In the box &amp; care</summary><ul>${x.box.map(t => `<li>${t}</li>`).join('')}</ul><p>${x.care}</p></details>`;
  const ld = { '@context': 'https://schema.org', '@type': 'Product', name, image: [`${URL0}/images/l/${id}.jpg`], description: isKit ? K.includes : p.short,
    brand: { '@type': 'Brand', name: S.name }, sku: `GTC-${id.toUpperCase()}`,
    offers: { '@type': 'Offer', price: price.toFixed(2), priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: `${URL0}/products/${id}`,
      shippingDetails: { '@type': 'OfferShippingDetails', shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' }, shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' } } } };
  const others = P.filter(q => q.id !== id);
  page({ file: `products/${id}.html`, active: id, bodyClass: 'pdp-page', og: `images/og/${id}.jpg`, title: `${name} — ${S.name}`,
    desc: `${isKit ? K.includes : p.short} Free US shipping, ${S.returnDays}-day returns.`, jsonld: JSON.stringify(ld), body: `
<div class="wrap crumbs"><a href="{r}index.html">Home</a> / <a href="{r}index.html#shop">${isKit ? 'Bundles' : x.cat}</a> / ${name}</div>
<div class="wrap pdp">
  <div class="pgrid">${tiles.join('')}</div>
  <div class="panel">
    <p class="label">${isKit ? 'Best value bundle' : x.badge}</p>
    <h1>${name}</h1>
    <div class="price">${money(price)}${isKit ? `<s>${money(kitValue)}</s><span class="save">Save ${save}</span>` : ''}</div>
    <p class="desc">${isKit ? 'Everything for shedding season and calm bath time, in one box.' : p.short}</p>
    <ul class="pts">${pts.map(b => `<li>${b}</li>`).join('')}</ul>
    ${buy(link, `Buy now · ${money(price)}`, 'block')}
    <p class="note">Pay with PayPal, Venmo or card · choose quantity at checkout</p>
    <div class="svc"><div><span>🚚</span><span><b>Free US shipping.</b> Ships in 1–3 business days, arrives in ${S.shippingTime} with tracking.</span></div>
      <div><span>↩️</span><span><b>${S.returnDays}-day returns.</b> Damaged, wrong or lost? Free replacement or full refund.</span></div>
      <div><span>💬</span><span><b>Real human support.</b> <a class="link" href="mailto:${S.email}">Email us</a>, we reply within 24 hours.</span></div></div>
    ${isKit ? '' : `<a class="kitlink" href="{r}products/kit.html"><img src="{r}images/l/kit.jpg" alt=""><span><small>Save ${save}</small><b>${K.name}</b><span style="color:var(--muted);font-size:14px">Brush + hair remover + lick mats · ${money(K.price)}</span></span></a>`}
    <div class="acc">${acc}<details><summary>Shipping &amp; returns</summary><p>Free shipping to US addresses. Orders ship within 1–3 business days and usually arrive in ${S.shippingTime}. Read the full <a class="link" href="{r}shipping.html">shipping</a> and <a class="link" href="{r}returns.html">returns</a> policies.</p></details></div>
  </div>
</div>
<section class="why"><div class="wrap"><h2>Why we made this</h2><p>${isKit ? KIT_WHY : x.why}</p></div></section>
<section class="sec"><div class="wrap"><div class="sec-top"><div><h2>You may also like</h2></div></div>
  <div class="row">${(isKit ? P : others).slice(0, 4).map(pcard).join('')}${isKit ? '' : (others.length < 4 ? kitcard : '')}</div></div></section>
<div class="sticky-buy"><div><b>${money(price)}</b><div style="font-size:12px;color:var(--muted)">Free US shipping</div></div>${buy(link, 'Buy now')}</div>
` });
}
P.forEach(p => pdp(p)); pdp(null, true);

// ---------- ABOUT ----------
page({ file: 'about.html', title: `Our story — ${S.name}`, desc: `${S.name} is a small online shop for simple, useful pet products.`, body: `
<div class="pagehead"><div class="wrap"><p class="label">Our story</p><h1>Small upgrades for happier pets.</h1></div></div>
<div class="prose">
<p>${S.name} is a small online shop with one idea: find simple, useful products that fix the everyday annoyances of living with a pet, and skip the rest.</p>
<h2>What we sell</h2><p>Our line-up is small on purpose. Each product fixes one specific problem: fur that comes off in clumps, hair stuck to the couch, stressful bath time and thirsty dogs on walks.</p>
<h2>How we work</h2><ul><li><b>Free US shipping</b> on every order, with tracking.</li><li><b>${S.returnDays}-day guarantee.</b> If something arrives damaged, wrong or not at all, we replace it or refund you.</li><li><b>Real support.</b> Every email is answered by a person, usually within a few hours.</li><li><b>Honest descriptions.</b> No fake reviews, no fake countdown timers, no made-up “original” prices.</li></ul>
<h2>Get in touch</h2><p>Questions, ideas or feedback? Email <a class="link" href="mailto:${S.email}">${S.email}</a>.</p>
<p style="margin-top:34px"><a class="btn" href="{r}index.html#shop">Shop bestsellers</a></p>
</div>` });

// ---------- POLICIES (reuse existing policy text) ----------
const fill = h => h.replace(/<span data-addr>[\s\S]*?<\/span><\/span>/g, S.businessAddress ? ` · ${S.businessAddress}` : '')
  .replace(/<div data-addr>[\s\S]*?<\/div>/g, S.businessAddress ? `<h2>Mailing address</h2><p>${S.businessAddress}</p>` : '')
  .replace(/<a data-s="email"><\/a>/g, `<a class="link" href="mailto:${S.email}">${S.email}</a>`)
  .replace(/<span data-s="(\w+)"><\/span>/g, (_, k) => S[k] ?? '');
for (const [f, t] of [['shipping', 'Shipping & delivery'], ['returns', 'Returns & refunds'], ['privacy', 'Privacy policy'], ['terms', 'Terms of service'], ['contact', 'Contact us']]) {
  const src = fs.readFileSync(`${SRC}/${f}.html`, 'utf8');
  let inner = src.slice(src.indexOf('<main class="policy">') + 21, src.indexOf('</main>'));
  inner = fill(inner).replace(/<h1>[\s\S]*?<\/h1>/, '');
  page({ file: `${f}.html`, title: `${t} — ${S.name}`, desc: `${t} for ${S.name}.`, body: `<div class="pagehead"><div class="wrap"><p class="label">Help</p><h1>${t}</h1></div></div><div class="prose">${inner}</div>` });
}

// ---------- THANKS + 404 ----------
page({ file: 'thanks.html', title: `Thank you — ${S.name}`, desc: 'Order confirmed.', body: `
<div class="pagehead"><div class="wrap"><p class="label">Order confirmed</p><h1>Thank you.</h1></div></div>
<div class="prose" style="text-align:center"><p>Your receipt is on its way to your inbox. Your order ships within 1–3 business days, and we’ll email your tracking number as soon as it does.</p>
<p>Usual delivery time: <b>${S.shippingTime}</b>. Questions? Email <a class="link" href="mailto:${S.email}">${S.email}</a>.</p>
<p style="margin-top:30px"><a class="btn" href="{r}index.html">Continue shopping</a></p></div>` });
page({ file: '404.html', root: '/', title: `Page not found — ${S.name}`, desc: 'Page not found.', body: `
<div class="pagehead"><div class="wrap"><p class="label">404</p><h1>This page went for a walk.</h1></div></div>
<div class="prose" style="text-align:center"><p>We couldn’t find that page.</p><p style="margin-top:24px"><a class="btn" href="/index.html">Go to the shop</a></p></div>` });

// ---------- assets ----------
fs.copyFileSync(`${__dirname}/style.css`, `${OUT}/style.css`);
fs.writeFileSync(`${OUT}/site.js`, `(() => {
  const h = document.querySelector('.header'), b = document.querySelector('.menu-btn');
  b && b.addEventListener('click', () => { const o = h.classList.toggle('open'); b.setAttribute('aria-expanded', o); });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { v.play().catch(() => {}); } else { v.pause(); } }), { threshold: .35 });
    document.querySelectorAll('video[muted]').forEach(v => io.observe(v));
  }
})();\n`);
fs.writeFileSync(`${OUT}/favicon.svg`, favicon);
fs.writeFileSync(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${URL0}/sitemap.xml\n`);
const urls = ['', 'about.html', 'shipping.html', 'returns.html', 'contact.html', 'privacy.html', 'terms.html', ...P.map(p => `products/${p.id}.html`), 'products/kit.html'];
fs.writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${URL0}${pretty(u || 'index.html')}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('built', OUT);
