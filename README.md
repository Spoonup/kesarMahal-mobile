# Kesar Mahal — mobile app

Expo (React Native, TypeScript) · React Navigation · TanStack Query. Brand tokens: `src/theme.ts`, copy: `src/content.ts`.
Backend: the Spoonup API, same as the Kesar Mahal website (`x-storefront: kesarmahal`). All products, prices, totals, orders come from it; the bag stores ids and quantities only.

```bash
cp .env.example .env   # EXPO_PUBLIC_API_BASE=<spoonup api origin>
npm start              # press i for the iOS simulator (Expo Go)
npx tsc --noEmit
```

## Needs from the backend
- `GET /api/lots/:code` → `{ code, product, verified, facts: [{label, value}], labReportUrl? }` for the Trace tab (404 = unknown lot). Not built yet.
- Google sign-in (redirect flow, see website `docs/BACKEND-REQUESTS.md` #10) and guest order lookup by number + phone (#5) are not wired.
- Online payment runs Razorpay Checkout in a WebView; UPI intent apps may not open there. Swap for `react-native-razorpay` in a dev build for full UPI.
