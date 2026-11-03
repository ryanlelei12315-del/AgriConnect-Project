/* eslint-env node */
const express = require('express');
const router = express.Router();
const notificationCtrl = require('../controllers/notificationController');
const { requireAuthPage } = require('../middlewares/pageAuth');

router.get('/', requireAuthPage, notificationCtrl.renderIndex);

module.exports = router;
