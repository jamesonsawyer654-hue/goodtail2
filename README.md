# Good Tail Co.

Dog-products store: storefront, automated order pipeline (PayPal → CJdropshipping), content engine and owner dashboard.

- **Design:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Decisions:** [docs/DECISIONS.md](docs/DECISIONS.md)
- **Owner setup:** [docs/SETUP.md](docs/SETUP.md)

```
packages/core   business rules: money/approval rules, profit math, order lifecycle (tested)
apps/site       storefront (static generator; live at goodtailco.netlify.app until Cloudflare cut-over)
apps/worker     backend API on Cloudflare Workers (+ D1 in Phase 1); serves dist/site as static assets
```

- `npm test`: unit tests (core rules + worker); CI runs them on every push.
- `npm run build`: builds the storefront into `dist/site`.
- Deploy: Cloudflare Workers Builds runs `npm run build` then `npx wrangler deploy` on every push to `main`.
