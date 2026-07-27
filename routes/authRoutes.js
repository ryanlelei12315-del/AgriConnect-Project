const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

// POST /api/auth/register
router.post('/register', authCtrl.register);

// POST /api/auth/login
router.post('/login', authCtrl.login);

// PUT /api/auth/profile - Protected route to update profile details
router.put('/profile', auth, authCtrl.updateProfile);

module.exports = router;
