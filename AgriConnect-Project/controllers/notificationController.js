/* eslint-env node */
const { Notification } = require('../models/Notification');
const { ApiError } = require('../utils/ApiError');
const { sanitize } = require('../utils/sanitize');
const { integerId } = require('../utils/validation');

module.exports = {
  // GET /notifications — list (marks all as read when viewed)
  renderIndex: async (req, res, next) => {
    try {
      const notifications = await Notification.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 50,
      });

      // Viewing the page counts as reading all notifications.
      await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });

      res.render('notifications', { user: req.user, notifications: notifications.map((n) => ({
        ...n.toJSON(),
        message: sanitize(n.message),
        title: sanitize(n.title),
      })) });
    } catch (err) {
      next(err);
    }
  },

  // POST /notifications/:id/read — mark a single notification as read
  markRead: async (req, res, next) => {
    try {
      const idRes = integerId(req.params.id, 'notification');
      if (!idRes.ok) throw new ApiError(400, idRes.error);

      const notification = await Notification.findOne({ where: { id: idRes.value, userId: req.user.id } });
      if (!notification) throw new ApiError(404, 'Notification not found.');

      notification.isRead = true;
      await notification.save();
      res.redirect('/notifications');
    } catch (err) {
      next(err);
    }
  },
};