# Food Product Search

A full-stack application for searching packaged food products using the Open Food Facts API. Supports multilingual UI (English, Dutch, German, French) and Stripe-gated nutritional details.

## Tech Stack

| Frontend | Backend |
|---|---|
| TypeScript | TypeScript |
| Next.js 15 | Express |
| React 19 | Prisma |
| Tailwind CSS | MySQL |
| | Open Food Facts API |
| | Stripe (test mode) |

## Setup

### Prerequisites

- Node.js 18+
- MySQL 8+
- Stripe CLI (for webhook testing)

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd trialproject

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Edit both files with your actual values:
- **DATABASE_URL**: Your MySQL connection string
- **STRIPE_SECRET_KEY**: From Stripe dashboard (test mode)
- **STRIPE_PRICE_ID**: Create a monthly subscription product in Stripe and use its price ID
- **STRIPE_WEBHOOK_SECRET**: From `stripe listen --forward-to localhost:4000/api/stripe/webhook`

### 3. Set up the database

```bash
cd backend
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

### 4. Start the application

Terminal 1 — Backend:
```bash
cd backend && npm run dev
```

Terminal 2 — Frontend:
```bash
cd frontend && npm run dev
```

Terminal 3 — Stripe webhooks (optional):
```bash
stripe listen --forward-to localhost:4000/api/stripe/webhook
```

The app runs at http://localhost:3000 with the API at http://localhost:4000.

### 5. Run tests

```bash
cd backend && npm test
cd ../frontend && npm test
```

## Technical Decisions

### Architecture
- **Monorepo with separate backend/frontend**: Keeps concerns cleanly separated. The backend is a standalone Express API, making it easy to deploy independently or swap the frontend.
- **Single demo user**: The assignment calls for one demo user. The middleware auto-creates this user on first request, avoiding any auth flow while still demonstrating the subscription model.

### Internationalization (i18n)
- **Manual language selector** with React Context: A lightweight approach that avoids heavy i18n frameworks. Translations are type-safe TypeScript objects.
- **UI translations**: All interface text is translated into EN, NL, DE, FR via a centralized translations file. Adding a language requires adding one translation object.
- **Product data translations**: The Open Food Facts API supports localized product names (`product_name_en`, `product_name_fr`, etc.). The backend passes the selected language to the API and prefers the localized name, falling back to the generic `product_name`.

### Stripe Integration
- **Checkout Sessions**: Uses Stripe Checkout for the subscription flow — redirects to Stripe's hosted page rather than building a custom payment form.
- **Webhook processing**: Handles `customer.subscription.created`, `updated`, and `deleted` events to keep the user's subscription status in sync.
- **Subscription gating**: The backend strips nutritional data from the API response when the user has no active subscription. The frontend shows a subscribe prompt in place of nutrition info.

### Data Handling
- **Missing/incomplete data**: Open Food Facts data is community-contributed and often incomplete. The app handles missing product names, brands, images, and nutrient values with fallback text and null-safe rendering.
- **Recent searches**: Stored in MySQL via Prisma. Limited to the 10 most recent per user, displayed as clickable chips for quick re-search.

## Known Limitations

- **Single user**: No authentication system — the app uses a hardcoded demo user. In production, this would need proper auth (e.g., NextAuth.js).
- **No SSR for search**: Search is client-side only. Server-side search with URL-based state would improve shareability and SEO.
- **In-memory caching only**: Product search results are cached in-memory with a 5-minute TTL. A Redis cache would provide persistence across restarts and shared state across multiple server instances.
- **Limited error recovery**: Network errors show a generic message. Retry logic and more granular error states would improve UX.
- **Stripe test mode only**: The integration uses Stripe test keys. Production deployment would need live keys and additional webhook signature verification.
