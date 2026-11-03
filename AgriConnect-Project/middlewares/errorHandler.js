/* eslint-env node */
const { ApiError } = require('../utils/ApiError');

/**
 * Centralized error handler.
 *
 *  - ApiError instances → the exact status + message they carry (safe, intended).
 *  - Sequelize validation errors → a generic 400 with a friendly message.
 *  - Everything else → a sanitized 500 ("Something went wrong") in production,
 *    full details only in development — and always logged server-side.
 *
 * Must be the LAST middleware registered in server.js.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Unexpected/unknown requests that fall through to a 404 are not errors here;
  // the 404 catch-all handles those. This only runs for thrown errors.

  if (err instanceof ApiError) {
    console.error(`[api-error] ${err.status} ${err.message}`, err.cause || '');
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  // Handle Sequelize validation/unique errors with a friendly message
  const isSequelizeError = err && typeof err.name === 'string' && /sequelize|validation|uniqueconstraint/i.test(err.name);

  if (isSequelizeError) {
    console.error('[db-error]', err.name, err.message);
    return res.status(400).json({
      success: false,
      message: 'One or more fields are invalid. Please check your input and try again.',
    });
  }

  // Unexpected error — log fully, respond sanitized.
  console.error('[unhandled-error]', err);

  const isProd = process.env.NODE_ENV === 'production';
  const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  const safeStatus = status >= 500 || status < 400 ? 500 : status;

  return res.status(safeStatus).json({
    success: false,
    message: isProd ? 'Something went wrong. Please try again.' : err.message || 'Something went wrong.',
  });
}

module.exports = { errorHandler };