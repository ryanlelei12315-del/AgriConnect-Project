/* eslint-env node */
const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderController');
const { requireAuthPage } = require('../middlewares/pageAuth');

router.get('/', requireAuthPage, orderCtrl.renderIndex);
router.get('/new', requireAuthPage, orderCtrl.renderNew);
router.post('/', requireAuthPage, orderCtrl.createOrder);
router.get('/:id', requireAuthPage, orderCtrl.renderShow);
router.post('/:id/status', requireAuthPage, orderCtrl.updateStatus);

module.exports = router;
