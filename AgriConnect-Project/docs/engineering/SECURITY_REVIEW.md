# Security review

## Verified controls

- Passwords are bcrypt-hashed in `controllers/authController.js`.
- JWT cookies are httpOnly, Secure in production, and SameSite=Lax.
- Unsafe cookie-authenticated requests pass signed double-submit CSRF validation.
- Auth endpoints and several mutation prefixes have rate limits.
- ORM usage and bound replacements are used in reviewed query paths.
- Listing ownership checks occur before update, image upload, and web edits/deletes.
- The active-listing entitlement is now evaluated server-side in one transaction.

## Priority remediation backlog

1. Introduce a nonce-based CSP and remove `contentSecurityPolicy: false` from `server.js` after template migration.
2. Sniff and normalize uploaded image bytes; move uploads from webroot to managed object storage before untrusted-scale use.
3. Do not return browser JWTs in login responses unless the API client contract requires it; split web and mobile login contracts or use refresh-token rotation.
4. Add email/OTP/OAuth only with actual providers, hashed/single-use tokens, callback validation, and tests.
5. Implement payment callbacks only against official provider documentation, with signature verification and idempotent database state changes.
6. Add dependency auditing and integration tests for authorization, CSRF, upload abuse, and webhook replay.

No security assurance is implied for unimplemented payment, AI, RAG, OAuth, or connector claims.
