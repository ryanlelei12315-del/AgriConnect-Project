/* eslint-env node */
const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/reviewController');
const { requireAuthPage } = require('../middlewares/pageAuth');
const { getToken, verifyToken } = require('../middlewares/pageAuth');

// GET /reviews/new?order_id=<id> — buyer review form (authenticated)
router.get('/new', requireAuthPage, reviewCtrl.renderNew);

// POST /reviews — submit a review (authenticated; CSRF via global middleware)
router.post('/', requireAuthPage, reviewCtrl.create);

// GET /farmers/:id — public farmer profile (optional auth for 'Message' link)
router.get('/farmers/:id', (req, res, next) => {
  const token = getToken(req);
  req.user = token ? verifyToken(token) : null;
  next();
}, reviewCtrl.farmerProfile);

module.exports = router;