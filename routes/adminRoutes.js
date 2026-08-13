/* eslint-env node */
const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { requireAuthPage } = require('../middlewares/pageAuth');
const { requireAdmin } = require('../middlewares/requireAdmin');

// Every admin route requires: authenticated + admin role.
router.use(requireAuthPage, requireAdmin);

// GET /admin — overview
router.get('/', adminCtrl.dashboard);

// GET /admin/users — user list
router.get('/users', adminCtrl.listUsers);

// POST /admin/listings/:id/deactivate — moderation
router.post('/listings/:id/deactivate', adminCtrl.deactivateListing);

module.exports = router;