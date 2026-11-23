# Good Tail Co. — The $50 AI Dropshipping Playbook

Everything you need to launch and run the store: the products, the math, setup, getting orders, marketing, and the AI workflows that let one person run it.

> **Reality check, read this once.** Most dropshipping stores never turn a profit. They fail because owners spend their whole budget on ads before they know anything sells. This plan does the opposite. You spend almost nothing up front, you get customers from free short-form video, and the store only costs you money when someone has already paid you. Profit isn't guaranteed. What this plan does is cap your downside at about $50 while you find out.

---

## 1. The business at a glance

| | |
|---|---|
| **Niche** | Pet care "problem solvers" (grooming, shedding, calm, walks). 95M US households own a pet, and pet videos are some of the easiest content to get views on. |
| **Store** | Good Tail Co. (rename it in `config.js` if you like; check the domain is free first) |
| **Website** | Custom static site in this folder. Free hosting, no monthly fees. |
| **Checkout** | PayPal payment links (customers pay with PayPal, Venmo or a card). No monthly fee, about 3.49% + 49¢ per sale. |
| **Supplier** | CJ Dropshipping. Free account, they ship straight to your customer. |
| **Traffic** | Organic TikTok / Instagram Reels / YouTube Shorts / Pinterest. $0 ad spend at launch. |
| **Monthly fixed cost** | **$0** (about $11/year for the domain) |
| **Your time** | 1–2 hours a day |

---

## 2. Products and unit economics

All four products are light, cheap to ship, hard to break, and easy to demonstrate on video ("satisfying" demos sell).

| Product | Price | Product cost* | Shipping to US* | PayPal fee | **Profit per order** |
|---|---|---|---|---|---|
| ⭐ Self-Cleaning Brush (hero) | $19.99 | ~$2.50 | ~$6.50 | $1.19 | **~$9.80** |
| Reusable Pet Hair Remover | $19.99 | ~$2.50 | ~$7.00 | $1.19 | **~$9.30** |
| Dog Water Bottle | $21.99 | ~$3.00 | ~$8.00 | $1.26 | **~$9.73** |
| Lick Mat 2-Pack (add-on) | $12.99 | ~$3.00 | ~$5.00 | $0.94 | **~$4.05** |
| 🎁 Shed-Free Home Kit (brush + roller + mats) | $39.99 | ~$8.00 | ~$12.00 (1 parcel) | $1.89 | **~$18.10** |

PayPal fee = 3.49% + 49¢ per sale (PayPal's US rate for payment links, Nov 2026). Card payments through the link cost a bit less (2.99% + 49¢). Refunds don't return the fee, and a dispute costs $15.

**Why these prices:** Amazon sells generic versions of all four for less (lick mat 2-packs go for $7–9). You can't win on price. You win with videos that make people want it right now, and with the kit. Don't price much higher than this, or commenters will point out the Amazon price.

\*These are estimates from late-2026 supplier listings. **Before you set prices, look up the exact product cost and shipping in CJ's shipping calculator for each item.** Pick a shipping method that includes US import duties (DDP), so your customer never gets a surprise bill.

**Pricing rules to keep you profitable:**
- **Landed cost** (product + shipping) should be **40% of your price or less**. If it's higher, raise the price or drop the item.
- **Set aside about 5% of revenue for refunds and replacements.** Some packages get lost.
- **The kit is your best profit lever.** One customer and one parcel earn almost twice the profit of a single brush. Push it in your videos ("the 3 things every shedding-dog owner needs"). The lick mat makes the most sense as part of the kit, not on its own.
- **Don't show fake "was $49.99" crossed-out prices.** It's illegal (FTC) unless you really sold at that price.

**Why the brush is the hero:** pressing the button and watching the fur slide off is a genuinely satisfying clip. Viewers understand the product in 2 seconds, it suits every dog and cat owner, and shedding season gives it a sales spike twice a year.

---

## 3. Where the $50 goes

| Item | Cost | Why |
|---|---|---|
| Domain name (e.g. goodtailco.com) | ~$11 | Makes the store look trustworthy. Buy at Cloudflare or Porkbun. |
| **Samples:** 1 brush + 1 lick mat shipped to you | ~$18 | Lets you check quality and **film your own videos**. Original footage beats reused supplier clips. |
| **Order float** | ~$21 | Keep it in reserve, don't spend it. When someone orders, you pay CJ right away, but PayPal **holds a new seller's first payments for up to 21 days**. This money covers that gap. Adding the tracking number to each PayPal payment gets the money released sooner. |
| Website hosting, PayPal, CJ, social accounts | $0 | All free. |
| Paid ads | **$0** | Only start ads with *profit*, and only after a free video proves a product sells (see §8). |

If money is very tight, skip the domain at first. Netlify gives you a free `yourstore.netlify.app` address.

---

## 4. Setup: about 3 hours over days 1–3

### Step 1: Accounts (30 min)
1. **Gmail:** create a dedicated inbox (e.g. `goodtailco.help@gmail.com`). Put it in `config.js` → `email`.
2. **PayPal Business** (paypal.com/business): sign up, or upgrade your personal account (Settings → *Upgrade to a Business account*). Choose *Individual / sole proprietor* and business name *Good Tail Co.* Confirm your email, phone and bank account. That also helps PayPal release held payments sooner.
3. **CJ Dropshipping** (cjdropshipping.com): free account. Add a payment method.
4. **Netlify** (netlify.com): free account, for hosting.

> **Age:** PayPal and CJ require account holders to be 18+. If you're under 18, a parent or guardian has to own the accounts, and you can run the business with them.

### Step 2: Lock in suppliers and real costs (45 min)
For each of the 4 products:
1. Start with these listings I found (log in to see stock, US-warehouse availability and shipping). If one is out of stock, search CJ for the product name and pick a listing with a good rating and lots of orders.
   - **Brush:** [Pet Self Cleaning Cat Brushes (one-click)](https://cjdropshipping.com/product/pet-self-cleaning-cat-brushes-cat-grooming-brush-for-dogs-cats-for-long-haired-short-hair-gently-to-remove-loose-undercoat-mats-tangled-p-1644208307106107392.html) or [Pet Self Cleaning Slicker Brush](https://cjdropshipping.com/product/pet-self-cleaning-slicker-brush-p-AEF754AF-2F7F-424E-897C-2BF7DF141B30.html). It must have the **push button** and **no battery**. Skip the "steam/mist" brushes.
   - **Hair remover:** [2-in-1 Pet Hair Removal Roller](https://cjdropshipping.com/product/2-in-1-pet-hair-removal-roller-multifunctional-portable-washable-hair-removal-brush-pet-supplies-p-1777181071063396352.html) (SKU CJMY200580801AZ, about $1.39–5.68)
   - **Water bottle:** [800ml Dog Water Bottle with fold-out bowl](https://cjdropshipping.com/product/800ml-dogs-water-bottle-portable-high-capacity-leakproof-pet-foldable-drinking-bowl-golden-retriever-outdoor-walking-supplies-pet-products-p-1637037130746703872.html) (SKU CJJT171012401AZ, about $2.28–3.99)
   - **Lick mat:** [Dog Silicone Licking Pad](https://cjdropshipping.com/product/dog-silicone-licking-pad-pet-licking-mat-silicone-smelling-mat-multifunctional-food-bowl-pets-supplies-p-1665981331156774912.html). Make sure it has **suction cups** and pick the ~20 cm size, not the large one.
   - **Use the "Ships from: US" filter** where possible: 3–8 day delivery instead of 7–15, which means fewer "where's my order?" emails.
2. Write down the **exact product cost + shipping to the US** from CJ's shipping calculator.
3. Check §2's 40% rule. If an item fails it, raise its price in `config.js` or swap it out.
4. **Order your samples now** (brush + lick mat) to your own address.
5. Download the listing's product photos (CJ has a download button). Use them until your own photos are ready.

### Step 3: Create checkout links (10 min)
In PayPal → **Pay & Get Paid → Create Payment Links and Buttons** → *Payment link*. Make one link for each product and one for the kit:
- **Product tab:** name, price and a short description (copy them from `config.js`). Turn on **Images** and upload the matching picture from `marketing/pins/`.
- **Checkout tab:** shipping **$0** (free shipping). Make sure the buyer's **shipping address is collected**.
- **Confirmation tab:** turn on **Auto-return** → `https://goodtailco.netlify.app/thanks.html`
- **Build it** → copy the link.

Paste each link into the matching `buyLink` in `config.js` (or send the links to Claude, who has your Netlify token and can update the live site).

> Test: open each link and check the name, price and that it asks for a shipping address. Don't buy from yourself, because PayPal flags self-payments.

### Step 4: Personalize the site (20 min)
Open `config.js` and update:
- `name`, `email`, `businessAddress` (a PO box or virtual mailbox is fine; don't use your home address if you'd rather keep it private)
- Product `image` paths: the site currently uses free **lifestyle photos from Pexels** (see `marketing/PHOTO-CREDITS.md`). As soon as you can, add the supplier's product photos or your own photos of the samples (put them in `images/`, square works best), so buyers see exactly what ships.
- **Edit the bullets so they match the actual listing and your sample.** If the listing doesn't say BPA-free, don't claim it.
- `shippingTime`: set it to what CJ quotes for your shipping method.

### Step 5: Go live (done)
1. The site is live at **https://goodtailco.netlify.app** (Netlify).
2. To update it, upload only the website files: the `good-tail-site` folder goes onto Netlify → *Deploys* → drag and drop. **Never upload the whole `store` folder**, because then this playbook and your order sheet would be public.
3. Optional later: Netlify → Domain settings → add a custom domain (about $11/year). HTTPS is automatic.
4. Open the site on your phone, click every button and read every page.

---

## 5. Fulfilling an order: about 5 minutes each

```
Customer pays (PayPal)  →  You get an email  →  You place the order on CJ  →  CJ ships  →  You email the tracking number
```

1. **PayPal emails you** that you received a payment. Open PayPal → Activity → the payment. Copy the **name, shipping address and product**.
2. **On CJ**, create a manual order (Orders → create order, or use their Excel/CSV import for several at once). Paste the address, pick the product and the same shipping method you priced with, and pay.
3. **Log it** in `orders-tracker.csv` (open it in Google Sheets): date, customer, item, what you charged, what you paid CJ, CJ order #.
4. **Within 1–3 days**, CJ shows a tracking number. **Add it to the PayPal payment** (Activity → the payment → *Add tracking*). This releases held money sooner and protects you if the buyer says it never arrived. Then email it to the customer using template A in §7.
5. Check the tracking once a week. If a package stalls for 10+ days, send a replacement or a refund without arguing. One angry chargeback costs you $15 plus the sale.

**Rules that keep PayPal happy (and your account open):**
- Ship within the 1–3 days your site promises.
- Answer every email within 24 hours.
- Refund quickly when something goes wrong. Refunds are cheap, disputes are expensive, and too many disputes can get your PayPal account limited.

**When to automate:** at **10+ orders a day**, manual fulfillment gets painful. Move to Shopify with the CJ app, which syncs orders and tracking automatically (Shopify can keep PayPal as a payment option). Your product data, photos, content and customers all carry over.

---

## 6. Getting customers for free: the content engine

This is the job. Your aim is **2–3 short videos a day for 30 days**. Post each video to all four platforms; making a video once and posting it four times costs you nothing extra.

| Platform | Why | Link to store |
|---|---|---|
| **TikTok** | Biggest organic reach for pet content | Bio link (may need a Business account or 1,000 followers; check current rules). Until then, say "link on our Instagram" or "search Good Tail Co." |
| **Instagram Reels** | Bio link works right away; buyers trust it | Bio link |
| **YouTube Shorts** | Extra reach for the same video | Channel link |
| **Pinterest** | Pet products do very well. Pins link **directly** to your product and send traffic for months. | Every pin |

Set up all four accounts with the same handle (e.g. @goodtailco), the same logo, and the bio: *"Small upgrades for happier pets 🐾 Free US shipping ↓"*

### The 6 video formats that sell physical products
1. **Satisfying demo:** close-up of the brush filling up with fur, then *click* and the fur slides off. No talking needed; add trending audio.
2. **Before / after:** a couch covered in hair, 5 rolls with the roller, a clean couch.
3. **Problem → solution:** "My dog hated baths…" → lick mat on the tub wall → calm dog.
4. **POV / relatable:** "POV: you own a husky in shedding season" + an absurd pile of fur.
5. **Reaction / test:** "Testing the viral self-cleaning brush on my golden retriever."
6. **Comment reply:** answer a real comment ("Does it work on cats?") with a new video. The algorithm favors these.

### 15 hooks to start videos with (text on screen + say it in the first 2 seconds)
1. "This brush cleans itself and I'm obsessed."
2. "If your dog sheds like this, you need to see this."
3. "The $20 thing that saved my couch."
4. "Groomers don't want you to know this trick." *(only if you can back it up)*
5. "Watch how much fur came off in 2 minutes."
6. "My cat actually ASKS for brushing now."
7. "Bath time used to be a war. Then I tried this."
8. "Stop buying sticky lint rollers. Watch this."
9. "POV: your black couch vs. your white dog."
10. "3 things every shedding-dog owner needs."
11. "I tested the viral pet hair remover so you don't have to."
12. "This is how my dog stays calm during nail trims."
13. "Rating every pet gadget I own. Number 1 surprised me."
14. "The water bottle that doesn't waste a drop."
15. "Things I wish I'd bought the day I got my dog."

### 5 ready-to-film scripts (15–25 seconds each)

**Script 1: "The click" (brush)**
- 0–2s: Close-up of the brush full of fur. Text: "This brush cleans itself 🤯"
- 2–10s: Brushing the dog in slow strokes, fur building up.
- 10–14s: Thumb presses the button and the fur slides off in one piece. (Film this 5 times; use the best take.)
- 14–18s: Happy dog. Text: "Link in bio 🐾"

**Script 2: "Couch rescue" (roller)**
- 0–2s: Wide shot of a hairy couch. Text: "My couch was 40% dog."
- 2–12s: Fast back-and-forth rolls (speed up 2x). Satisfying sound.
- 12–16s: Open the chamber: a huge ball of fur. Text: "No sticky sheets. Ever."
- 16–20s: Clean couch + dog jumping on it. Text: "Reusable forever → link in bio"

**Script 3: "Bath time hack" (lick mat)**
- 0–3s: Text: "How I bathe my dog without a fight 🛁"
- 3–8s: Spread peanut butter (xylitol-free!) on the mat and stick it to the tub wall.
- 8–16s: Dog happily licking while getting washed.
- 16–20s: Text: "Works for nail trims too. Link in bio."

**Script 4: "3 things" (kit)**
- 0–2s: Text: "3 things every shedding-dog owner needs."
- 2–8s: #1 brush, quick click shot.
- 8–14s: #2 roller, couch before/after.
- 14–20s: #3 lick mat, calm dog in the bath.
- 20–24s: "Get all 3 in the Shed-Free Home Kit (save $12.98). Link in bio."

**Script 5: "Walk upgrade" (bottle)**
- 0–2s: Text: "Dog walk hack 💧"
- 2–10s: On a walk, flip out the bowl, press the button, dog drinks.
- 10–14s: Tip the leftover water back into the bottle. Text: "Zero waste."
- 14–18s: Clips into a bag, done. "Link in bio."

### Filming tips (phone only)
- Film vertically, near a window or outside. **Light is everything.**
- Film **20–30 clips in one session** when your samples arrive. That's 2 weeks of content.
- Edit in **CapCut** (free): auto-captions, trending sounds, cut every 1–2 seconds.
- No pet? Film a friend's or family member's pet (ask first), or offer a free brushing session to a neighbor.
- While waiting for samples, you can use CJ's product videos. Re-edit them with your own hooks and captions, and switch to your own footage as soon as you can.

### Free traffic beyond video
- **Pinterest:** make 5 pins per product (Canva is free) and link each to your site. Post 3–5 pins a day.
- **Reddit / Facebook groups:** be helpful, not salesy. Answer "how do I deal with shedding?" questions honestly. Only mention your store where the rules allow it.
- **Micro-influencers (once you have profit):** DM pet accounts with 5k–50k followers. Offer a free product (about $10 cost to you) in exchange for an honest video, plus a 10%-off payment link just for their followers (make a copy of the PayPal link with the discount set in its Checkout tab).

---

## 7. AI: your free team of employees

Use Claude (or any AI assistant) for these jobs. Copy and paste the prompts.

**🎬 Content writer: 10 new video ideas a day**
> I run a pet store selling [product]. Write 10 TikTok video concepts under 20 seconds each. For each: the on-screen hook (max 8 words), shot list with seconds, and caption with 3–5 hashtags. Target: dog and cat owners frustrated with [shedding / bath time / pet hair on furniture]. Make them feel native to TikTok, not like ads. No claims I can't prove.

**📈 Performance analyst: once a week**
> Here are my last 14 videos with views, average watch time, likes, shares, link clicks and sales: [paste]. What do the top 3 have in common? What should I do more of, what should I stop, and give me 5 new video ideas based on the winners.

**💬 Customer support: draft replies in seconds**
> You are customer support for Good Tail Co., a small pet-products store. Our policies: free shipping, delivery [7–12] business days, 30-day returns, free replacement for damaged or lost items. Write a warm, short reply to this customer email: [paste]. Don't promise anything outside our policies.

**🔎 Product researcher: when you want a 5th product**
> Suggest 10 pet products that are: under 300 g, under $5 to source, sell for $20+, solve a specific annoying problem, and are easy to demonstrate in a 10-second video. For each, give the problem, the hook, and a risk (fragile, sizing issues, safety).

**✍️ Copywriter: new product pages**
> Write a product title (max 6 words), a one-sentence benefit, and 4 bullet points for [product], based ONLY on these supplier specs: [paste]. Tone: friendly, simple. Do not invent features.

**Never use AI for:** fake reviews, fake testimonials, fake before/after photos, or AI-generated images that make a product look different from what arrives. That's illegal (the FTC fines fake reviews) and gets your PayPal account shut down. Add a real reviews section only once real customers give you reviews. Email them 7 days after delivery and ask.

### Customer email templates

**A. Tracking number**
> Hi [Name]! Great news: your Good Tail Co. order has shipped 🐾
> Tracking: [number], track it at [17track.net link]
> It usually arrives in [7–12] business days. Reply to this email if you need anything. A real person reads every message.
> — [Your name], Good Tail Co.

**B. "Where's my order?"**
> Hi [Name], thanks for checking in! Your order is on its way. Latest tracking: [status/location]. It's within our normal delivery window of [X] business days. If it hasn't arrived by [date], email me and I'll send a replacement or refund, your choice.

**C. Damaged / wrong item**
> I'm so sorry about that, [Name]! No need to send it back. I'm sending a replacement today (or a full refund if you prefer, just say which). Thanks for the photo.

**D. Delay notice (send before they ask)**
> Hi [Name], a quick heads-up: carriers are running slower than usual, so your order may arrive a few days after our estimate. New estimate: [date]. If you'd rather cancel, reply and I'll refund you in full right away.

**E. Review request (7 days after delivery)**
> Hi [Name]! How is [pet name / your pup] liking the [product]? If you have 30 seconds, I'd love an honest review: just reply with a sentence (and a photo if you like!). It really helps a small business. 🐾

---

## 8. Numbers to track, and when to change course

Track these every Sunday in your spreadsheet:

| Metric | Healthy target |
|---|---|
| Videos posted this week | 14–21 |
| Average views per video | 500+ in week 1, growing |
| Site visitors (free [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/): paste its one-line script just above `</body>` in `index.html`) | growing week over week |
| Conversion rate (orders ÷ visitors) | 1–3% |
| Profit per order | $10+ (aim to sell more bundles) |
| Refund rate | under 5% |

**Decision rules**
- **30 videos on one product and most under 1,000 views?** Change the hook and format first (try #1 and #5 from §6).
- **60 videos and zero sales on the hero product?** Make a different product the hero (set `hero: true` on it in `config.js`).
- **A video passes 50k views and sales arrive?** Make 5 variations of that exact video within 48 hours. Repeating what worked is how you scale.
- **Selling 3+ of one item per day?** Buy 20–50 units into CJ's US warehouse: faster delivery, a lower cost per unit, and happier customers.
- **First ad test, using profit only:** boost your best organic video with TikTok Spark Ads or an Instagram boost, $10–20 a day for 3 days. Stop if a sale costs you more than half your profit per order.

---

## 9. Legal and money basics (US, simplified; not legal or tax advice)

- **Business structure:** you can start as a **sole proprietor** under your own name. Some states require a DBA ("doing business as") registration to sell under a store name. Search "[your state] DBA" (usually $10–$50). Form an LLC later if the business grows.
- **Sales tax:** most states require a seller's permit (often free) and tax collection on orders shipped **within your own state**. Out-of-state thresholds (usually $100k in sales) won't apply for a long time. PayPal payment links let you add a tax rate in the Checkout tab. Search "[your state] sales tax permit online seller".
- **Income tax:** profit is taxable income. Keep every receipt (samples, domain) because they're deductible expenses. In the US you report it on Schedule C.
- **Policies:** your site already has Shipping, Returns, Privacy, Terms and Contact pages. Fill in `businessAddress` in `config.js`.
- **Honest marketing (FTC):** no fake reviews, no fake "compare at" prices, no fake countdown timers, and no health claims (e.g. "cures anxiety"). Influencers must label posts **#ad**.
- **Product safety:** check your samples for sharp edges and loose small parts. Tell customers peanut butter must be **xylitol-free** (xylitol is toxic to dogs). That line is in the lick mat script for a reason.
- **IP:** don't use brand names (FURminator, ChomChom, etc.) in your product names or ads, and don't repost other creators' videos.

---

## 10. Your first 30 days

| Days | Do this |
|---|---|
| **1** | Create accounts (§4.1). Find suppliers, verify costs, **order samples** (§4.2). |
| **2** | PayPal Business account and payment links (§4.1, §4.3). Send the links to Claude so the live site gets its Buy buttons. Test everything. |
| **3** | Create TikTok, Instagram, YouTube and Pinterest accounts. Post your first 2 videos using CJ footage + your hooks. |
| **4–12** | Post 2 videos a day + 3 pins a day while samples ship. Reply to every comment. |
| **~12** | Samples arrive. Check quality, take product photos, **film 20–30 clips in one session**. Update `config.js` photos and bullets, then redeploy. |
| **13–30** | 2–3 videos a day using your own footage. Every Sunday, run the AI performance analyst prompt (§7) and follow the decision rules (§8). |
| **30** | Review: Which product sells? Which video format works? Double down on it. Reinvest profit into product samples for influencers, then small ad tests. |

### Growth path after the first sales
1. **10 sales:** ask every customer for a review (template E). Add a real reviews section to the site.
2. **50 sales:** stock your best seller in CJ's US warehouse. Add a 5th product (use the AI product researcher prompt).
3. **10+ orders a day:** move to Shopify + the CJ app to automate fulfillment. Start an email list (abandoned-cart and repeat-buyer emails are nearly free profit).
4. **Proven winner:** custom-branded packaging through CJ, then your own logo on the product. That turns a dropshipping store into a real brand that competitors can't copy.

---

## Files in this folder

| File | What it is |
|---|---|
| `config.js` | **The only file you normally edit:** store details, products, prices, checkout links |
| `index.html` | Home page and shop |
| `thanks.html` | Shown after checkout (PayPal's auto-return page) |
| `shipping.html`, `returns.html`, `privacy.html`, `terms.html`, `contact.html` | Policy pages, filled in automatically from `config.js` |
| `style.css`, `app.js` | Design and site logic (no need to touch) |
| `images/` | Put your product photos here |
| `orders-tracker.csv` | Import into Google Sheets to log orders and profit |
| `PLAYBOOK.md` | This guide |
