/* eslint-env node */
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const listingCtrl = require('../controllers/listingController');

// Public browse (authenticated)
router.get('/', auth, listingCtrl.list);

// Farmer-only create
router.post('/', auth, listingCtrl.create);

// Owner-only status transition
router.patch('/:id/status', auth, listingCtrl.updateStatus);

module.exports = router;
