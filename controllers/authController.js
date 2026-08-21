/* eslint-env node */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { TOKEN_COOKIE } = require('../middlewares/pageAuth');
require('dotenv').config();

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

/** Set the JWT as an httpOnly cookie (XSS-safe) + return it in the body for API clients. */
function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

/** Sign a JWT for a user. */
function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.fullName,
      role: user.role,
      county: user.county || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

/** Public user shape (never expose password hash). */
function publicUser(user) {
  return {
    id: user.id,
    full_name: user.fullName,
    email: user.email,
    phone_number: user.phoneNumber,
    county: user.county,
    role: user.role,
  };
}

// ── Register ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { full_name, email, phone_number, password, role, county } = req.body;

    // Basic validation
    if (!full_name || !password || (!email && !phone_number)) {
      return res.status(400).json({
        success: false,
        message: 'full_name, password, and either email or phone_number are required.',
      });
    }

    // Valid roles
    const validRoles = ['farmer', 'buyer', 'provider'];
    const userRole = validRoles.includes(role) ? role : 'farmer';

    // Check for existing user
    if (email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
      }
    }
    if (phone_number) {
      const existing = await User.findOne({ where: { phone_number } });
      if (existing) {
        return res
          .status(409)
          .json({ success: false, message: 'Phone number already registered.' });
      }
    }

    // Hash password
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await User.create({
      fullName: full_name,
      email: email || null,
      phoneNumber: phone_number || null,
      county: county || null,
      password: hashed,
      role: userRole,
    });

    // Sign JWT + set httpOnly cookie
    const token = signToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// ── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, phone_number, password } = req.body;

    if (!password || (!email && !phone_number)) {
      return res.status(400).json({
        success: false,
        message: 'password and either email or phone_number are required.',
      });
    }

    // Find user
    const whereClause = email ? { email } : { phone_number };
    const user = await User.findOne({ where: whereClause });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    // Sign JWT + set httpOnly cookie
    const token = signToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// ── Logout ───────────────────────────────────────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie(TOKEN_COOKIE, { path: '/' });
  res.clearCookie('_csrf', { path: '/' });
  return res.json({ success: true, message: 'Logged out.' });
};

// ── CSRF token endpoint ──────────────────────────────────────────────────────
// Returns a fresh, current CSRF token and (via initCsrf) sets the matching
// `_csrf` cookie. Clients use this to self-heal when a previously-rendered
// page token goes stale (e.g. the 1-hour cookie expired) instead of getting
// stuck on a dead-end 403 "session expired" banner.
exports.csrfToken = (req, res) => {
  return res.json({ success: true, csrfToken: res.locals.csrfToken });
};

// ── Me ───────────────────────────────────────────────────────────────────────
exports.me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    console.error('Me error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};
