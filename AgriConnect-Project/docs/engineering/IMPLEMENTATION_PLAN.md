# Implementation plan and checklist

- [x] Inventory root stack, entrypoint, models, routes, migrations, environment template, and existing docs.
- [x] Establish syntax/test baseline and record constraints.
- [x] Fix server-enforced free-tier active listing policy (10) across root creation paths.
- [x] Add focused entitlement tests and an executable test command.
- [x] Produce source-based architecture, endpoint, data, and security documentation.
- [ ] Run `npm run db:migrate` against a verified non-production database. The tracked `scripts/migrate.js` discovers numbered SQL migrations safely; legacy `scripts/run_migration.js` only runs migration 006 and must not be used for this change.
- [x] Add listing pagination, safe sort allowlist, lifecycle integration tests, and transactional state-transition checks.
- [x] Reconcile README feature claims with mounted root code.
- [ ] Design email/phone/OAuth after selecting providers and registering secrets/redirect URIs.
- [ ] Audit the actual payment provider documentation and existing deployment before implementing payment initiation/webhooks.
- [ ] Select approved agricultural sources and build a separately evaluated RAG adapter; do not ingest sources or claim citations before approval.
- [ ] Add optional feature-flagged connectors after OAuth consent, authorization, and user-confirmation designs are approved.
- [ ] Normalize region configuration only after supported markets/countries are confirmed.

## Acceptance criteria for the completed slice

1. A free farmer can create listings 1–10, but receives a clear 403/HTML error at 11.
2. Two concurrent creation attempts cannot both exceed the cap for one user.
3. The Starter seed and upgrade migration both specify 10.
4. Existing editing behavior remains slot-neutral.
