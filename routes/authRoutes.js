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

module.exports = router;
