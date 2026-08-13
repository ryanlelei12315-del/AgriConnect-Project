/* eslint-env node */
const { ProduceListing } = require('../models/ProduceListing');
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/OrderItem');
const { Message } = require('../models/Message');
const { MarketPrice } = require('../models/MarketPrice');
const { ServiceListing } = require('../models/ServiceListing');
const { User } = require('../models/User');
const { Notification } = require('../models/Notification');
const { Op, fn, col, literal } = require('sequelize');

// ── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Build a continuous 6-month sales data array (zero-filled for missing months). */
function buildSalesChartData(rawRows, monthsBack = 6) {
  const now = new Date();
  const labels = [];
  const map = new Map();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    labels.push(MONTH_NAMES[d.getMonth()]);
    map.set(key, 0);
  }

  for (const row of rawRows) {
    const key = `${row.year}-${row.month}`;
    if (map.has(key)) {
      map.set(key, Number(row.total_sales || 0));
    }
  }

  return { salesLabels: labels, salesData: Array.from(map.values()) };
}

/** Get how many months to look back depending on period query param. */
function periodToMonths(period) {
  switch (period) {
    case '12m': return 12;
    case '3m': return 3;
    case '30d': return 1;
    default: return 6; // '6m' or anything else
  }
}

module.exports = {
  renderDashboard: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const isFarmer = role === 'farmer';
      const period = req.query.period || '6m';
      const monthsBack = periodToMonths(period);

      // ── 1. KPI Stats ─────────────────────────────────────────────────────────
      const [activeListingsCount, pendingOrdersCount, unreadMessagesCount] = await Promise.all([
        isFarmer
          ? ProduceListing.count({ where: { farmerId: userId, status: 'LISTED' } })
          : Promise.resolve(0),
        isFarmer
          ? Order.count({ where: { sellerId: userId, status: 'pending' } })
          : Order.count({ where: { userId: userId, status: 'pending' } }),
        Message.count({ where: { recipientId: userId, read: false } }),
      ]);

      // Total Sales (sum of completed orders)
      let totalSales = 0;
      if (isFarmer) {
        const { sequelize } = require('../config/database');
        const [salesResult] = await sequelize.query(
          `SELECT COALESCE(SUM(total_kes), 0) AS total FROM orders WHERE seller_id = ? AND status = 'completed'`,
          { replacements: [userId], type: sequelize.QueryTypes.SELECT }
        );
        totalSales = Number(salesResult?.total || 0);
      }

      // ── 2. Sales Analytics (Chart Data) ─────────────────────────────────────
      let salesLabels = [];
      let salesData = [];
      if (isFarmer) {
        const { sequelize } = require('../config/database');
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsBack + 1);
        startDate.setDate(1);

        const rawSales = await sequelize.query(
          `SELECT YEAR(created_at) AS year, MONTH(created_at) AS month, SUM(total_kes) AS total_sales
           FROM orders
           WHERE seller_id = ? AND status = 'completed' AND created_at >= ?
           GROUP BY YEAR(created_at), MONTH(created_at)
           ORDER BY year, month`,
          {
            replacements: [userId, startDate],
            type: sequelize.QueryTypes.SELECT,
          }
        );

        const built = buildSalesChartData(rawSales, monthsBack);
        salesLabels = built.salesLabels;
        salesData = built.salesData;
      }

      // ── 3. Order Status Distribution (Doughnut) ──────────────────────────────
      let orderStatusLabels = [];
      let orderStatusData = [];
      let hasOrders = false;
      if (isFarmer) {
        const { sequelize } = require('../config/database');
        const orderStatusRows = await sequelize.query(
          `SELECT status, COUNT(*) AS count FROM orders WHERE seller_id = ? GROUP BY status`,
          { replacements: [userId], type: sequelize.QueryTypes.SELECT }
        );
        if (orderStatusRows.length > 0) {
          hasOrders = true;
          orderStatusLabels = orderStatusRows.map(r => r.status.charAt(0).toUpperCase() + r.status.slice(1));
          orderStatusData = orderStatusRows.map(r => Number(r.count));
        }
      }

      // ── 4. Produce Category Distribution ────────────────────────────────────
      let produceCategoryLabels = [];
      let produceCategoryData = [];
      if (isFarmer) {
        const { sequelize } = require('../config/database');
        const catRows = await sequelize.query(
          `SELECT category, COUNT(*) AS count FROM produce_listings WHERE farmer_id = ? AND status = 'LISTED' GROUP BY category`,
          { replacements: [userId], type: sequelize.QueryTypes.SELECT }
        );
        if (catRows.length > 0) {
          produceCategoryLabels = catRows.map(r => r.category);
          produceCategoryData = catRows.map(r => Number(r.count));
        }
      }

      // ── 5. Recent Produce ────────────────────────────────────────────────────
      const recentProduce = isFarmer
        ? await ProduceListing.findAll({
            where: { farmerId: userId },
            order: [['createdAt', 'DESC']],
            limit: 4,
          })
        : [];

      // ── 6. Recent Orders ─────────────────────────────────────────────────────
      const recentOrders = await Order.findAll({
        where: isFarmer ? { sellerId: userId } : { userId: userId },
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'fullName'] },
          { model: User, as: 'seller', attributes: ['id', 'fullName'] },
          {
            model: OrderItem,
            as: 'items',
            limit: 1,
            include: [{ model: ProduceListing, as: 'listing', attributes: ['name'] }],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 5,
      });

      // ── 7. Recent Messages (conversations) ───────────────────────────────────
      let recentMessages = [];
      try {
        const { sequelize } = require('../config/database');
        recentMessages = await sequelize.query(
          `SELECT 
            u.id AS other_user_id,
            u.full_name AS other_user_name,
            m.content AS last_message,
            m.created_at AS last_at,
            SUM(CASE WHEN m.recipient_id = ? AND m.read = 0 THEN 1 ELSE 0 END) AS unread_count
           FROM messages m
           JOIN users u ON u.id = IF(m.sender_id = ?, m.recipient_id, m.sender_id)
           WHERE m.sender_id = ? OR m.recipient_id = ?
           GROUP BY u.id, u.full_name, m.content, m.created_at
           ORDER BY m.created_at DESC
           LIMIT 3`,
          {
            replacements: [userId, userId, userId, userId],
            type: sequelize.QueryTypes.SELECT,
          }
        );
      } catch (e) {
        console.error('Recent messages query error:', e.message);
      }

      // ── 8. Market Prices ─────────────────────────────────────────────────────
      const marketPrices = await MarketPrice.findAll({
        order: [['recordedAt', 'DESC']],
        limit: 4,
      });

      // ── 9. Recommended Services ──────────────────────────────────────────────
      const recommendedServices = await ServiceListing.findAll({
        where: { availability: 'AVAILABLE' },
        include: [{ model: User, as: 'provider', attributes: ['fullName'] }],
        order: [['createdAt', 'DESC']],
        limit: 3,
      });

      // ── Render ───────────────────────────────────────────────────────────────
      res.render('dashboard', {
        user: req.user,
        currentPage: 'dashboard',
        period,
        stats: {
          activeListings: activeListingsCount,
          pendingOrders: pendingOrdersCount,
          unreadMessages: unreadMessagesCount,
          totalSales,
        },
        // Chart data
        salesLabels,
        salesData,
        orderStatusLabels,
        orderStatusData,
        hasOrders,
        produceCategoryLabels,
        produceCategoryData,
        // Content
        recentProduce,
        recentOrders,
        recentMessages,
        marketPrices,
        recommendedServices,
      });
    } catch (err) {
      console.error('Dashboard render error:', err);
      next(err);
    }
  },

  getStats: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const isFarmer = req.user.role === 'farmer';
      const [produce, orders, messages] = await Promise.all([
        isFarmer ? ProduceListing.count({ where: { farmerId: userId, status: 'LISTED' } }) : Promise.resolve(0),
        isFarmer ? Order.count({ where: { sellerId: userId } }) : Order.count({ where: { userId: userId } }),
        Message.count({ where: { recipientId: userId, read: false } }),
      ]);
      return res.json({ success: true, produce, orders, messages });
    } catch (err) {
      next(err);
    }
  },
};
