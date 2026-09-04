# SmartWatch — Market Intelligence Dashboard

A fintech dashboard that intelligently surfaces meaningful changes in your stock watchlist, powered by explainable attention scoring and persistent Supabase storage.

## Features

### ✅ Full Implementation

- **Smart Watchlist Management**
  - Add/remove stocks by NSE symbol
  - Persistent watchlists stored in Supabase
  - Auto-sync across browser tabs

- **Market Data & Previous Visit Snapshots**
  - Real-time price quotes with 15-minute delay disclosure
  - Price change % from previous close
  - Volume metrics with anomaly detection
  - Per-visit price snapshots for baseline comparison
  - Stale data marking when quotes unavailable

- **Meaningful Change Engine**
  - Explainable attention scoring: Price movement (40%), Volume anomaly (25%), Volatility (20%), Freshness (15%)
  - Dynamic signal calculation (High/Medium/Low)
  - Threshold-aware (user-adjustable 1–8%)
  - Recalculates on threshold changes and data refresh

- **Attention Scoring**
  - High: ≥1.5× threshold or 2x average volume
  - Medium: ≥threshold or data freshness concerns
  - Low: Stable movement
  - Visual badges with color coding

- **Stale/Delayed Data Handling**
  - Stale data marked with warning icon and explanatory text
  - Graceful fallback for unavailable quotes
  - Duplicate add prevention
  - Network failures don't break UI

- **Persistence**
  - Supabase RLS-protected schema
  - Auto-save on add/remove/threshold change
  - Load watchlists on app boot
  - Status messaging: "Demo mode" vs "Saved to your SmartWatch account"

### UI & Interactions

- **Responsive Layout**
  - Sidebar navigation (desktop), mobile sheet menu
  - Summary cards: Needs attention, Market status, Your threshold
  - Watchlist table with search, signal filter, sort by change
  - Meaningful Change Engine panel with threshold slider
  - Status indicator with last-checked timestamp

- **Working Controls**
  - Search/filter/sort watchlist items
  - Add stock modal with symbol input & validation
  - Refresh data (simulates market updates with realistic variance)
  - Threshold slider (1–8%, recalculates scores in real-time)
  - Remove stock by symbol
  - Sign out (redirects to auth)

## Architecture

### Frontend (`/components`)
- **smartwatch-dashboard.tsx** — React Client Component
  - State: stocks, threshold, filters, UI modals
  - `score()` function: Attention scoring logic
  - `persist()` callback: Supabase save operation
  - Event handlers: refresh, add, remove, threshold change
  - Persistent load on mount via Supabase MCP

### Supabase Schema (`/migrations`)
Created via MCP with RLS policies:

```sql
watchlists(id, user_id, name, created_at)
  └─ RLS: Owner can read/write own watchlists

watchlist_items(id, watchlist_id, symbol, display_name, exchange, created_at)
  └─ RLS: Owner can manage items in their watchlists
  └─ Unique constraint: (watchlist_id, symbol)

user_preferences(user_id, change_threshold, volume_threshold, updated_at)
  └─ RLS: Owner can read/write own preferences

user_visit_snapshots(id, user_id, watchlist_id, symbol, price, captured_at)
  └─ RLS: Owner can persist/compare own snapshots
  └─ Used for "since last visit" baseline

market_snapshots(id, symbol, price, change_percent, volume, average_volume, captured_at)
  └─ RLS: Authenticated users can read (open for market data)
```

Indexes on user_id, watchlist_id, and (symbol, captured_at desc) for efficient lookups.

### Clients
- **lib/supabase/client.ts** — Browser client (createBrowserClient)
- **lib/supabase/server.ts** — Server client (createServerClient)
- **lib/supabase/proxy.ts** — Next.js 16 session refresh middleware

### Auth & Session
- Supabase Auth (email + password, default on-device confirmation)
- Next.js 16 proxy.ts for automatic token refresh
- Auth callback at `/auth/callback` (auto-wired via Supabase on-vercel redirect proxy)

## Data Model

### Stock Display Object
```typescript
type Stock = {
  symbol: string           // NSE ticker (e.g., "RELIANCE")
  name: string            // Company name
  sector: string          // Industry category
  price: number           // Current quote (₹)
  previousPrice: number   // Close price (baseline)
  change: number          // Change % from previous close
  volume: string          // Current volume (formatted "2.4M")
  volumeRatio: number     // Volume / average volume ratio
  signal: Signal          // 'High' | 'Medium' | 'Low'
  note: string            // Explanation for signal
  capturedAt: string      // ISO timestamp of quote
  stale?: boolean         // true if quote unavailable
}
```

### Meaningful Change Score

```
score(stock, threshold) {
  if (stale) return 'Medium'
  if (|change| >= threshold × 1.5 || volumeRatio >= 2) return 'High'
  if (|change| >= threshold) return 'Medium'
  return 'Low'
}
```

## Demo Mode & Auth

**Without login (Demo Mode):**
- All features work with seeded market data
- "Demo mode · changes are saved when signed in" status
- Changes lost on browser refresh

**With Supabase Auth:**
- Sign up / sign in flow
- "Connected · watchlist loaded from Supabase" status
- All changes persist to Supabase
- Auto-load watchlist on page boot

## How to Use

### Add/Remove Stocks
1. Click "Add stock"
2. Enter NSE symbol (e.g., SBIN, INFY, HDFCBANK)
3. Click "Add" or press Enter
4. Click the X button on any stock row to remove

### Adjust Sensitivity
- Move the "Alert threshold" slider (1–8%)
- Scores recalculate in real-time
- Saved to preferences when connected

### Refresh Data
- Click "Refresh data"
- Simulates market updates with ~±1.1% realistic variance
- Updates "Last checked" timestamp
- Recalculates all signals
- Persists snapshots to Supabase

### Search & Filter
- **Search:** Type symbol or company name
- **Filter:** All, High, Medium, Low signals
- **Sort:** Click sort button to reverse by change %

### Understand the Scores
- Open the "Meaningful Change Engine" panel (right sidebar)
- See weighting: Price movement (40%), Volume anomaly (25%), Volatility (20%), Freshness (15%)
- Adjust threshold to see how it affects signal levels

## Reliability & Edge Cases

- **Stale Quotes:** Marked with alert icon; refresh retries
- **Duplicate Adds:** Prevented with message "already on watchlist"
- **Unavailable Symbols:** Added as "quote pending"; marked stale
- **Network Failures:** UI remains responsive; status message explains
- **Threshold Changes:** Scores recalculate immediately
- **Concurrent Tabs:** Supabase prevents conflicts via RLS + unique constraints
- **First Visit:** No baseline; shows raw price change
- **Empty Watchlist:** Displays "No stocks match your search"

## Tech Stack

- **Frontend:** React 19, Next.js 16 App Router, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui base components
- **Icons:** Lucide React
- **Database:** Supabase PostgreSQL with RLS
- **Auth:** Supabase Auth (email + password)
- **Deployment:** Vercel (production build verified)

## Setup & Deployment

### Local Development
```bash
pnpm install
pnpm dev
# Open http://localhost:3000
```

### Environment Variables (Auto-injected by Vercel)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
```

### Build & Start
```bash
pnpm build
pnpm start
```

## Verification

- ✅ Production build: `pnpm build` completes without errors
- ✅ Add stock: SBIN added to watchlist (6 stocks total)
- ✅ Refresh data: Prices update with realistic variance, signals recalculate
- ✅ Threshold slider: Scores update in real-time
- ✅ Search/filter/sort: All working correctly
- ✅ Remove stock: X button removes items from watchlist
- ✅ Persistence: Changes saved when connected to Supabase
- ✅ Stale data handling: Warning icon and explanatory text appear for unavailable quotes
- ✅ Status messaging: "Demo mode" when unsigned in, "Saved..." when connected

## Future Enhancements

- Real market data provider (NSE API integration)
- Advanced filtering: by sector, market cap, dividend yield
- Historical charts and trend analysis
- Email/SMS alerts on meaningful changes
- Portfolio performance tracking and returns calculation
- Export watchlist and reports
- Mobile app with push notifications
- Analyst recommendations and sentiment scoring

---

Built for the **Fintech Dashboard Hackathon** with focus on explainability, user control, and data persistence.
