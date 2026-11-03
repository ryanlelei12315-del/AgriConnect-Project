/* eslint-env node */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { TOKEN_COOKIE } = require('../middlewares/pageAuth');
const whatsappService = require('../services/whatsappService');
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
    is_phone_verified: user.isPhoneVerified || false,
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
  // Server-rendered forms should return to a useful page; API/mobile clients
  // retain the JSON contract used by the existing clients.
  if (req.accepts(['html', 'json']) === 'html') return res.redirect('/');
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

// ── WhatsApp: Send verification code ─────────────────────────────────────
// Sends a 6-digit OTP via WhatsApp to the given phone number.
// Body: { phone_number, purpose }  purpose ∈ { 'register', 'login', 'verify' }
// No authentication required — used before registration/login.
exports.sendPhoneVerification = async (req, res) => {
  try {
    const { phone_number, purpose } = req.body;

    if (!phone_number || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'phone_number and purpose are required.',
      });
    }

    const validPurposes = ['register', 'login', 'verify'];
    if (!validPurposes.includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: `Invalid purpose. Must be one of: ${validPurposes.join(', ')}`,
      });
    }

    let normalizedPhone;
    try {
      normalizedPhone = whatsappService.normalizePhone(phone_number);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const result = await whatsappService.sendVerificationCode(normalizedPhone, purpose);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    // In dev mode (no real WhatsApp credentials) the code is echoed back so
    // the mobile/web client can auto-fill it for a smooth demo experience.
    return res.status(200).json({
      success: true,
      message: result.message,
      code: result.code,
    });
  } catch (err) {
    console.error('sendPhoneVerification error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error sending verification code.' });
  }
};

// ── WhatsApp: Verify code ────────────────────────────────────────────────
// Validates a 6-digit OTP. If purpose === 'verify', the user (if found by
// phone number) is marked as phone-verified in the database.
// Body: { phone_number, purpose, code }
exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { phone_number, purpose, code } = req.body;

    if (!phone_number || !purpose || !code) {
      return res.status(400).json({
        success: false,
        message: 'phone_number, purpose, and code are required.',
      });
    }

    let normalizedPhone;
    try {
      normalizedPhone = whatsappService.normalizePhone(phone_number);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const result = whatsappService.validateCode(normalizedPhone, purpose, code);

    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.error });
    }

    // For the "verify" purpose, mark an existing user's phone as verified
    if (purpose === 'verify') {
      const user = await User.findOne({ where: { phone_number: normalizedPhone } });
      if (user && !user.isPhoneVerified) {
        user.isPhoneVerified = true;
        user.phoneVerifiedAt = new Date();
        await user.save();
      }
    }

    return res.status(200).json({ success: true, message: 'Phone number verified.' });
  } catch (err) {
    console.error('verifyPhoneOTP error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
};

// ── WhatsApp: Passwordless login ─────────────────────────────────────────
// Validates an OTP (purpose: 'login') and, if the user exists, authenticates
// them by issuing a JWT + httpOnly cookie.
// Body: { phone_number, code }
exports.whatsappLogin = async (req, res) => {
  try {
    const { phone_number, code } = req.body;

    if (!phone_number || !code) {
      return res.status(400).json({ success: false, message: 'phone_number and code are required.' });
    }

    let normalizedPhone;
    try {
      normalizedPhone = whatsappService.normalizePhone(phone_number);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    // Validate the OTP (purpose: login)
    const result = whatsappService.validateCode(normalizedPhone, 'login', code);

    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.error });
    }

    // Find the user by phone number
    const user = await User.findOne({ where: { phone_number: normalizedPhone } });

    if (!user) {
      // No account with this phone — client should redirect to registration.
      return res.status(404).json({
        success: false,
        message: 'No account found for this phone number. Please register first.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Clear the used OTP
    whatsappService.clearCode(normalizedPhone, 'login');

    const token = signToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('whatsappLogin error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};
