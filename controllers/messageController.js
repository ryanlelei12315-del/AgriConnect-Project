/* eslint-env node */
const { Message } = require('../models/Message');
const { User } = require('../models/User');
const { Notification } = require('../models/Notification');
const { Op } = require('sequelize');
const { ApiError } = require('../utils/ApiError');

/**
 * GET /messages — renders conversation list + optional active thread.
 */
async function renderMessagesPage(req, res, next) {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.userId ? Number(req.params.userId) : null;

    // Group conversations at the DB level instead of pulling every message.
    const { sequelize } = require('../config/database');
    const grouped = await sequelize.query(
      `SELECT
         other.id AS other_user_id,
         other.full_name AS other_full_name,
         last.content AS last_message,
         last.created_at AS last_at,
         SUM(CASE WHEN m.recipient_id = :me AND m.read = 0 THEN 1 ELSE 0 END) AS unread
       FROM messages m
       JOIN (
         SELECT id, sender_id, recipient_id, content, created_at,
                ROW_NUMBER() OVER (PARTITION BY
                  LEAST(sender_id, recipient_id),
                  GREATEST(sender_id, recipient_id)
                  ORDER BY created_at DESC) AS rn
         FROM messages
       ) last ON last.id = m.id
       JOIN users other ON other.id = IF(m.sender_id = :me, m.recipient_id, m.sender_id)
       WHERE (m.sender_id = :me OR m.recipient_id = :me)
       GROUP BY other.id, other.full_name, last.content, last.created_at
       ORDER BY last.created_at DESC`,
      { replacements: { me: userId }, type: sequelize.QueryTypes.SELECT }
    );

    const conversations = grouped.map((g) => ({
      user: { id: g.other_user_id, fullName: g.other_full_name },
      lastMessage: g.last_message,
      lastAt: g.last_at,
      unread: Number(g.unread),
    }));

    let activeThread = null;
    let activeUser = null;
    if (otherUserId) {
      activeUser = await User.findByPk(otherUserId, { attributes: ['id', 'fullName'] });
      if (!activeUser) return next(new ApiError(404, 'User not found.'));

      const thread = await sequelize.query(
        `SELECT m.id, m.sender_id AS senderId, m.recipient_id AS recipientId,
                m.content, m.created_at AS createdAt
         FROM messages m
         WHERE (m.sender_id = :me AND m.recipient_id = :other)
            OR (m.sender_id = :other AND m.recipient_id = :me)
         ORDER BY m.created_at ASC`,
        { replacements: { me: userId, other: otherUserId }, type: sequelize.QueryTypes.SELECT }
      );
      activeThread = thread.map((t) => ({
        id: t.id, senderId: t.senderId, recipientId: t.recipientId,
        content: t.content, createdAt: t.createdAt,
      }));

      // Mark incoming from this user as read.
      await Message.update({ read: true }, { where: { senderId: otherUserId, recipientId: userId, read: false } });
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
    next(err);
  }
  }

  /**
   * GET /api/messages?with=<userId> — returns the full thread as JSON.
   */
  async function thread(req, res, next) {
  try {
    const otherUserId = Number(req.query.with);
    if (!otherUserId) return res.status(400).json({ success: false, message: '?with=<userId> is required.' });

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
    next(err);
  }
}

/**
 * POST /api/messages { recipient_id, content }
 * Persists the message and notifies the recipient.
 */
async function send(req, res, next) {
  try {
    const { recipient_id, content } = req.body;

    if (!recipient_id || !content || !String(content).trim()) {
      return res.status(400).json({ success: false, message: 'recipient_id and content are required.' });
    }
    if (String(content).trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Message is too long (max 2000 characters).' });
    }
    if (Number(recipient_id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot message yourself.' });
    }

    const recipient = await User.findByPk(recipient_id);
    if (!recipient) return res.status(404).json({ success: false, message: 'Recipient not found.' });

    const message = await Message.create({
      senderId: req.user.id,
      recipientId: recipient_id,
      content: String(content).trim(),
      read: false,
    });

    // Keep the recipient's unread badge accurate.
    await Notification.create({
      userId: recipient.id,
      title: 'New Message',
      message: 'You have a new message.',
      type: 'MESSAGE',
      relatedId: message.id,
    }).catch(() => {});

    return res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/messages/conversations — returns conversation list as JSON.
 */
async function conversations(req, res, next) {
  try {
    const userId = req.user.id;
    const { sequelize } = require('../config/database');

    const grouped = await sequelize.query(
      `SELECT
         other.id AS other_user_id,
         other.full_name AS other_full_name,
         last.content AS last_message,
         last.created_at AS last_at,
         SUM(CASE WHEN m.recipient_id = :me AND m.read = 0 THEN 1 ELSE 0 END) AS unread
       FROM messages m
       JOIN (
         SELECT id, sender_id, recipient_id, content, created_at,
                ROW_NUMBER() OVER (PARTITION BY
                  LEAST(sender_id, recipient_id),
                  GREATEST(sender_id, recipient_id)
                  ORDER BY created_at DESC) AS rn
         FROM messages
       ) last ON last.id = m.id
       JOIN users other ON other.id = IF(m.sender_id = :me, m.recipient_id, m.sender_id)
       WHERE (m.sender_id = :me OR m.recipient_id = :me)
       GROUP BY other.id, other.full_name, last.content, last.created_at
       ORDER BY last.created_at DESC`,
      { replacements: { me: userId }, type: sequelize.QueryTypes.SELECT }
    );

    const conversations = grouped.map((g) => ({
      user: { id: g.other_user_id, fullName: g.other_full_name },
      lastMessage: g.last_message,
      lastAt: g.last_at,
      unread: Number(g.unread),
    }));

    return res.json({ success: true, conversations });
  } catch (err) {
    console.error('Conversations error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * PATCH /api/messages/read { with: <userId> }
 */
async function markRead(req, res, next) {
  try {
    const otherUserId = Number(req.body.with);
    if (!otherUserId) return res.status(400).json({ success: false, message: 'with is required.' });

    await Message.update({ read: true }, { where: { senderId: otherUserId, recipientId: req.user.id, read: false } });
    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { renderMessagesPage, thread, send, markRead, conversations };