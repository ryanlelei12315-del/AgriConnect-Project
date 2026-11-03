/* eslint-env node */
const express = require('express');
const router = express.Router();
const marketplaceCtrl = require('../controllers/marketplaceController');
const { getToken, verifyToken } = require('../middlewares/pageAuth');

// Optional auth for marketplace
const optionalAuth = (req, res, next) => {
  const token = getToken(req);
  req.user = token ? verifyToken(token) : null;
  next();
};

router.get('/marketplace', optionalAuth, marketplaceCtrl.renderMarketplace);

module.exports = router;
