/* eslint-env node */
const { Notification } = require('../models/Notification');

module.exports = {
  renderIndex: async (req, res) => {
    try {
      const notifications = await Notification.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      // Mark all as read when viewed
      await Notification.update(
        { isRead: true },
        { where: { userId: req.user.id, isRead: false } }
      );

      res.render('notifications', { user: req.user, notifications });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
};
