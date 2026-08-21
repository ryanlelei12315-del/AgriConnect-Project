/* eslint-env node */
const express = require('express');
const router = express.Router();
const produceCtrl = require('../controllers/produceController');
const { requireAuthPage } = require('../middlewares/pageAuth');

// Farmer produce management dashboard
router.get('/', requireAuthPage, produceCtrl.renderProduceIndex);

// Protected routes (require user to be logged in and role specific in controller)
router.get('/new', requireAuthPage, produceCtrl.renderNewForm);
router.post('/', requireAuthPage, produceCtrl.createProduce);

// Public route for viewing produce (but can check auth status)
router.get('/:id', produceCtrl.renderShow);

// Protected routes for editing/deleting
router.get('/:id/edit', requireAuthPage, produceCtrl.renderEditForm);
router.post('/:id/update', requireAuthPage, produceCtrl.updateProduce);
router.post('/:id/delete', requireAuthPage, produceCtrl.deleteProduce);

module.exports = router;
