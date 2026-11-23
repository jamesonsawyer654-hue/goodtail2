# Good Tail Co.

Dog-products store: storefront, automated order pipeline (PayPal → CJdropshipping), content engine and owner dashboard.

- **Design:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Decisions:** [docs/DECISIONS.md](docs/DECISIONS.md)
- **Owner setup:** [docs/SETUP.md](docs/SETUP.md)

```
packages/core   business rules: money/approval rules, profit math, order lifecycle (tested)
apps/site       storefront (static generator; live at https://goodtail.jamesonsawyer654.workers.dev)
apps/worker     backend API on Cloudflare Workers (+ D1 in Phase 1); serves dist/site as static assets
```

- `npm test`: unit tests (core rules + worker); CI runs them on every push.
- `npm run build`: builds the storefront into `dist/site`.
- `npx wrangler dev` then `npm run qa`: crawls every page on desktop and phone widths (broken links/images, JS errors, sideways scroll).
- Deploy: Cloudflare Workers Builds runs `npm run build` then `npx wrangler deploy` on every push to `main`.
