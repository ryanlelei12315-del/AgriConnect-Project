/* eslint-env node */
const jwt = require('jsonwebtoken');

const TOKEN_COOKIE = 'agri_token';

/**
 * Resolve the JWT from either the httpOnly cookie (server-rendered pages)
 * or the Authorization header (fetch/API calls).
 * @param {import('express').Request} req
 * @returns {string | null}
 */
function getToken(req) {
  if (req.cookies && req.cookies[TOKEN_COOKIE]) return req.cookies[TOKEN_COOKIE];
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  return null;
}

/**
 * Verify a JWT. Returns the payload or null.
 * @param {string} token
 * @returns {object | null}
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Server-side page guard. Redirects unauthenticated visitors to /login.
 * This replaces the old client-only localStorage check.
 */
function requireAuthPage(req, res, next) {
  const token = getToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.redirect('/login');
  req.user = payload;
  
  const { loadSidebarData } = require('./sidebarData');
  loadSidebarData(req, res, next);
}

/**
 * Sends already-authenticated users away from public pages (/, /login, /register).
 */
function redirectIfAuthed(req, res, next) {
  const token = getToken(req);
  const payload = token ? verifyToken(token) : null;
  if (payload) return res.redirect('/dashboard');
  next();
}

module.exports = { requireAuthPage, redirectIfAuthed, verifyToken, getToken, TOKEN_COOKIE };
