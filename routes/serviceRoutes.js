/* eslint-env node */
const express = require('express');
const router = express.Router();
const serviceCtrl = require('../controllers/serviceController');
const { requireAuthPage } = require('../middlewares/pageAuth');

// Specific routes first — must come before /:id so Express doesn't treat
// "requests" as a service ID.
router.get('/requests/mine', requireAuthPage, serviceCtrl.renderMyRequests);
router.post('/requests/:id/status', requireAuthPage, serviceCtrl.updateRequestStatus);

// Provider service creation
router.get('/new', requireAuthPage, serviceCtrl.renderNewForm);
router.post('/', requireAuthPage, serviceCtrl.createService);

// Generic :id route last
router.get('/', serviceCtrl.renderIndex);
router.get('/:id', serviceCtrl.renderShow);
router.get('/:id/request', requireAuthPage, serviceCtrl.renderNewRequest);
router.post('/:id/request', requireAuthPage, serviceCtrl.createRequest);

module.exports = router;
