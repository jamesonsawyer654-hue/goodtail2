# Good Tail Co. — System architecture

Goal: a dog-products store that takes real orders, pays the supplier, ships, tracks, markets itself and reports profit, for **$0–15/month**, with the owner only approving money and legal decisions from an iPhone.

## 1. Constraints (from the owner interview, see `DECISIONS.md`)
- Start budget $50, running cost $0–15/month, no paid subscriptions without approval.
- Brand: Good Tail Co. Broad dog store.
- Custom storefront + PayPal (no Shopify).
- No custom domain yet → store email goes out from the owner's Gmail.
- Auto-pay supplier for paid orders (capped). Auto-refund < $25 for clear in-policy cases.
- Content: free pipeline; auto-publish where the platform officially allows it.

## 2. Stack (all free tiers)
| Layer | Choice | Why |
|---|---|---|
| Code | **GitHub** (private repo) + GitHub Actions | Version control, CI tests, scheduled jobs that need ffmpeg |
| Storefront | Static site generator (`apps/site`, `npm run build` → `dist/site`) served as **static assets of the Cloudflare Worker** | Fast, free, deploys on every push via Cloudflare Workers Builds; no API tokens needed by Claude |
| Backend API | **Cloudflare Worker** (`apps/worker`, config in `wrangler.jsonc`) — same deployment as the storefront, handles `/api/*` | Checkout, webhooks, order pipeline, dashboard API; 100k requests/day free |
| Database | **Cloudflare D1** (SQLite) | Orders, customers, products, reviews, emails, approvals, audit log; 5 GB free |
| Scheduled jobs | Worker **Cron Triggers** (light jobs), **GitHub Actions** (video rendering) | No server to maintain |
| Admin login | **Cloudflare Access** (free Zero Trust) on `/admin` | One-time-code login on iPhone/Mac; no passwords stored by us |
| Payments | **PayPal Orders API v2** (server-side create + capture, webhooks) | Real cart and checkout; cards, PayPal, Venmo |
| Supplier | **CJdropshipping Open API v2** | Free; US-warehouse search, live stock, freight quotes, `createOrderV2` with `payType=2` (balance), order/logistics webhooks, sandbox |
| Email | Owner's Gmail via SMTP app password (to be verified in Phase 2); move to own domain later | No domain yet |
| Alerts | **ntfy** push to iPhone (free, open source) + email | Instant "needs attention" pings |
| Video | GitHub Actions: Pexels stock clips + product images + **Piper** open-source TTS + ffmpeg | $0; licensed footage only |
| Publishing | **Meta Graph API** (Instagram + Facebook Reels, auto) · TikTok/YouTube → 1-tap queue | TikTok/YouTube block auto-posting from unaudited apps |

Secrets (PayPal, CJ, Gmail, Meta, Pexels) live only in **Cloudflare / GitHub secret stores**, entered by the owner. Never in the repo, never in chat.

## 3. Order flow
```
Customer cart ──► Worker /api/checkout/create ──► PayPal order (prices re-checked server-side from the catalog)
      PayPal approve ──► /api/checkout/capture ──► verify COMPLETED + amount ──► D1 order: paid
   paid ──► CJ freight quote ──► rules.supplierAutoPayDecision()
        ├─ allowed ──► CJ createOrderV2(payType=2) ──► supplier_ordered
        └─ held ────► awaiting_approval ──► ntfy alert ──► owner taps Approve/Cancel in dashboard
   CJ logistics webhook (+15-min cron fallback) ──► shipped ──► tracking email + PayPal tracking upload
   delivered ──► review request email (verified buyers only)
   Refund request ──► rules.refundDecision() ──► auto (PayPal refund API) or approval queue
   Any failure ──► needs_attention + alert. Nothing is retried silently with money.
```
All status changes go through `core/orders.transition()` (illegal jumps throw) and are written to an audit log.

## 4. Catalog
- Daily job searches CJ for US-warehouse dog products (`product/listV2?countryCode=US`), scores them (demand signals, margin, shipping time, weight) and adds the best to **Drafts**.
- Prices come from `core/profit.suggestPrice()` (landed cost ≤ 40% of price, ends in .99).
- Descriptions are written only from supplier specs. **Publishing a product is an owner approval** (product claims are a legal matter).
- Stock and price sync: CJ stock webhooks plus a nightly check. Out-of-stock products auto-hide; a price change that drops the margin below 30% auto-hides and alerts.
- CJ API budget: 50,000 points/day free; a product query costs 10 points.

## 5. Content engine
1. **Pick:** best-selling or newest products plus trending demand signals.
2. **Script:** hook, beats, captions, hashtags per platform (rules from the `viral-hook-formats` skill; claims only from product specs).
3. **Render** (GitHub Actions): licensed Pexels clips + product images, motion, burned-in captions, Piper voiceover, 9:16 export.
4. **Publish:** Instagram + Facebook Reels via Graph API, auto (owner decision). TikTok + YouTube Shorts: queued in the dashboard with caption ready for one-tap posting.
5. Target: 2–4 posts/day across platforms. No third-party videos or copyrighted music. In-app trending sounds are added by hand on TikTok.

## 6. Dashboard (`/admin`, iPhone home-screen app)
Revenue, product cost, shipping, fees, ad spend, refunds, net profit, margin, orders, AOV (all from `core/profit.periodSummary`, every expense counted) · approvals queue · alerts · order list with tracking · product drafts · content queue · customer messages with drafted replies · weekly report.

## 7. What is deliberately not automated
- Creating accounts, verifying identity, accepting terms (owner).
- Spending: ads, subscriptions, samples, domain (always an approval).
- Publishing new products, refunds ≥ $25 or outside clear policy, disputes (approval).
- TikTok/YouTube posting (platform rules).

## 8. Testing
- `packages/core`: unit tests (money rules, profit math, order lifecycle). Run with `npm test`; CI runs on every push.
- Worker: integration tests against **PayPal sandbox** and **CJ sandbox** (`isSandbox=1`) before any live money.
- Launch gate: one real end-to-end order with the owner's approval before opening the store.
