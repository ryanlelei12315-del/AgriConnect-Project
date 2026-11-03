/* eslint-env node */
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { requireAuthPage } = require('../middlewares/pageAuth');
const dashboardCtrl = require('../controllers/dashboardController');

// Serve the dashboard page (server-side guarded — no more localStorage-only check)
router.get('/dashboard', requireAuthPage, dashboardCtrl.renderDashboard);

// Protected JSON stats endpoint (called by client-side fetch with Bearer token or cookie)
router.get('/api/dashboard/stats', auth, dashboardCtrl.getStats);

module.exports = router;
