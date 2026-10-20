/* eslint-env node */
const express = require('express');
const router = express.Router();
const { requireAuthPage } = require('../middlewares/pageAuth');
const controller = require('../controllers/buyerDemandController');

router.get('/', requireAuthPage, controller.renderBoard);
router.post('/', requireAuthPage, controller.create);
router.post('/:id/status', requireAuthPage, controller.updateStatus);

module.exports = router;
