/* eslint-env node */
const express = require('express');
const router = express.Router();
const marketPriceCtrl = require('../controllers/marketPriceController');
const { getToken, verifyToken } = require('../middlewares/pageAuth');

const optionalAuth = (req, res, next) => {
  const token = getToken(req);
  req.user = token ? verifyToken(token) : null;
  next();
};

router.get('/', optionalAuth, marketPriceCtrl.renderIndex);

module.exports = router;
