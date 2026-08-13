/* eslint-env node */
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/OrderItem');
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');
const { Notification } = require('../models/Notification');
const { sequelize } = require('../config/database');
const orderService = require('../services/orderService');
const { ApiError } = require('../utils/ApiError');

module.exports = {
  // GET /orders
  renderIndex: async (req, res, next) => {
    try {
      const isFarmer = req.user.role === 'farmer';
      const where = isFarmer ? { sellerId: req.user.id } : { userId: req.user.id };

      // Optional status filter (keeps dashboard "status=pending" links working).
      const status = req.query.status;
      if (status && orderService.ORDER_FLOW[status]) where.status = status;

      const page = parseInt(req.query.page, 10) || 1;
      const limit = 15;
      const offset = (page - 1) * limit;

      const { count, rows: orders } = await Order.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        include: [
          { model: OrderItem, as: 'items', include: [{ model: ProduceListing, as: 'listing' }] },
          { model: User, as: 'buyer', attributes: ['id', 'fullName', 'county'] },
          { model: User, as: 'seller', attributes: ['id', 'fullName', 'county'] },
        ],
      });

      res.render('orders/index', {
        user: req.user,
        orders,
        isFarmer,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        status: status || 'All',
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /orders/new?produce=ID
  renderNew: async (req, res, next) => {
    try {
      const produceId = req.query.produce;
      if (!produceId) return res.redirect('/marketplace');

      const listing = await ProduceListing.findByPk(produceId, {
        include: [{ model: User, as: 'farmer' }],
      });

      if (!listing || listing.status !== 'LISTED') {
        return res.status(404).render('index', { notFound: true, message: 'Produce not available.' });
      }
      if (listing.farmerId === req.user.id) {
        return res.redirect('/produce/' + produceId);
      }

      res.render('orders/new', { user: req.user, listing });
    } catch (err) {
      next(err);
    }
  },

  // POST /orders
  createOrder: async (req, res, next) => {
    try {
      const order = await orderService.createOrder({
        sequelize,
        ProduceListing,
        Order,
        OrderItem,
        Notification,
        userId: req.user.id,
        listingId: req.body.listing_id,
        quantityKg: req.body.quantity_kg,
      });
      res.redirect('/orders/' + order.id);
    } catch (err) {
      if (err instanceof ApiError) {
        // Controlled user-facing error (e.g. insufficient stock).
        return res.status(err.status).render('orders/new', {
          user: req.user,
          error: err.message,
          listing_id: req.body.listing_id,
          quantity_kg: req.body.quantity_kg,
        });
      }
      next(err);
    }
  },

  // GET /orders/:id
  renderShow: async (req, res, next) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [
          { model: OrderItem, as: 'items', include: [{ model: ProduceListing, as: 'listing' }] },
          { model: User, as: 'buyer', attributes: ['id', 'fullName', 'county', 'phoneNumber'] },
          { model: User, as: 'seller', attributes: ['id', 'fullName', 'county', 'phoneNumber'] },
        ],
      });

      if (!order) return res.status(404).send('Order not found');

      const isBuyer = order.userId === req.user.id;
      const isSeller = order.sellerId === req.user.id;
      if (!isBuyer && !isSeller) {
        return res.status(403).send('Unauthorized');
      }

      res.render('orders/show', { user: req.user, order, isBuyer, isSeller });
    } catch (err) {
      next(err);
    }
  },

  // POST /orders/:id/status
  updateStatus: async (req, res, next) => {
    try {
      const order = await orderService.updateStatus({
        Order,
        OrderItem,
        ProduceListing,
        Notification,
        sequelize,
        orderId: req.params.id,
        nextStatus: req.body.status,
        actor: req.user,
      });
      res.redirect('/orders/' + order.id);
    } catch (err) {
      if (err instanceof ApiError) {
        return res.status(err.status).redirect(
          '/orders/' + req.params.id + '?error=' + encodeURIComponent(err.message)
        );
      }
      next(err);
    }
  },
};