/* eslint-env node */
const express = require('express');
const router = express.Router();
const serviceCtrl = require('../controllers/serviceController');
const { requireAuthPage } = require('../middlewares/pageAuth');

router.get('/', serviceCtrl.renderIndex);
router.get('/:id', serviceCtrl.renderShow);
router.get('/:id/request', requireAuthPage, serviceCtrl.renderNewRequest);
router.post('/:id/request', requireAuthPage, serviceCtrl.createRequest);

// Service provider inbox + request management
router.get('/requests/mine', requireAuthPage, serviceCtrl.renderMyRequests);
router.post('/requests/:id/status', requireAuthPage, serviceCtrl.updateRequestStatus);

module.exports = router;
