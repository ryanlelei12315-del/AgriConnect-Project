/* eslint-env node */
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const listingCtrl = require('../controllers/listingController');
const { uploadSingle } = require('../middlewares/upload');

// Public browse (authenticated)
router.get('/', auth, listingCtrl.list);

// Farmer-only create
router.post('/', auth, listingCtrl.create);

// Owner-only status transition
router.patch('/:id/status', auth, listingCtrl.updateStatus);

// Owner-only image upload
router.post('/:id/image', auth, uploadSingle('image'), listingCtrl.uploadImage);

module.exports = router;
