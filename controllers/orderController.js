/* eslint-env node */
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/OrderItem');
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');
const { Notification } = require('../models/Notification');
const { sequelize } = require('../config/database');

const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'completed', 'canceled'];

module.exports = {
  // GET /orders
  renderIndex: async (req, res) => {
    try {
      const isFarmer = req.user.role === 'farmer';
      const where = isFarmer ? { sellerId: req.user.id } : { userId: req.user.id };

      const orders = await Order.findAll({
        where,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: ProduceListing, as: 'listing' }],
          },
          { model: User, as: 'buyer', attributes: ['id', 'fullName', 'county'] },
          { model: User, as: 'seller', attributes: ['id', 'fullName', 'county'] },
        ],
      });

      res.render('orders/index', { user: req.user, orders, isFarmer });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },

  // GET /orders/new?produce=ID
  renderNew: async (req, res) => {
    try {
      const produceId = req.query.produce;
      if (!produceId) return res.redirect('/marketplace');

      const listing = await ProduceListing.findByPk(produceId, {
        include: [{ model: User, as: 'farmer' }]
      });

      if (!listing || listing.status !== 'LISTED') {
        return res.status(404).render('index', { notFound: true, message: 'Produce not available.' });
      }

      if (listing.farmerId === req.user.id) {
        return res.redirect('/produce/' + produceId); // Can't order own produce
      }

      res.render('orders/new', { user: req.user, listing });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  },

  // POST /orders
  createOrder: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { listing_id, quantity_kg } = req.body;

      if (!listing_id || !quantity_kg || quantity_kg <= 0) {
        throw new Error('Valid listing_id and quantity are required.');
      }

      const listing = await ProduceListing.findByPk(listing_id, { transaction: t });
      if (!listing || listing.status !== 'LISTED') {
        throw new Error('Listing is not available.');
      }

      if (listing.farmerId === req.user.id) {
        throw new Error('You cannot order your own listing.');
      }

      if (Number(quantity_kg) > Number(listing.quantityKg)) {
        throw new Error(`Only ${listing.quantityKg} kg available.`);
      }

      const totalKes = Number(quantity_kg) * Number(listing.pricePerKgKes);

      const order = await Order.create({
        userId: req.user.id,
        sellerId: listing.farmerId,
        status: 'pending',
        totalKes,
      }, { transaction: t });

      await OrderItem.create({
        orderId: order.id,
        listingId: listing.id,
        quantityKg: quantity_kg,
        unitPriceKes: listing.pricePerKgKes,
        totalKes,
      }, { transaction: t });

      // Update produce quantity
      const newQuantity = Number(listing.quantityKg) - Number(quantity_kg);
      listing.quantityKg = newQuantity;
      if (newQuantity <= 0) {
        listing.status = 'SOLD';
      }
      await listing.save({ transaction: t });

      // Notify the farmer
      await Notification.create({
        userId: listing.farmerId,
        title: 'New Order Received',
        message: `You have received a new order for ${quantity_kg} kg of ${listing.name}.`,
        type: 'ORDER',
        relatedId: order.id
      }, { transaction: t });

      await t.commit();
      res.redirect('/orders/' + order.id);
    } catch (err) {
      await t.rollback();
      console.error('Order create error:', err.message);
      res.status(400).send(`Order failed: ${err.message}`);
    }
  },

  // GET /orders/:id
  renderShow: async (req, res) => {
    try {
      const order = await Order.findByPk(req.params.id, {
        include: [
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: ProduceListing, as: 'listing' }],
          },
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
      console.error(err);
      res.status(500).send('Server Error');
    }
  },

  // POST /orders/:id/status
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).send('Invalid status.');
      }

      const order = await Order.findByPk(id);
      if (!order) return res.status(404).send('Order not found.');

      const isBuyer = order.userId === req.user.id;
      const isSeller = order.sellerId === req.user.id;

      if (!isBuyer && !isSeller) return res.status(403).send('Unauthorized');
      
      if (status === 'canceled' && !isBuyer && !isSeller) return res.status(403).send('Unauthorized');
      if (['confirmed', 'shipped', 'completed'].includes(status) && !isSeller) return res.status(403).send('Unauthorized');

      order.status = status;
      await order.save();

      // Notify the other party
      const notifyUserId = isSeller ? order.userId : order.sellerId;
      await Notification.create({
        userId: notifyUserId,
        title: 'Order Status Updated',
        message: `Order #${order.id} status is now: ${status}.`,
        type: 'ORDER',
        relatedId: order.id
      });

      res.redirect('/orders/' + id);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
};
