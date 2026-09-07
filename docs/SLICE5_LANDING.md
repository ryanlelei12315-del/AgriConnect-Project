# Slice 5 — Landing page redesign (honest, real-data)

## Fabrications removed (data rule)
- Fake hero "Live listings" cards (invented produce/services with prices) → real DB rows.
- Fake "Featured Produce" cards ("Posted by Kamau Farms", "Rift Valley Grains", etc.)
  → real `ProduceListing` rows with the actual farmer's name.
- Fake service cards ("Available today", "From KES 800/day", "All counties")
  → real `ServiceListing` rows with real availability badges.
- Invented market-price ticker ("↑ +3% this week" etc., labelled "Live farm-gate
  price estimates") → real stored `MarketPrice` rows, no invented trends, explicit
  provenance note + link to the live-feed status page.
- "47 Counties covered / 3 User roles / 4 Service types" hero stats → real live
  counts ("6 produce listings live now · 5 farm services available") or an honest
  capability line when the platform is empty.
- "No commission on your first 10 deals" (fabricated offer) → "Free to join. Set
  your own prices and connect directly."
- "Every service provider is reviewed and verified by the AgriConnect community"
  (unverifiable claim) → "Direct service requests — browse profiles, availability
  and pricing, then request directly."
- "Today's Market Prices" (implies freshness of stored data) → "Market Prices".
- AI chatbot fabricated availability claims ("technicians in Meru and Embu available
  this week", "listed in Nakuru and Naivasha") → neutral, verifiable guidance.

## Route
`app.get('/')` is now async and serves real data with graceful degradation
(per-query `.catch` → empty fallback, so the landing never 500s on empty tables):
- `produce` — 6 newest LISTED `ProduceListing` rows incl. farmer name
- `services` — 4 newest AVAILABLE `ServiceListing` rows incl. provider name
- `marketPrices` — 6 newest `MarketPrice` rows
- `produceCount` / `serviceCount` — real live counts

The 404 handler and error paths render `index` without data; the template guards
every local (`Array.isArray(locals.produce) ? … : []`), so those renders show
honest empty states instead of crashing. Verified live.

## New content
- "How it works" section implementing the brief's three flows: produce →
  marketplace → orders; services → requests → fulfilment; information → market
  data → decisions.
- All listing cards are now real links to `/produce/:id` and `/services/:id`
  (hero mini-cards, featured produce grid, services grid) instead of
  `onclick="location.href='/marketplace'"` dead-ends.
- County marquee kept as decoration but marked `aria-hidden="true"` (decorative
  repetition); the functional county filter pills remain real links.

## CSS
Token-based appends only (`.how-grid/.how-card`, `.ticker-note/.ticker-empty`,
`.pc-img-fallback`, `.hero-capabilities`, anchor resets for converted cards).
No new colors or tokens.

## Validation
- EJS 39/39 compile · CSS braces 916/916 · `git diff --check` clean · `node --check server.js`.
- Live smoke test (fresh server instance): `GET /` 200 — hero shows real counts
  (6 / 5), real produce rows (Banana, Eggs, Cherry Tomatoes, …), real services
  (Fence Repair, Tractor Repair, …), provenance note present, **zero fabricated
  strings**; `GET /nonexistent` 404 renders honest empty states (guards work);
  server log clean.
- Pre-existing uncommitted user edits (messages.ejs XSS-hardening + send-lock,
  orders.ejs CSRF-header simplification, footer styling) preserved untouched.