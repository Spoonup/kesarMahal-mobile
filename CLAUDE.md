# Kesar Mahal Mobile — CLAUDE.md

"Never do the work yourself. Always hand it to a sub-agent."

Customer app for Kesar Mahal ("Treasures from Kashmir", a Spoonup house): Kashmiri dry fruits, kesar, kahwa, gift boxes. iOS + Android.

See also `AGENTS.md` (Expo rules: use `npx expo install`, check versioned Expo docs before using Expo APIs).

## Stack

- Expo SDK 58, React Native 0.88, React 19, TypeScript
- React Navigation (native stack + bottom tabs) — **not** Expo Router, despite AGENTS.md; migrate only if asked
- TanStack Query for server data; one React context (`src/store.tsx`) for bag, gift boxes, auth
- expo-secure-store (session token), AsyncStorage (bag, guest order tokens), expo-image, react-native-webview (Razorpay)

## Commands

```bash
npm start            # Expo dev server; press i for iOS simulator (Expo Go)
npx tsc --noEmit     # typecheck
npx eslint src App.tsx   # lint (`npx expo lint` fails on the eslint version check)
```

Run typecheck and lint before calling anything done. There are no tests yet.

## Backend

- The Spoonup API, the **same endpoints as the Kesar Mahal website** (`~/Desktop/KesarMahal`, see its `src/api.js` and `docs/BACKEND-REQUESTS.md`). Server code: `~/Desktop/SpoonUp/SpoonUp-Website/server`.
- Base URL from `EXPO_PUBLIC_API_BASE` in `.env` (gitignored; copy `.env.example`). The app throws at startup if it is missing.
- Every request sends `x-storefront: kesarmahal`; signed-in requests add `x-user-token`; guest order reads add `x-order-token`.
- `src/api.ts` is the only module that talks to the backend.
- The API is **live production**. Reading products/settings/quotes is fine; never place test orders or payments against it.

## Rules

- **Nothing hardcoded.** Products, prices, GST, totals, coupons, orders, addresses come from the API. The bag stores only `{ productId, sizeId, qty }`; totals always come from `/api/cart/quote`.
- Never trust client-side payment success: `/api/checkout/complete` verifies the Razorpay signature.
- **No points / store-credit / wallet UI.** Removed on request; do not re-add.
- Every screen that loads data shows a skeleton from `src/skeletons.tsx`, not a spinner.
- Touch targets ≥ 44pt; give pressables an `accessibilityRole` and label.

## Brand (from the brand guidelines, ed. 01)

- Tokens live in `src/theme.ts`; brand copy and display config in `src/content.ts`. Do not put colours or copy inline in screens.
- Colour: Mahal Maroon `#6B1426`, Ivory `#F5F1EA`, Walnut Ink `#2A1E1A`, Zari Gold `#B08D57` (a thread, not a fill); accents Kesar `#C2431B`, Crocus `#8A5E9C`, Chinar Pine `#3D5240`. Proportion 50 ivory · 30 maroon · 10 ink · 5 gold · 5 accents.
- Type: Cinzel (labels, caps, wide tracking), Cormorant Garamond (display, product names), Jost (body, UI, prices).
- Ornament: arch frame for product photos, rule-and-diamond dividers. One device per surface.
- Voice: a host, not a hawker. Specific (village, grade, harvest), gracious, honest. No countdown timers, shouting caps, or "world's best".
- Spoonup appears only as the quiet line "A Spoonup house".
- Design source: `~/Downloads/Kesar Mahal brand guidelines (1)/` (`Kesar Mahal App.dc.html` is the app mockup).

## Layout

```
App.tsx              fonts, providers, navigators
src/theme.ts         colour / font / spacing tokens
src/content.ts       brand copy, shelves, gift box tiers, limits
src/api.ts           API client, types, error messages, token storage
src/data.ts          server product -> UI product, shelves, order status wording
src/store.tsx        bag, gifts, auth, catalogue; useQuote()
src/ui.tsx           shared components (Button, Chip, Arch, Field, ProductCard…)
src/skeletons.tsx    loading placeholders per screen
src/payment.ts       hands the Razorpay result back to Checkout
src/screens/         Home, Shop, Product, Gift, Bag, Checkout, Payment, Order, Trace, Account, Auth
```

## Known gaps

- Trace tab calls `GET /api/lots/:code`, which the backend does not have yet.
- Google sign-in and guest order lookup by number + phone are not wired (backend requests #10 and #5 in the website docs).
- Razorpay runs in a WebView, so UPI intent apps may not open; `react-native-razorpay` needs a dev build.
- No free-shipping nudge: the quote returns no shipping data.
