# Slice 4 — Visual refinement pass

Focused polish on top of the role-aware dashboard; **no new design system, no new
tokens, no brand change**. Dark theme untouched (its sidebar overrides remain valid
because base sidebar rules were converted to tokens rather than hacked).

## 1. Surface hierarchy / de-greening
- `dash-sidebar` converted from a full-height `--emerald-dark` surface to a neutral
  elevated surface (`--color-surface` + `--stone` right border). All sidebar text,
  hover, active, avatar, badge, signout and collapse-toggle rules now use semantic
  tokens (`--ink`, `--ink-mid`, `--ink-soft`, `--cream`, `--linen`, `--danger`).
- Emerald is now reserved for: active nav (link bar changed from gold → emerald),
  hover states, and the primary KPI value. Badges became solid chips (emerald/gold/red
  on white text) instead of dark-surface pastels.
- Public page headings (`services/index`, `market-prices`) changed from 3rem emerald
  to 2rem ink — emerald no longer dominates headings.

## 2. KPI cards redesigned
Hierarchy is now LABEL (small caps, muted) → LARGE VALUE (sans, tabular numerals) →
real context line ("completed orders only", "awaiting completion"…) → hover-revealed
arrow affordance. Colored icon tiles removed; shadows/transform hover removed in
favour of a border-color change. First KPI per role uses `is-primary` (emerald value);
Total Sales uses `is-financial` (gold = financial). No invented trends.

## 3. Chart density rules (sales overview)
- 0 active points → existing meaningful empty state (verified live: farmer with no
  orders sees "No sales data yet", not an empty chart).
- ≤2 data points → compact summary block (total + per-month list, no chart).
- 3–5 points → simple chart at reduced height (`.chart-wrapper--compact`, 170px).
- 6+ points → full chart (260px).

## 4. Spacing rhythm
Header/KPI/section margins normalised (2.5rem → 2rem large rhythm; section-header
margin 1rem; removed the doubled title margin inside headers). Empty states and
analytics cards tightened (2.5rem → 1.75rem / 1.5rem → 1.25rem padding).

## 5. Typography
Section titles moved from Playfair serif to Outfit sans (UI text = readable);
`stat-num` from serif to sans with tabular numerals; serif (Playfair) retained only
for the page greeting and sidebar brand. Line-height/weight consistent.

## 6. Market price trust signal (backend-verified)
Backend truth: live = Shamba Records API (`source: ShambaRecords`); fallback = stored
`MarketPrice` DB rows flagged `isDemo` (seeded reference data — *not* cached live
data). New unmistakable provenance banners:
- **LIVE** (solid emerald badge): "powered by Shamba Records, fetched live at page load".
- **REFERENCE DATA** (amber badge): "stored reference prices from the AgriConnect
  database. These are *not live market intelligence*; verify before trading decisions."
The dashboard Market Prices section (which always reads stored DB prices) now says
"Stored reference prices — check live feed status".

## 7. Service cards
160px empty icon block replaced by a compact row card: small category icon chip,
category + real availability badge (AVAILABLE/BOOKED/UNAVAILABLE from the model),
title, county + provider name (real includes), gold price, "View details" outlined
CTA. No invented ratings/photos.

## 8. Button hierarchy in dashboard
Single primary action per role stays amber; all five empty-state recovery buttons
demoted from `btn-amber` to `btn-outline` (secondary); section "View All →" links
remain tertiary text links.

## 9. Card discipline
Lists (market prices, messages, service rows) remain lists inside one section
surface; no new nested card-in-card patterns introduced.

## Validation
- EJS: 39/39 compile · CSS braces 895/895 balanced · `git diff --check` clean.
- Live smoke test (MySQL available): farmer/buyer/provider dashboards 200 with new
  KPI markup (0 `stat-icon`, 4× label/hint/go on farmer), sales empty state correct,
  market-prices 200 showing the REFERENCE DATA badge (Shamba key unset → honest
  fallback), services 200 with 5 compact cards incl. availability badges, admin 302
  → `/admin`, unauth 302 → `/login`.
- Responsive: KPI grid keeps 4→2→2/1 bands; on ≤640px hints hide, service card CTA
  stacks full-width, existing mobile sidebar/navbar a11y untouched.

---

# Slice 4 — Role-aware dashboard redesign (IA phase)

## Approach
The existing dashboard was already real-data driven (Sequelize queries, Chart.js fed
from the controller, no mock data). The redesign focused on information-architecture
gaps per role rather than a rewrite. **No new CSS tokens, colors, or component
systems were introduced** — all sections reuse existing dashboard classes
(`dash-section`, `produce-mini-card`, `recent-row`, `empty-state-card`,
`produce-status-badge`).

## Data sources (all traceable)

| Dashboard data | Source |
| --- | --- |
| KPI counts (listings, pending orders, unread messages, services, requests, available produce) | `dashboardController.renderDashboard` — `ProduceListing.count`, `Order.count`, `Message.count`, `ServiceListing.count`, `ServiceRequest.count` |
| Total sales / sales chart / order-status doughnut / category bar | raw Sequelize queries on `orders` / `produce_listings` (farmer only) |
| Recent produce / recent orders | `ProduceListing.findAll`, `Order.findAll` (role-aware buyer/seller include) |
| Recent messages | existing raw SQL conversation query |
| Market prices (`priceChange` is a real `MarketPrice` model field) | `MarketPrice.findAll` (now farmer/buyer only) |
| Service requests (NEW, role-aware) | `ServiceRequest.findAll` — provider: `providerId = me` (incoming); farmer/buyer: `requesterId = me` (sent); includes `service` + `requester`/`provider` |
| Fresh produce (NEW, buyer) | `ProduceListing.findAll` status LISTED, includes farmer name/county |
| Recommended services (previously queried but never rendered) | `ServiceListing.findAll` availability AVAILABLE (now farmer/buyer only) |

## Role-specific UX

- **Farmer**: welcome → KPIs → Farm Analytics (real charts with period filter + empty
  states) → My Produce → Recent Orders → Market Prices + Recent Messages →
  My Service Requests + Services You May Need.
- **Buyer**: welcome → KPIs → **Fresh on the Marketplace** (View / Order CTAs linking to
  the existing `/orders/new?produce=<id>` flow) → Recent Orders → Market Prices +
  Recent Messages → My Service Requests + Services You May Need.
- **Provider**: welcome → KPIs → **Incoming Service Requests** (primary section; header
  CTA switches to "Review Requests" when `pendingServiceRequests > 0`) → Recent
  Messages (full width). No buyer/farmer noise (no marketplace produce, no market
  prices, no produce orders — providers have none).
- **Admin**: `/dashboard` now redirects to `/admin` (the real admin workspace) instead
  of rendering buyer branches with zeroed metrics.

## Fixes along the way

- `recommendedServices` was fetched on every dashboard render but never rendered by
  any template — now rendered for farmer/buyer and skipped for provider.
- Recent-order rows previously linked to the orders *list*; they now link to the
  order detail (`/orders/:id`).
- Order/request status badges now differentiate `pending` (gold) vs `completed`
  (green) vs other (neutral) using the existing badge classes.

## States

- **Empty**: every section has a purposeful empty state with a role-appropriate CTA
  (e.g. buyer orders → Browse Marketplace; provider requests → List a Service).
- **Error**: controller failures flow to the centralized error handler; per-query
  failures for the new queries degrade to empty arrays (section shows empty state).
- **Loading**: dashboard is fully server-rendered, so no client loading state applies.

## Validation

- `node --check` controller: passed; controller requires cleanly.
- EJS compile of all 39 templates: 0 failures.
- `git diff --check`: clean.
- **Live smoke test (MySQL WAS available)**: booted `node server.js`, minted real JWTs
  via the app's own config for seeded users of each role:
  - farmer → 200: My Produce rendered with real listings; Recent Orders + sales chart
    show honest empty states (no orders in DB); charts render only with data.
  - buyer → 200: "Fresh on the Marketplace" rendered 4 real listings with View/Order
    CTAs; real order rows.
  - provider → 200: Incoming Service Requests section with honest empty state; no
    buyer/farmer sections; messages full width.
  - admin → 302 to `/admin`.
  - unauthenticated `/dashboard` → 302 to `/login`.
  - server log: no errors.
