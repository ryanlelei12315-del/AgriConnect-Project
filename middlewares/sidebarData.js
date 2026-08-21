/* eslint-env node */
const { Order } = require('../models/Order');
const { Message } = require('../models/Message');
const { Notification } = require('../models/Notification');

/**
 * Attaches sidebar badge counts + recent notifications to res.locals so
 * sidebar.ejs / sidebarPanels.ejs can render them without each controller
 * having to fetch them individually. Runs after requireAuthPage sets req.user.
 */
async function loadSidebarData(req, res, next) {
  if (!req.user || !req.user.id) return next();

  try {
    const userId = req.user.id;
    const isFarmer = req.user.role === 'farmer';

    const [unreadMessagesCount, pendingOrdersCount, unreadNotificationsCount, recentNotifications] =
      await Promise.all([
        // Message model: field `read` (boolean), attribute `recipientId`
        Message.count({ where: { recipientId: userId, read: false } }).catch(() => 0),
        // Order model: status lowercase enum
        isFarmer
          ? Order.count({ where: { sellerId: userId, status: 'pending' } }).catch(() => 0)
          : Order.count({ where: { userId: userId, status: 'pending' } }).catch(() => 0),
        // Notification model: field `isRead`
        Notification.count({ where: { userId: userId, isRead: false } }).catch(() => 0),
        // Recent notifications for the sidebar widget
        Notification.findAll({ where: { userId }, order: [['createdAt', 'DESC']], limit: 5 }).catch(() => []),
      ]);

    res.locals.unreadMessagesCount = unreadMessagesCount;
    res.locals.pendingOrdersCount = pendingOrdersCount;
    res.locals.unreadNotificationsCount = unreadNotificationsCount;
    res.locals.recentNotifications = recentNotifications;
    // Make sure user is always available to all authenticated views
    res.locals.user = req.user;
    next();
  } catch (err) {
    console.error('Sidebar data load error:', err.message);
    res.locals.unreadMessagesCount = 0;
    res.locals.pendingOrdersCount = 0;
    res.locals.unreadNotificationsCount = 0;
    res.locals.recentNotifications = [];
    res.locals.user = req.user;
    next();
  }
}

module.exports = { loadSidebarData };
