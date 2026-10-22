# Endpoint inventory

This is a source-derived inventory, not an OpenAPI contract. “CSRF” applies to unsafe cookie-authenticated requests globally.

| Prefix | Methods/domain | Auth/authorization | Notes |
| --- | --- | --- | --- |
| `/` | landing, login, register, FAQs, marketplace | mixed | Landing redirects authenticated users. |
| `/api/auth` | register, login, logout, me, csrf | rate limited; `me` authenticated | CSRF on unsafe methods. |
| `/api/listings` | browse, create, status, image | authenticated; create farmer; write owner | create has 10-active-listing entitlement check. |
| `/produce` | web listing lifecycle | page auth; farmer create/manage; owner edit/delete | create has same entitlement check. |
| `/orders` | order lifecycle | page/API checks in controller | inspect order service for state machine. |
| `/services` | service listings and requests | mixed; role checks in controller | upload and request validation apply. |
| `/demand-board` | buyer demand posts | route/controller authorization | source: `buyerDemandRoutes.js`. |
| `/api/messages`, `/messages` | messages | authenticated | server-rendered page is page-authenticated. |
| `/market-prices`, `/notifications`, `/profile`, `/reviews`, `/farmers` | supporting domains | mixed | see corresponding route files. |
| `/admin` | admin dashboard/users | authenticated admin | server-side `requireAdmin` is mounted by route. |
| `/api/m` | mobile JSON API | Bearer token per endpoint | Expo client surface. |

Missing from the root route mounting: payment callback, email verification, phone OTP, OAuth, AI chat/RAG, and external MCP connector endpoints.
