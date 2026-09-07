/* eslint-env node */
const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/reviewController');
const { getToken, verifyToken } = require('../middlewares/pageAuth');

// GET /farmers/:id — public farmer profile (optional auth for 'Message' link)
router.get('/:id', (req, res, next) => {
  const token = getToken(req);
  req.user = token ? verifyToken(token) : null;
  next();
}, reviewCtrl.farmerProfile);

module.exports = router;