const { User } = require('../models/User');
const { Farm_Fields } = require('../models/Farm_Fields');
const { Order } = require('../models/Order');
const { Message } = require('../models/Message');
const { Produce } = require('../models/Produce');
const { Service } = require('../models/Service');

/**
 * GET /api/dashboard/stats
 * Returns JSON stats for the authenticated user's dashboard.
 * Expects `req.user` populated by auth middleware (contains id, email, role).
 */
module.exports = {
  getStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const role = req.user.role;

      let produceCount = 0;
      let ordersCount = 0;
      let messagesCount = 0;

      if (role === 'farmer') {
        // Farmers: count their listed produce, orders, and unread messages
        [produceCount, ordersCount, messagesCount] = await Promise.all([
          Produce.count({ where: { userId } }),
          Order.count({ where: { userId } }),
          Message.count({ where: { recipientId: userId, read: false } }),
        ]);
      } else if (role === 'provider') {
        // Providers: count their listed services, bookings/orders, and unread messages
        [produceCount, ordersCount, messagesCount] = await Promise.all([
          Service.count({ where: { providerId: userId } }),
          Order.count({ where: { userId } }),
          Message.count({ where: { recipientId: userId, read: false } }),
        ]);
      } else {
        // Buyers: count available marketplace produce, their own purchase orders, and unread messages
        [produceCount, ordersCount, messagesCount] = await Promise.all([
          Produce.count({ where: { available: true } }),
          Order.count({ where: { userId } }),
          Message.count({ where: { recipientId: userId, read: false } }),
        ]);
      }

      return res.json({
        success: true,
        produce: produceCount,
        orders: ordersCount,
        messages: messagesCount,
      });
    } catch (err) {
      console.error('Dashboard stats error:', err.message);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};
