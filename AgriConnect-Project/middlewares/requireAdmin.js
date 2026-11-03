/* eslint-env node */
const { ApiError } = require('../utils/ApiError');

/**
 * Guard for admin-only routes. Requires:
 *   1. An authenticated user (req.user populated by requireAuthPage/auth).
 *   2. The user's role to be 'admin'.
 *
 * This is a backend check — it does NOT rely on hiding admin buttons in the UI.
 */
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.id) {
    return next(new ApiError(401, 'You must be signed in to access this page.'));
  }
  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'You do not have permission to access this page.'));
  }
  next();
}

module.exports = { requireAdmin };