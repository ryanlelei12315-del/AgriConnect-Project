/* eslint-env node */
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

// POST /api/auth/register
router.post('/register', authCtrl.register);

// POST /api/auth/login
router.post('/login', authCtrl.login);

// POST /api/auth/logout
router.post('/logout', authCtrl.logout);

// GET /api/auth/me (protected)
router.get('/me', auth, authCtrl.me);

// GET /api/auth/csrf (returns a fresh token + cookie; used for self-healing stale CSRF)
router.get('/csrf', authCtrl.csrfToken);

// ── WhatsApp phone verification ──────────────────────────────────────────
// POST /api/auth/phone/send   — send a 6-digit OTP via WhatsApp
// POST /api/auth/phone/verify  — validate an OTP (used for registration & profile verification)
// POST /api/auth/phone/login   — passwordless login: validate OTP + issue JWT

// Public: no auth required (no auth token yet)
router.post('/phone/send', authCtrl.sendPhoneVerification);
router.post('/phone/verify', authCtrl.verifyPhoneOTP);
router.post('/phone/login', authCtrl.whatsappLogin);

// Protected: verify/update phone for an existing authenticated user
router.post('/phone/verify-existing', auth, authCtrl.verifyPhoneOTP);

module.exports = router;
