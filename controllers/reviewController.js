/* eslint-env node */
const { Review } = require('../models/Review');
const { Order } = require('../models/Order');
const { User } = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { integerId, positiveNumber, requiredString, LIMITS } = require('../utils/validation');
const { sanitize } = require('../utils/sanitize');

/**
 * Business rules for who may review whom:
 *  - Only the buyer on a COMPLETED order may review the seller.
 *  - No self-review, no duplicate review per (order, reviewer), rating 1-5.
 */
module.exports = {
  // GET /reviews/new?order_id=<id> — show review form for a completed order
  renderNew: async (req, res, next) => {
    try {
      const idRes = integerId(req.query.order_id, 'order');
      if (!idRes.ok) throw new ApiError(400, idRes.error);

      const order = await Order.findByPk(idRes.value, {
        include: [
          { model: User, as: 'seller', attributes: ['id', 'fullName', 'county'] },
          { model: User, as: 'buyer', attributes: ['id', 'fullName'] },
        ],
      });

      // Eligibility: order exists, belongs to this buyer, and is completed.
      if (!order) throw new ApiError(404, 'Order not found.');
      if (order.userId !== req.user.id) throw new ApiError(403, 'Only the buyer can review this order.');
      if (order.status !== 'completed') throw new ApiError(400, 'You can only review completed orders.');

      const existing = await Review.findOne({ where: { orderId: order.id, reviewerId: req.user.id } });
      if (existing) throw new ApiError(400, 'You have already reviewed this order.');

      res.render('reviews/new', { user: req.user, order, error: null });
    } catch (err) {
      next(err);
    }
  },

  // POST /reviews
  create: async (req, res, next) => {
    try {
      const orderIdRes = integerId(req.body.order_id, 'order');
      if (!orderIdRes.ok) throw new ApiError(400, orderIdRes.error);

      const ratingRes = positiveNumber(req.body.rating, 'rating', { integer: true, min: 0, max: 5 });
      if (!ratingRes.ok) throw new ApiError(400, ratingRes.error);

      const commentRes = requiredString(req.body.comment || '', 'comment', { maxLen: LIMITS.description, minLen: 0 });
      if (!commentRes.ok) throw new ApiError(400, commentRes.error);

      const order = await Order.findByPk(orderIdRes.value);
      if (!order) throw new ApiError(404, 'Order not found.');
      if (order.userId !== req.user.id) throw new ApiError(403, 'Only the buyer can review this order.');
      if (order.status !== 'completed') throw new ApiError(400, 'You can only review completed orders.');
      if (!order.sellerId) throw new ApiError(400, 'This order has no seller to review.');

      const existing = await Review.findOne({ where: { orderId: order.id, reviewerId: req.user.id } });
      if (existing) throw new ApiError(400, 'You have already reviewed this order.');
      if (order.sellerId === req.user.id) throw new ApiError(400, 'You cannot review yourself.');

      await Review.create({
        reviewerId: req.user.id,
        revieweeId: order.sellerId,
        orderId: order.id,
        rating: ratingRes.value,
        comment: commentRes.value ? sanitize(commentRes.value) : null,
      });

      res.redirect('/orders/' + order.id + '?review=submitted');
    } catch (err) {
      next(err);
    }
  },

  // GET /farmers/:id — public farmer profile with rating + listings
  // (phase 12 trust surface)
  farmerProfile: async (req, res, next) => {
    try {
      const idRes = integerId(req.params.id, 'farmer');
      if (!idRes.ok) throw new ApiError(404, 'Farmer not found.');

      const farmer = await User.findByPk(idRes.value);
      if (!farmer || farmer.role !== 'farmer') throw new ApiError(404, 'Farmer not found.');

      const { ProduceListing } = require('../models/ProduceListing');
      const [listings, reviews] = await Promise.all([
        ProduceListing.findAll({
          where: { farmerId: farmer.id, status: 'LISTED' },
          order: [['createdAt', 'DESC']],
        }),
        Review.findAll({ where: { revieweeId: farmer.id }, order: [['createdAt', 'DESC']] }),
      ]);

      const avg =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
          : null;

      res.render('farmers/profile', {
        user: req.user || null,
        farmer,
        listings,
        reviews,
        averageRating: avg,
        reviewCount: reviews.length,
      });
    } catch (err) {
      next(err);
    }
  },
};