// ============================================================
//  STORE CONFIG — the ONLY file you need to edit to run the store.
// ============================================================
//  1. Change STORE details below.
//  2. For each product, paste its PayPal payment link into `buyLink`.
//  3. Drop product photos into /images and set `image` (e.g. "images/brush.jpg").
//
//  ⚠️  Every bullet/claim below must match YOUR supplier's listing and the
//      sample you receive. Edit them once your sample arrives. Never claim
//      something (BPA-free, dishwasher-safe, capacity, etc.) you haven't verified.
// ============================================================

window.STORE = {
  name: "Good Tail Co.",
  tagline: "Small upgrades for happier pets.",
  email: "jamesonsawyer654@gmail.com",  // customer support inbox (public)
  shippingText: "Free shipping on every order",
  shippingTime: "7–12 business days",   // be honest — match your supplier's real times
  returnDays: 30,
  businessAddress: "", // optional: a PO box / virtual mailbox; leave "" to hide it
  instagram: "", // e.g. "https://instagram.com/goodtailco"
  tiktok: "",    // e.g. "https://tiktok.com/@goodtailco"
};

window.PRODUCTS = [
  {
    id: "brush",
    hero: true,
    name: "One-Click Self-Cleaning Brush",
    price: 19.99,
    compareAt: null, // only set this if you genuinely sold it at that price before (FTC rule)
    emoji: "🪮",
    color: ["#ffd8b5", "#ff9f6e"],
    image: "images/brush.jpg",
    short: "Pulls out loose undercoat in minutes. Press the button and the fur slides right off the brush.",
    bullets: [
      "Fine bent bristles reach the loose undercoat",
      "Push-button retracts the bristles so fur wipes off in one swipe",
      "For dogs and cats with short or long coats",
      "Comfortable grip, rinses clean",
    ],
    buyLink: "#", // ← paste PayPal payment link
  },
  {
    id: "roller",
    name: "Reusable Pet Hair Remover",
    price: 19.99,
    compareAt: null,
    emoji: "🛋️",
    color: ["#dfe7ff", "#7b9cff"],
    image: "images/roller.jpg",
    short: "Roll it back and forth on the couch and the hair collects in the chamber. No sticky sheets to keep buying.",
    bullets: [
      "No batteries and no refills",
      "Works on couches, beds and car seats",
      "Open the chamber and empty it in seconds",
      "Reusable, so you skip the sticky lint sheets",
    ],
    buyLink: "#",
  },
  {
    id: "bottle",
    name: "Walk-Ready Dog Water Bottle",
    price: 21.99,
    compareAt: null,
    emoji: "💧",
    color: ["#d4f3ff", "#4fc3f7"],
    image: "images/bottle.jpg",
    short: "Press to fill the fold-out bowl, then tip the leftover water back into the bottle. Nothing gets wasted.",
    bullets: [
      "Lock button keeps it from leaking in your bag",
      "One-hand operation on walks and hikes",
      "Wide drinking trough for big and small dogs",
      "Wrist strap for easy carrying",
    ],
    buyLink: "#",
  },
  {
    id: "lickmat",
    name: "Calm-Down Lick Mat (2-Pack)",
    price: 12.99,
    compareAt: null,
    emoji: "🐶",
    color: ["#d6f5e3", "#6fcf97"],
    image: "images/lickmat.jpg",
    short: "Spread on xylitol-free peanut butter or yogurt and stick it to the tub. Bath time and nail trims get a lot easier.",
    bullets: [
      "Flexible silicone, easy to rinse clean",
      "Suction back sticks to tile, tubs and walls",
      "Keeps pets busy and slows down fast eaters",
      "2 mats per pack",
    ],
    buyLink: "#",
  },
];

// Bundle (bundles raise average order value — your best profit lever)
window.BUNDLE = {
  name: "The Shed-Free Home Kit",
  includes: "Self-Cleaning Brush + Hair Remover + Lick Mat 2-Pack",
  image: "images/kit.jpg",
  price: 39.99,
  savingsText: "Save $12.98 vs. buying separately",
  buyLink: "#",
};
