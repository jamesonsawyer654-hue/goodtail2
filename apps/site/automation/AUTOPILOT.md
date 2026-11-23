# Good Tail Co. — Advertising on autopilot

What's already made and hosted on your site:
- **30 Pinterest pins**: https://goodtailco.netlify.app/p/pin-01.jpg … pin-30.jpg
- **5 short videos** for TikTok, Reels and Shorts: https://goodtailco.netlify.app/v/brush.mp4, roller.mp4, bottle.mp4, lickmat.mp4, kit.mp4
- **A 30-day Pinterest schedule**: `marketing/pinterest-bulk-upload.csv` (one pin a day from Nov 23, 8 PM Eastern)

Each platform needs **one setup by you** (the account has to be yours). After that:

| Platform | One-time setup by you | After that |
|---|---|---|
| **Pinterest** | 5 min: upload one file | 30 days of pins publish on their own. Ask Claude for the next 30. |
| **Instagram** | ~20 min: connect the account to the official API | **Claude posts for you** (Reels, photos, carousels) |
| **TikTok** | 2 min: make the account | TikTok blocks automated public posting by apps that haven't been audited, so you upload the videos Claude makes (about 1 min each, or schedule a week at a time from a computer) |

---

## 1. Pinterest (5 minutes, once a month)
1. Create a free **Pinterest Business** account (pinterest.com/business/create), name it *Good Tail Co.*, and use the logo from `marketing/profile-picture.png`.
2. On a **computer**: profile menu → **Settings → Import content → Upload .csv** → choose `marketing/pinterest-bulk-upload.csv`.
3. Done. Pinterest creates the 4 boards and publishes one pin every day for 30 days. You'll get a confirmation email.
> Best to upload once your PayPal links are live, so visitors can buy. If you upload later than Nov 22, ask Claude to shift the dates.

## 2. Instagram, so Claude can post for you (about 20 minutes, once)
Meta allows an app to post to **your own** account without any review ("Standard Access").
1. In the Instagram app: create **@goodtailco** (or similar), then Settings → *Account type and tools* → **Switch to professional account → Business**.
2. On a computer, go to **developers.facebook.com** → log in with Facebook → **My Apps → Create app**. Pick the Instagram / "manage content on Instagram" use case, and *Business* if asked.
3. In the app dashboard, open the **Instagram** product → **API setup**. Create a configuration with the defaults; they include **instagram_content_publish**.
4. Click **Add account**, give **your Instagram account** the *Instagram Tester* role, then accept the invite on **instagram.com** in a browser: Settings → *Website permissions* → *Apps and websites* → *Tester invites*.
5. Back in the dashboard, click **Generate token** next to your account and finish the login prompts. Meta shows the token **only once**.
6. Tell Claude **"instagram ready"**. Claude opens a **secure form** for you to paste the token into. Never paste it in the chat.

Then Claude posts the 5 Reels plus photo and carousel posts, and can keep posting whenever you ask. If a screen looks different from these steps, send Claude a screenshot.

## 3. TikTok (2 minutes a day)
1. Create **@goodtailco** in the TikTok app, add the logo and bio: *Small upgrades for happier pets 🐾 Free US shipping*.
2. Each day: save one video from `/v/` to your phone → **+** → upload → paste the caption from `marketing/30-DAY-CONTENT-PLAN.md` → tap **Add sound** and pick a trending one → Post.
   From a computer you can **schedule up to 10 days ahead** at tiktok.com/tiktokstudio/upload.

## Paid ads (later, only with profit)
When an organic post brings sales, Claude can set up Meta (Instagram/Facebook) ads using the same Meta app, with a **daily budget cap that you set**. Ad money is always your decision.
