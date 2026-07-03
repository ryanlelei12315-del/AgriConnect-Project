const { User } = require('../models/User');
const { Farm_Fields } = require('../models/Farm_Fields');
const { Crop_Production_Cycles } = require('../models/Crop_Production_Cycles');
const { Order } = require('../models/Order');
const { Message } = require('../models/Message');

/**
 * GET /api/dashboard/stats
 * Returns JSON stats for the authenticated user's dashboard.
 * Expects `req.user` populated by auth middleware (contains at least `id`).
 */
module.exports = {
  getStats: async (req, res) => {
    try {
      const [produce, orders, messages] = await Promise.all([
        Farm_Fields.count({ where: { userId: req.user.id } }),
        Order.count({ where: { userId: req.user.id } }),
        Message.count({ where: { recipientId: req.user.id, read: false } }),
      ]);

      return res.json({ success: true, produce, orders, messages });
    } catch (err) {
      console.error('Dashboard stats error:', err.message);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};
