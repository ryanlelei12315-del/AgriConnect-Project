/* eslint-env node */
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const messageCtrl = require('../controllers/messageController');

// Search users by name or phone number (used by the "New chat" modal)
router.get('/users', auth, messageCtrl.searchUsers);

// Conversation list
router.get('/conversations', auth, messageCtrl.conversations);

// Thread with a specific user
router.get('/', auth, messageCtrl.thread);

// Send a message
router.post('/', auth, messageCtrl.send);

// Mark thread as read
router.patch('/read', auth, messageCtrl.markRead);

module.exports = router;
