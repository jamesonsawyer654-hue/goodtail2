(function () {
  const S = window.STORE, P = window.PRODUCTS || [], B = window.BUNDLE;
  const $ = (s, r = document) => r.querySelector(s);
  const money = (n) => "$" + n.toFixed(2);

  // Fill store-wide placeholders on every page
  document.querySelectorAll("[data-s]").forEach((el) => {
    const v = S[el.dataset.s];
    if (v !== undefined) el.textContent = v;
  });
  document.title = document.title.replace("{store}", S.name);
  if (!S.businessAddress) document.querySelectorAll("[data-addr]").forEach((e) => e.remove());
  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  // Warn the owner (not customers) while buy links aren't set up yet
  const unset = P.some((p) => !p.buyLink || p.buyLink === "#");
  if (unset && (location.protocol === "file:" || /localhost|127\.0\.0\.1/.test(location.hostname))) {
    const n = document.createElement("div");
    n.className = "notice";
    n.textContent = "Setup mode: paste your PayPal payment links into config.js before going live.";
    document.body.prepend(n);
  }

  const media = (p) => {
    const bg = `linear-gradient(135deg, ${p.color[0]}, ${p.color[1]})`;
    return p.image
      ? `<div class="media" style="background:${bg}"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>`
      : `<div class="media" style="background:${bg}" aria-hidden="true">${p.emoji}</div>`;
  };

  const buy = (link, label = "Buy now") =>
    link && link !== "#"
      ? `<a class="btn block" href="${link}">${label}</a>`
      : `<button class="btn block" disabled style="opacity:.55;cursor:not-allowed">Coming soon</button>`;

  // Hero
  const hero = P.find((p) => p.hero) || P[0];
  const heroEl = $("#hero");
  if (heroEl && hero) {
    heroEl.innerHTML = `
      <div>
        <h1>${hero.name}</h1>
        <p class="lead">${hero.short}</p>
        <div class="actions">
          <a class="btn" href="${hero.buyLink !== "#" ? hero.buyLink : "#shop"}">Get yours — ${money(hero.price)}</a>
          <a class="btn ghost" href="#shop">Shop all</a>
        </div>
        <div class="trust">
          <span>🚚 ${S.shippingText}</span><span>↩️ ${S.returnDays}-day returns</span><span>🔒 Secure checkout with PayPal</span>
        </div>
      </div>
      ${media(hero)}`;
  }

  // Product grid
  const grid = $("#products");
  if (grid) {
    grid.innerHTML = P.map((p) => `
      <article class="card" id="${p.id}">
        ${media(p)}
        <div class="body">
          <h3>${p.name}</h3>
          <p>${p.short}</p>
          <ul>${p.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
          <div class="price">${money(p.price)}${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ""}</div>
          ${buy(p.buyLink)}
        </div>
      </article>`).join("");
  }

  // Bundle
  const bEl = $("#bundle");
  if (bEl && B) {
    if (B.image) bEl.classList.add("has-img");
    bEl.innerHTML = `
      ${B.image ? `<img class="bundle-img" src="${B.image}" alt="${B.name}" loading="lazy">` : ""}
      <div>
        <span class="tag">BEST VALUE</span>
        <h2 style="margin:0">${B.name}</h2>
        <p>${B.includes}</p>
        <p><b style="color:#fff">${B.savingsText}</b></p>
      </div>
      <div style="min-width:220px">
        <div class="price">${money(B.price)}</div>
        ${buy(B.buyLink, "Get the bundle")}
      </div>`;
  }

  // Social links
  const soc = $("#social");
  if (soc) {
    const links = [S.instagram && `<a href="${S.instagram}">Instagram</a>`, S.tiktok && `<a href="${S.tiktok}">TikTok</a>`].filter(Boolean);
    soc.innerHTML = links.length ? " · " + links.join("") : "";
  }
})();
