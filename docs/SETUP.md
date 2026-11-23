# Setup checklist (owner)

Everything here is **free**. Keys and passwords go **only** into the GitHub or Cloudflare secret settings, never into chat. Claude tells you each secret's exact name when it's time.

## Phase 1: needed to build the store and checkout
| # | Account | Where | What to give Claude | Unlocks |
|---|---|---|---|---|
| 1 | **GitHub** | github.com → Sign up → create an empty **private** repo named `goodtail` | Your username and repo name, then approve this session's access when asked | Code storage, tests, deploys, scheduled jobs |
| 2 | **Cloudflare** | dash.cloudflare.com → Sign up → *Workers & Pages* → connect your GitHub repo (Claude gives the exact settings) | Nothing; you connect it in the dashboard | Hosting, backend, database |
| 3 | **PayPal developer app** | developer.paypal.com → log in with your PayPal **Business** account → *Apps & Credentials* → *Create App* (Sandbox first, Live later) | Paste the **Client ID + Secret** into Cloudflare secrets `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Real cart and checkout |
| 4 | **CJdropshipping API key** | cjdropshipping.com → sign up → *Authorization → API* → generate key | Paste into Cloudflare secret `CJ_API_KEY` | Product import, auto orders, tracking |

## Phase 2: emails and alerts
| 5 | **Gmail app password** | myaccount.google.com → Security → turn on 2-Step Verification → *App passwords* → create one named "Good Tail" | Cloudflare secret `GMAIL_APP_PASSWORD` | Order, shipping and review emails |
| 6 | **ntfy** (iPhone app) | App Store → "ntfy" → subscribe to the private topic name Claude gives you | Nothing | Instant alerts on your phone |

## Phase 4: content and social
| 7 | **Meta app token** (Instagram, Facebook) | See `automation/AUTOPILOT.md` step 2 | GitHub secret `META_TOKEN` | Auto-publishing Reels |
| 8 | **Facebook Page** | facebook.com/pages/create → link it to your Instagram in Meta Business Suite | Nothing | Facebook Reels |
| 9 | **Pexels API key** | pexels.com/api → request key (instant) | GitHub secret `PEXELS_API_KEY` | Licensed stock footage for videos |
| 10 | TikTok, YouTube accounts | In each app | Nothing | 1-tap posting from the dashboard queue |

## Money to have ready (your decision each time)
- **CJ balance top-up:** ~$20–30 so the first orders can be paid automatically. You add it in CJ yourself.
- Optional later: domain (~$11/year), product samples (~$18).
