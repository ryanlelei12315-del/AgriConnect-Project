/* eslint-env node */
const crypto = require('crypto');

/**
 * Signed double-submit-cookie CSRF protection (no third-party dependency).
 *
 * Flow:
 *   1. `initCsrf` runs for every response. If there's no valid `_csrf`
 *      cookie, it issues a signed random token: `token.hmac(token)` and sets
 *      the cookie (readable by our own JS) plus `res.locals.csrfToken`, so
 *      every rendered page can embed it as a hidden `<input name="_csrf">`.
 *   2. `csrfProtect` guards state-changing (unsafe: POST/PUT/PATCH/DELETE)
 *      requests. The submitted token (hidden field or `X-CSRF-Token` header)
 *      must equal the signed value in the cookie AND pass an HMAC check.
 *   3. A cross-site attacker cannot read the victim's cookie (SameSite=Lax)
 *      nor forge a signed token (they lack JWT_SECRET), so the request fails.
 *
 * The AJAX helper in views/partials/scripts.ejs auto-attaches the header.
 */

const COOKIE = '_csrf';
// eslint-disable-next-line no-undef-init
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function hmac(token) {
  return crypto
    .createHmac('sha256', process.env.JWT_SECRET || 'insecure-csrf-secret')
    .update(token)
    .digest('hex');
}

function sign(token) {
  return `${token}.${hmac(token)}`;
}

function validSigned(signed) {
  if (typeof signed !== 'string') return false;
  const idx = signed.lastIndexOf('.');
  if (idx <= 0) return false;
  const token = signed.slice(0, idx);
  const expectedHmac = signed.slice(idx + 1);
  if (!token || !expectedHmac || token.length < 16) return false;
  const a = Buffer.from(hmac(token));
  const b = Buffer.from(String(expectedHmac));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Ensures the visitor has a signed CSRF cookie and exposes the token to views. */
function initCsrf(req, res, next) {
  if (res.locals.csrfToken) return next();

  let signed = req.cookies && req.cookies[COOKIE];
  if (!signed || !validSigned(signed)) {
    signed = sign(crypto.randomBytes(24).toString('hex'));
  }

  res.cookie(COOKIE, signed, {
    httpOnly: false, // readable by our own JS so it can be sent back as a header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 3600 * 1000, // 1 hour
  });

  res.locals.csrfToken = signed;
  next();
}

/** Guards state-changing requests. Mount on mutating routes. */
function csrfProtect(req, res, next) {
  if (!UNSAFE_METHODS.has(req.method)) return next();

  const cookieValue = req.cookies && req.cookies[COOKIE];
  const submitted =
    (req.body && req.body._csrf) ||
    (req.query && req.query._csrf) ||
    (req.headers && req.headers['x-csrf-token']);

  if (!cookieValue || !submitted || cookieValue !== submitted || !validSigned(submitted)) {
    return res.status(403).json({
      success: false,
      message: 'Your session has expired or the request is invalid. Please refresh the page and try again.',
    });
  }

  next();
}

module.exports = { initCsrf, csrfProtect, COOKIE };
