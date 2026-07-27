const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const dashboardCtrl = require('../controllers/dashboardController');

// Serve EJS pages
router.get('/dashboard', (req, res) => res.render('dashboard'));
router.get('/marketplace', (req, res) => res.render('marketplace'));
router.get('/services', (req, res) => res.render('services'));
router.get('/produce/new', (req, res) => res.render('post-produce'));
router.get('/services/new', (req, res) => res.render('add-service'));
router.get('/profile', (req, res) => res.render('profile'));

// Protected JSON stats endpoint (called by client-side fetch with Bearer token)
router.get('/api/dashboard/stats', auth, dashboardCtrl.getStats);

module.exports = router;
