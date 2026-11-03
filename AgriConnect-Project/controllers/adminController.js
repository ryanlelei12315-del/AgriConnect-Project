/* eslint-env node */
const { User } = require('../models/User');
const { ProduceListing } = require('../models/ProduceListing');
const { Order } = require('../models/Order');
const { ServiceListing } = require('../models/ServiceListing');
const { OrderItem } = require('../models/OrderItem');
const { sequelize } = require('../config/database');
const { ApiError } = require('../utils/ApiError');

/**
 * Minimal admin foundation (Phase 14).
 * Covers: platform overview counts, recent platform activity, listing
 * moderation (deactivate a produce listing). Every route is guarded by
 * requireAdmin in the route file — buttons being hidden is irrelevant.
 */
module.exports = {
  // GET /admin
  dashboard: async (req, res, next) => {
    try {
      const [users, listings, orders, services, totalSalesResult] = await Promise.all([
        User.count(),
        ProduceListing.count(),
        Order.count(),
        ServiceListing.count(),
        sequelize.query(
          `SELECT COALESCE(SUM(total_kes), 0) AS total FROM orders WHERE status = 'completed'`,
          { type: sequelize.QueryTypes.SELECT }
        ),
      ]);

      // Recent platform activity, one query each domain.
      const recentUsers = await User.findAll({ order: [['createdAt', 'DESC']], limit: 5 });
      const recentListings = await ProduceListing.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName'] }],
      });
      const recentOrders = await Order.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'fullName'] },
          { model: User, as: 'seller', attributes: ['id', 'fullName'] },
          { model: OrderItem, as: 'items', limit: 1, include: [{ model: ProduceListing, as: 'listing', attributes: ['name'] }] },
        ],
      });

      res.render('admin/dashboard', {
        user: req.user,
        currentPage: 'admin',
        stats: {
          users,
          listings,
          orders,
          services,
          totalSales: Number(totalSalesResult[0]?.total || 0),
        },
        recentUsers,
        recentListings,
        recentOrders,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /admin/users
  listUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'fullName', 'email', 'phoneNumber', 'county', 'role', 'createdAt'],
        limit: 100,
      });
      res.render('admin/users', { user: req.user, currentPage: 'admin', users });
    } catch (err) {
      next(err);
    }
  },

  // POST /admin/listings/:id/deactivate
  deactivateListing: async (req, res, next) => {
    try {
      if (!/^\d+$/.test(req.params.id)) throw new ApiError(400, 'Invalid listing id.');

      const listing = await ProduceListing.findByPk(req.params.id);
      if (!listing) throw new ApiError(404, 'Listing not found.');

      await listing.update({ status: 'INACTIVE' });
      res.redirect('/admin');
    } catch (err) {
      next(err);
    }
  },
};