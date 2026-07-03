const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const dashboardCtrl = require('../controllers/dashboardController');

// Serve the dashboard page (auth guard is client-side via localStorage)
router.get('/dashboard', (req, res) => res.render('dashboard'));

// Protected JSON stats endpoint (called by client-side fetch with Bearer token)
router.get('/api/dashboard/stats', auth, dashboardCtrl.getStats);

module.exports = router;

