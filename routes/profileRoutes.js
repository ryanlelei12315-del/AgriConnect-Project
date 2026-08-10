/* eslint-env node */
const express = require('express');
const router = express.Router();
const profileCtrl = require('../controllers/profileController');
const { requireAuthPage } = require('../middlewares/pageAuth');

router.get('/', requireAuthPage, profileCtrl.renderProfile);
router.post('/update', requireAuthPage, profileCtrl.updateProfile);
router.post('/password', requireAuthPage, profileCtrl.updatePassword);

module.exports = router;
