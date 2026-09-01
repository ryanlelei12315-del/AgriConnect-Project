# AgriConnectKE upgrade baseline

Recorded before the production-quality upgrade work began.

## Repository state

- Repository: `AgriConnect-Project`
- Git metadata is present, but the sandbox cannot read its status until the owning user marks this checkout as a Git safe directory. No user changes were overwritten as part of the baseline.
- Web stack: Express, EJS, Sequelize, MySQL, cookie/JWT authentication.
- Mobile stack: Expo Router, React Native, React Query, Zustand, TypeScript.

## Baseline checks

| Check | Result |
| --- | --- |
| `node --check` for server, controllers, routes, middleware, models, services and utilities | Passed |
| `npm.cmd run typecheck` in `agriconnect-mobile` | Passed |
| Automated web test suite | Not configured |
| Live database/server smoke test | Not run: this requires local environment credentials and a running MySQL instance |

## Important routes and domains

- Public web: `/`, `/marketplace`, `/services`, `/market-prices`, `/why-us`
- Authenticated web: `/dashboard`, `/produce`, `/orders`, `/messages`, `/notifications`, `/profile`
- Role-protected administration: `/admin`
- API: `/api/auth`, `/api/listings`, `/api/messages`, `/api/dashboard/stats`, `/api/m/*`
- External market-price boundary: Shamba Records through `services/shabaRecordsService.js`

## Models

`User`, `ProduceListing`, `ServiceListing`, `ServiceRequest`, `Order`, `OrderItem`, `Message`, `Notification`, `Review`, and `MarketPrice` form the actively used product domain. `Farm_Fields` and `Crop_Production_Cycles` exist but are not yet exposed through routes or dashboard workflows.

## Migration state

- `scripts/migrate.js` discovers and records numbered files in `database/` in deterministic natural order. It now refuses to guess the state of a populated legacy database with no migration history.
- The legacy `db:migrate` package script only invoked migrations 002--005, even though files 006--010 exist; it is replaced during Phase 1 by the tracked migration runner.
- A fresh local database must first be created from `database.sql`, then advanced with `npm run db:migrate`. `database.sql` drops and recreates its database, so it must never be used against production. A populated database that predates `schema_migrations` needs a schema review and explicit migration baseline before running the new runner.

## Known failures and risks at baseline

- Admin controller rendered missing `admin/dashboard` and `admin/users` views.
- `advisoryController.renderAnswers` rendered a missing view and no advisory route exposed it.
- `public/js/dashboard-views.js` contained unused, fabricated dashboard data.
- The legacy payment route contained placeholder endpoints and `global.mockOrdersDB`; it was not mounted by the server.
- Web tests and a fully repeatable initial-schema migration are absent.

## Phase 1 decisions

- The unmounted, placeholder-only payment route and its unreachable checkout view were removed. Ordering remains a direct buyer/farmer agreement workflow; no payment is presented as integrated.
- The old dashboard mock-data file was removed because no template imported it. Real dashboard data continues to come from `dashboardController.js`.
