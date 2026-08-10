/* eslint-env node */
const { Message } = require('../models/Message');
const { User } = require('../models/User');
const { Op } = require('sequelize');

/**
 * GET /messages
 * Renders the messages page (conversation list + optional active thread).
 */
async function renderMessagesPage(req, res) {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId ? Number(req.params.userId) : null;

    // Load all conversations for the sidebar list
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { recipientId: userId }],
      },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'fullName'] },
        { model: User, as: 'recipient', attributes: ['id', 'fullName'] },
      ],
    });

    // Group by the "other" participant
    const map = new Map();
    for (const msg of messages) {
      const other = msg.senderId === userId ? msg.recipient : msg.sender;
      if (!other) continue;
      const key = String(other.id);
      if (!map.has(key)) {
        map.set(key, {
          user: other,
          lastMessage: msg.content,
          lastAt: msg.createdAt,
          unread: 0,
        });
      }
      if (msg.recipientId === userId && !msg.read) {
        map.get(key).unread += 1;
      }
    }

    const conversations = Array.from(map.values());

    // If a thread is selected, load it and mark messages as read
    let activeThread = null;
    let activeUser = null;
    if (otherUserId) {
      activeUser = await User.findByPk(otherUserId, { attributes: ['id', 'fullName'] });
      if (activeUser) {
        activeThread = await Message.findAll({
          where: {
            [Op.or]: [
              { senderId: userId, recipientId: otherUserId },
              { senderId: otherUserId, recipientId: userId },
            ],
          },
          order: [['createdAt', 'ASC']],
          include: [
            { model: User, as: 'sender', attributes: ['id', 'fullName'] },
            { model: User, as: 'recipient', attributes: ['id', 'fullName'] },
          ],
        });

        // Mark incoming messages from this user as read
        await Message.update(
          { read: true },
          { where: { senderId: otherUserId, recipientId: userId, read: false } }
        );
      }
    }

    res.render('messages', {
      user: req.user,
      currentPage: 'messages',
      conversations,
      activeThread,
      activeUser,
      activeUserId: otherUserId,
    });
  } catch (err) {
    console.error('Messages page render error:', err.message);
    res.status(500).send('Server Error');
  }
}

/**
 * GET /api/messages?with=<userId>
 * Returns the message thread between the authenticated user and `with`.
 */
async function thread(req, res) {
  try {
    const { with: otherUserId } = req.query;
    if (!otherUserId) {
      return res.status(400).json({ success: false, message: '?with=<userId> is required.' });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: req.user.id, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: req.user.id },
        ],
      },
      order: [['createdAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'fullName'] },
        { model: User, as: 'recipient', attributes: ['id', 'fullName'] },
      ],
    });

    return res.json({ success: true, messages });
  } catch (err) {
    console.error('Message thread error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * GET /api/messages/conversations
 * Returns the list of people the user has exchanged messages with,
 * plus the last message and unread count per conversation.
 */
async function conversations(req, res) {
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ senderId: req.user.id }, { recipientId: req.user.id }],
      },
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'fullName'] },
        { model: User, as: 'recipient', attributes: ['id', 'fullName'] },
      ],
    });

    // Group by the "other" participant
    const map = new Map();
    for (const msg of messages) {
      const other = msg.senderId === req.user.id ? msg.recipient : msg.sender;
      if (!other) continue;
      const key = String(other.id);
      if (!map.has(key)) {
        map.set(key, {
          user: other,
          lastMessage: msg.content,
          lastAt: msg.createdAt,
          unread: 0,
        });
      }
      if (msg.recipientId === req.user.id && !msg.read) {
        map.get(key).unread += 1;
      }
    }

    return res.json({ success: true, conversations: Array.from(map.values()) });
  } catch (err) {
    console.error('Conversations error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * POST /api/messages  { recipient_id, content }
 */
async function send(req, res) {
  try {
    const { recipient_id, content } = req.body;

    if (!recipient_id || !content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'recipient_id and content are required.',
      });
    }
    if (Number(recipient_id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself.' });
    }

    const recipient = await User.findByPk(recipient_id);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found.' });
    }

    const message = await Message.create({
      senderId: req.user.id,
      recipientId: recipient_id,
      content: content.trim(),
      read: false,
    });

    return res.status(201).json({ success: true, message });
  } catch (err) {
    console.error('Message send error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * PATCH /api/messages/read  { with: <userId> }
 * Marks all messages from `with` to me as read.
 */
async function markRead(req, res) {
  try {
    const { with: otherUserId } = req.body;
    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'with is required.' });
    }

    await Message.update(
      { read: true },
      {
        where: { senderId: otherUserId, recipientId: req.user.id, read: false },
      }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error('Message read error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { renderMessagesPage, thread, conversations, send, markRead };
