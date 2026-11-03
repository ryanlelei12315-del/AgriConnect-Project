# Codebase audit

Audit date: 2026-10-21. Scope: repository root only; `AgriConnect-Project/` is an existing modified nested checkout and was not changed.

## Verified baseline

| Item | Evidence | Result |
| --- | --- | --- |
| Web application | `server.js` | Express 4, EJS, Sequelize, MySQL |
| Mobile client | `agriconnect-mobile/` | Expo Router / TypeScript |
| Dependency installation | `node_modules/` exists | present; lockfile exists |
| Web tests | original `package.json` | no test runner configured |
| Syntax | `node --check` over root JavaScript | passed |
| Live database | `config/database.js` requires environment credentials | not run |

## Verified issues

| Severity | Finding and evidence | Impact | Fix/status |
| --- | --- | --- | --- |
| High | Both `controllers/produceController.js` and `controllers/listingController.js` created `LISTED` rows directly; no entitlement check existed. | Free users could exceed the requested active-listing allowance, including by concurrent requests. | Fixed with `services/entitlementService.js`; both web/API paths use a user-row lock and transaction. |
| High | `database/011_monetization_system.sql` seeded Starter with 3 active listings. | Product policy conflicted with the required 10. | Fresh seed updated; additive `012_set_free_listing_limit.sql` upgrades existing schemas. |
| High | `README.md` names payment controllers/routes/services and migration tooling that are absent from the root tree; `package.json` originally had no matching scripts. | Deployment and feature claims are misleading. | Documented; do not expose payment functionality until an audited provider integration exists. |
| Medium | `server.js` disables Helmet CSP because templates use inline script. | A CSP safety boundary is absent. | Deferred: needs nonce/hash template migration and browser regression testing. |
| Medium | Image upload checks MIME string and extension in `middlewares/upload.js`, but does not inspect bytes or transform uploads. | A spoofed image may be stored. | Deferred: add content sniffing/normalization and isolated object storage. |
| Medium | README claims email, OTP, Google OAuth, RAG and MCP integrations, but root source has no implementation. | Users/operators could assume security or integrations that do not exist. | Documented as unimplemented, not inferred. |
| Low | `Farm_Fields` and `Crop_Production_Cycles` models are not routed. | Dead/unfinished domain surface. | Confirm product workflow before exposing. |

## Assumptions explicitly not verified

No running MySQL schema, provider credentials, callback endpoint, SMTP/SMS account, Google OAuth client, hosted environment, or production data was available. No external payment, email, SMS, AI, or MCP action was performed.
