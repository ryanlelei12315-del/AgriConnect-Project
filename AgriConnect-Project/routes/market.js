const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketPriceController');

router.get('/market-prices', marketController.renderIndex);
router.post('/market-prices/cache/clear', marketController.clearCache);
router.get('/market-prices/cache/stats', marketController.getCacheStats);

module.exports = router;