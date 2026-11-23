// End-to-end site check: crawls every internal page from "/" on desktop and phone widths.
// Fails on: non-200 pages, broken internal links, broken images, JS errors, sideways scrolling.
// Usage: node scripts/qa-site.cjs [baseUrl]   (default http://127.0.0.1:8787, i.e. `npx wrangler dev`)
const { chromium } = require('playwright');
const BASE = (process.argv[2] || 'http://127.0.0.1:8787').replace(/\/$/, '');

(async () => {
  const browser = await chromium.launch();
  const problems = [], seen = new Set(['/']), queue = ['/'];
  const sizes = [{ width: 1280, height: 900 }, { width: 390, height: 844 }];
  while (queue.length) {
    const path = queue.shift();
    for (const vp of sizes) {
      const page = await browser.newPage({ viewport: vp });
      page.on('pageerror', (e) => problems.push(`${path} JS error: ${e.message}`));
      page.on('response', (r) => { const u = new URL(r.url()); if (u.origin === BASE && r.status() >= 400) problems.push(`${path} -> ${u.pathname} HTTP ${r.status()}`); });
      const res = await page.goto(BASE + path, { waitUntil: 'load' });
      if (!res || res.status() !== 200) problems.push(`${path} HTTP ${res && res.status()}`);
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
      await page.waitForTimeout(250);
      const info = await page.evaluate(() => ({
        w: document.documentElement.scrollWidth,
        badImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')),
        links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      }));
      if (info.w > vp.width) problems.push(`${path} @${vp.width}px: sideways scroll (${info.w}px)`);
      info.badImgs.forEach((s) => problems.push(`${path} broken image ${s}`));
      for (const h of info.links) {
        if (!h.startsWith('/') || h.startsWith('//')) continue;
        const p = h.split('#')[0] || '/';
        if (!seen.has(p)) { seen.add(p); queue.push(p); }
      }
      await page.close();
    }
  }
  await browser.close();
  console.log(`checked ${seen.size} pages at ${sizes.length} screen sizes`);
  if (problems.length) { console.log([...new Set(problems)].join('\n')); process.exit(1); }
  console.log('no problems found');
})();
