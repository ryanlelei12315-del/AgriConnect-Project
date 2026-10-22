# Architecture map

```text
Browser (EJS) / Expo mobile
        |
Express (`server.js`): Helmet, CORS, parsers, cookies, CSRF, rate limits
        |
routes/ -> controllers/ -> services/ -> Sequelize models -> MySQL
        |
views/ + public/                         Shamba Records (market-price service)
```

- Entrypoint: `server.js`; associations are loaded from `models/associations.js` before routes.
- Web authentication: JWT in the `auth_token` httpOnly cookie, guarded by `middlewares/pageAuth.js`; JSON APIs use `middlewares/authMiddleware.js` and can use a Bearer token.
- CSRF: signed double-submit cookie in `middlewares/csrf.js`; valid Bearer-token clients are exempt.
- Main domains: users, produce listings, services/service requests, orders/order items, messages, notifications, market prices, reviews, buyer demand.
- External boundary verified: `services/shabaRecordsService.js` for optional market-price data. No verified payment, email, SMS, OAuth, RAG, MCP, or background-job implementation exists at root.

The application is a modular monolith. Keep it that way until operational evidence requires a separate worker/service.
