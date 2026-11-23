# Good Tail Co.

Dog-products store: storefront, automated order pipeline (PayPal → CJdropshipping), content engine and owner dashboard.

- **Design:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Decisions:** [docs/DECISIONS.md](docs/DECISIONS.md)
- **Owner setup:** [docs/SETUP.md](docs/SETUP.md)

```
packages/core   business rules: money/approval rules, profit math, order lifecycle (tested)
apps/site       storefront (static generator; live at goodtailco.netlify.app until Cloudflare cut-over)
apps/worker     backend API on Cloudflare Workers + D1 (Phase 1)
```

`npm test` runs the core test suite (also runs in CI on every push).
