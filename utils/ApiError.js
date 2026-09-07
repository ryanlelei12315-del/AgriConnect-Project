/* eslint-env node */
/**
 * ApiError — a controlled application error carrying an HTTP status code.
 *
 * Throwing an ApiError lets controllers signal a specific user-facing
 * problem (e.g. 400 validation, 403 forbidden, 404 not found) WITHOUT
 * leaking internal details to the client. Anything else is treated as an
 * unexpected error and sanitized by the centralized error handler.
 */
class ApiError extends Error {
  /**
   * @param {number} status HTTP status code to return.
   * @param {string} message Safe, user-facing message.
   * @param {object} [options]
   * @param {Error} [options.cause] The original underlying error (logged server-side only).
   */
  constructor(status, message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    if (options.cause) this.cause = options.cause;
  }
}

module.exports = { ApiError };