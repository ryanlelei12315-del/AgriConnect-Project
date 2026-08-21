/* eslint-env node */
/** Mobile JSON API for the AgriConnect React Native app (additive, mounts at /api/m).
 *  Reuses existing Sequelize models, business services and validation helpers.
 *  All routes require a valid Bearer token (CSRF middleware skips token clients). */
const express = require('express');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

const { sequelize } = require('../config/database');
const { User } = require('../models/User');
const { ProduceListing } = require('../models/ProduceListing');
const { ServiceListing } = require('../models/ServiceListing');
const { ServiceRequest } = require('../models/ServiceRequest');
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/OrderItem');
const { Notification } = require('../models/Notification');
const { MarketPrice } = require('../models/MarketPrice');
const { Review } = require('../models/Review');

const auth = require('../middlewares/authMiddleware');
const { uploadProfileSingle } = require('../middlewares/upload');
const { ApiError } = require('../utils/ApiError');
const { sanitize } = require('../utils/sanitize');
const {
  positiveNumber, requiredString, email, phone, password,
  enumValue, dateNotInPast, VALID_CATEGORIES, LIMITS,
} = require('../utils/validation');
const serviceCtrl = require('../controllers/serviceController');
const orderService = require('../services/orderService');

const router = express.Router();

const VALID_SERVICE_CATEGORIES = ['Machinery', 'Transport', 'Infrastructure', 'Labour', 'Agronomy', 'Other'];
const VALID_COUNTIES = [
  'Uasin Gishu', 'Nakuru', 'Trans Nzoia', 'Meru', 'Kiambu', 'Kajiado',
  'Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Embu', 'Naivasha',
  'Kakamega', 'Kericho', "Murang'a", 'Other',
];

/** Never leak the password hash to clients. */
function publicProfile(user) {
  return {
    id: user.id, fullName: user.fullName, email: user.email, phoneNumber: user.phoneNumber,
    county: user.county, role: user.role, bio: user.bio || null, profileImage: user.profileImage || null,
    isActive: user.isActive, createdAt: user.createdAt,
  };
}

// ── Health ──────────────────────────────────────────────────────────
router.get('/health', (req, res) => res.json({ success: true, service: 'agriconnect-mobile-api' }));

// ── Services ────────────────────────────────────────────────────────
router.get('/services', auth, async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const where = { availability: 'AVAILABLE' };
    if (category && category !== 'All' && VALID_SERVICE_CATEGORIES.includes(category)) where.category = category;
    if (search && String(search).trim()) where.title = { [Op.like]: `%${String(search).trim()}%` };
    const services = await ServiceListing.findAll({
      where, order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'provider', attributes: ['id', 'fullName', 'county', 'phoneNumber', 'profileImage'] }],
    });
    res.json({ success: true, services });
  } catch (err) { next(err); }
});

router.get('/services/:id', auth, async (req, res, next) => {
  try {
    const service = await ServiceListing.findByPk(req.params.id, {
      include: [{ model: User, as: 'provider', attributes: ['id', 'fullName', 'county', 'phoneNumber', 'profileImage'] }],
    });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, service });
  } catch (err) { next(err); }
});

router.post('/services/:id/request', auth, async (req, res, next) => {
  try {
    const { location, requested_date, description } = req.body;
    const loc = requiredString(location, 'Location', { maxLen: LIMITS.location });
    if (!loc.ok) return res.status(400).json({ success: false, message: loc.error });
    const date = dateNotInPast(requested_date, 'Requested date');
    if (!date.ok) return res.status(400).json({ success: false, message: date.error });
    if (description && String(description).length > LIMITS.description) {
      return res.status(400).json({ success: false, message: `Details must be ${LIMITS.description} characters or fewer.` });
    }

    const service = await ServiceListing.findByPk(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    if (service.availability !== 'AVAILABLE') return res.status(400).json({ success: false, message: 'This service is not available.' });
    if (service.providerId === req.user.id) return res.status(400).json({ success: false, message: 'You cannot request your own service.' });

    const request = await ServiceRequest.create({
      serviceId: service.id, requesterId: req.user.id, providerId: service.providerId,
      location: loc.value, requestedDate: date.value,
      description: description ? sanitize(String(description).trim()) : null, status: 'PENDING',
    });
    await Notification.create({
      userId: service.providerId, title: 'New Service Request',
      message: `You received a new request for "${service.title}" on ${date.value}.`,
      type: 'SERVICE_REQUEST', relatedId: request.id,
    });
    res.status(201).json({ success: true, request });
  } catch (err) { next(err); }
});

router.get('/service-requests', auth, async (req, res, next) => {
  try {
    const asProvider = req.query.role === 'provider';
    const where = asProvider ? { providerId: req.user.id } : { requesterId: req.user.id };
    const requests = await ServiceRequest.findAll({
      where, order: [['createdAt', 'DESC']],
      include: [
        { model: ServiceListing, as: 'service', attributes: ['id', 'title', 'category', 'priceKes'] },
        { model: User, as: 'requester', attributes: ['id', 'fullName', 'county', 'phoneNumber'] },
        { model: User, as: 'provider', attributes: ['id', 'fullName', 'county', 'phoneNumber'] },
      ],
    });
    res.json({ success: true, requests });
  } catch (err) { next(err); }
});

router.patch('/service-requests/:id/status', auth, async (req, res, next) => {
  try {
    const st = enumValue(String(req.body.status).toUpperCase(), Object.keys(serviceCtrl.REQUEST_FLOW), 'status');
    if (!st.ok) return res.status(400).json({ success: false, message: st.error });
    const request = await ServiceRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.providerId !== req.user.id) return res.status(403).json({ success: false, message: 'You are not authorized to update this request.' });
    if (!serviceCtrl.REQUEST_FLOW[request.status] || !serviceCtrl.REQUEST_FLOW[request.status].includes(st.value)) {
      return res.status(400).json({ success: false, message: `Request status cannot change from "${request.status}" to "${st.value}".` });
    }
    request.status = st.value;
    await request.save();
    await Notification.create({
      userId: request.requesterId, title: 'Service Request Updated',
      message: `Your request (${request.id}) is now ${st.value.toLowerCase()}.`,
      type: 'SERVICE_REQUEST', relatedId: request.id,
    });
    res.json({ success: true, request });
  } catch (err) { next(err); }
});

// ── Orders ─────────────────────────────────────────────────────────
router.get('/orders', auth, async (req, res, next) => {
  try {
    const isFarmer = req.user.role === 'farmer';
    const where = isFarmer ? { sellerId: req.user.id } : { userId: req.user.id };
    const status = req.query.status;
    if (status && orderService.ORDER_FLOW[status]) where.status = status;
    const orders = await Order.findAll({
      where, order: [['createdAt', 'DESC']],
      include: [
        { model: OrderItem, as: 'items', include: [{ model: ProduceListing, as: 'listing' }] },
        { model: User, as: 'buyer', attributes: ['id', 'fullName', 'county', 'phoneNumber'] },
        { model: User, as: 'seller', attributes: ['id', 'fullName', 'county', 'phoneNumber'] },
      ],
    });
    res.json({ success: true, orders });
  } catch (err) { next(err); }
});

router.get('/orders/:id', auth, async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: ProduceListing, as: 'listing' }] },
        { model: User, as: 'buyer', attributes: ['id', 'fullName', 'county', 'phoneNumber'] },
        { model: User, as: 'seller', attributes: ['id', 'fullName', 'county', 'phoneNumber'] },
      ],
    });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.userId !== req.user.id && order.sellerId !== req.user.id) return res.status(403).json({ success: false, message: 'Unauthorized.' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
});

router.post('/orders', auth, async (req, res, next) => {
  try {
    const order = await orderService.createOrder({
      sequelize, ProduceListing, Order, OrderItem, Notification,
      userId: req.user.id, listingId: req.body.listing_id, quantityKg: req.body.quantity_kg,
    });
    res.status(201).json({ success: true, order });
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
});

router.patch('/orders/:id/status', auth, async (req, res, next) => {
  try {
    const order = await orderService.updateStatus({
      Order, OrderItem, ProduceListing, Notification, sequelize,
      orderId: req.params.id, nextStatus: req.body.status, actor: req.user,
    });
    res.json({ success: true, order });
  } catch (err) {
    if (err instanceof ApiError) return res.status(err.status).json({ success: false, message: err.message });
    next(err);
  }
});

// ── Farmer produce management ─────────────────────────────────────
router.get('/produce', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ success: false, message: 'Only farmers can manage produce.' });
    const listings = await ProduceListing.findAll({ where: { farmerId: req.user.id }, order: [['createdAt', 'DESC']] });
    const ids = listings.map((l) => l.id);
    const salesMap = new Map();
    if (ids.length) {
      const [rows] = await sequelize.query(
        `SELECT oi.listing_id AS id, SUM(oi.quantity_kg) AS kg, SUM(oi.total_kes) AS revenue
         FROM order_items oi JOIN orders o ON oi.order_id = o.id
         WHERE o.seller_id = ? AND o.status = 'completed' AND oi.listing_id IN (?)
         GROUP BY oi.listing_id`,
        { replacements: [req.user.id, ids], type: sequelize.QueryTypes.SELECT }
      );
      for (const row of Array.isArray(rows) ? rows : []) salesMap.set(row.id, { kgSold: Number(row.kg || 0), revenue: Number(row.revenue || 0) });
    }
    const produce = listings.map((l) => ({ ...l.toJSON(), sales: salesMap.get(l.id) || { kgSold: 0, revenue: 0 } }));
    res.json({ success: true, produce });
  } catch (err) { next(err); }
});

router.put('/produce/:id', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ success: false, message: 'Only farmers can manage produce.' });
    const listing = await ProduceListing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });
    if (listing.farmerId !== req.user.id) return res.status(403).json({ success: false, message: 'You can only edit your own listings.' });
    const { name, category, quantity, price, location, description, status } = req.body;
    const data = {};
    if (name !== undefined) { const r = requiredString(name, 'Produce name', { maxLen: LIMITS.produceName }); if (!r.ok) return res.status(400).json({ success: false, message: r.error }); data.name = r.value; }
    if (category !== undefined) { if (!VALID_CATEGORIES.includes(category)) return res.status(400).json({ success: false, message: 'Please choose a valid category.' }); data.category = category; }
    if (quantity !== undefined) { const r = positiveNumber(quantity, 'quantity', { min: 0 }); if (!r.ok) return res.status(400).json({ success: false, message: r.error }); data.quantityKg = r.value; }
    if (price !== undefined) { const r = positiveNumber(price, 'price', { min: 0 }); if (!r.ok) return res.status(400).json({ success: false, message: r.error }); data.pricePerKgKes = r.value; }
    if (location !== undefined) { const r = requiredString(location, 'Location', { maxLen: LIMITS.county }); if (!r.ok) return res.status(400).json({ success: false, message: r.error }); data.county = r.value; }
    if (description !== undefined) { if (String(description).length > LIMITS.description) return res.status(400).json({ success: false, message: `Description must be ${LIMITS.description} characters or fewer.` }); data.description = sanitize(String(description).trim()) || null; }
    if (status !== undefined) { if (!['LISTED', 'PENDING', 'SOLD', 'INACTIVE'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status.' }); data.status = status; }
    await listing.update(data);
    res.json({ success: true, listing });
  } catch (err) { next(err); }
});

router.delete('/produce/:id', auth, async (req, res, next) => {
  try {
    if (req.user.role !== 'farmer') return res.status(403).json({ success: false, message: 'Only farmers can manage produce.' });
    const listing = await ProduceListing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });
    if (listing.farmerId !== req.user.id) return res.status(403).json({ success: false, message: 'You can only delete your own listings.' });
    await listing.update({ status: 'INACTIVE' });
    res.json({ success: true, listing });
  } catch (err) { next(err); }
});

// ── Notifications ──────────────────────────────────────────────────
router.get('/notifications', auth, async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']], limit: 50 });
    res.json({ success: true, notifications: notifications.map((n) => ({ ...n.toJSON(), title: sanitize(n.title), message: sanitize(n.message) })) });
  } catch (err) { next(err); }
});

router.patch('/notifications/:id/read', auth, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
    notification.isRead = true;
    await notification.save();
    res.json({ success: true, notification });
  } catch (err) { next(err); }
});

// ── Market prices ──────────────────────────────────────────────────
router.get('/market-prices', auth, async (req, res, next) => {
  try {
    const { fetchLatestPrices } = require('../services/shabaRecordsService');
    let prices = [];
    let isDemo = false;
    try {
      prices = await fetchLatestPrices({ limit: 400 });
    } catch (apiErr) {
      console.error('[Mobile MarketPrices] API fetch failed, falling back to seed:', apiErr.message);
      const where = {};
      if (req.query.category && req.query.category !== 'All') where.category = req.query.category;
      if (req.query.county && req.query.county !== 'All') where.county = req.query.county;
      const rows = await MarketPrice.findAll({ where, order: [['recordedAt', 'DESC'], ['produceName', 'ASC']] });
      prices = rows.map((p) => ({
        produceName: p.produceName, category: p.category, marketName: p.marketName, county: p.county,
        price: Number(p.price), unit: p.unit, priceChange: Number(p.priceChange) || 0,
        source: p.source || 'AgriConnect Data', recordedAt: p.recordedAt,
      }));
      isDemo = true;
    }
    if (req.query.category && req.query.category !== 'All') prices = prices.filter((p) => p.category === req.query.category);
    if (req.query.county && req.query.county !== 'All') prices = prices.filter((p) => p.county === req.query.county);
    res.json({ success: true, prices, isDemo });
  } catch (err) { next(err); }
});

// ── Farmer profiles + reviews ─────────────────────────────────────
router.get('/farmers/:id', auth, async (req, res, next) => {
  try {
    const farmer = await User.findByPk(req.params.id);
    if (!farmer || farmer.role !== 'farmer') return res.status(404).json({ success: false, message: 'Farmer not found.' });
    const { ProduceListing: PL } = require('../models/ProduceListing');
    const [listings, reviews] = await Promise.all([
      PL.findAll({ where: { farmerId: farmer.id, status: 'LISTED' }, order: [['createdAt', 'DESC']] }),
      Review.findAll({ where: { revieweeId: farmer.id }, order: [['createdAt', 'DESC']] }),
    ]);
    const avg = reviews.length ? reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length : null;
    res.json({ success: true, farmer: publicProfile(farmer), listings, reviews, averageRating: avg, reviewCount: reviews.length });
  } catch (err) { next(err); }
});

router.post('/reviews', auth, async (req, res, next) => {
  try {
    const { order_id, rating, comment } = req.body;
    if (!/^\d+$/.test(String(order_id))) return res.status(400).json({ success: false, message: 'Invalid order.' });
    const ratingRes = positiveNumber(rating, 'rating', { integer: true, min: 0, max: 5 });
    if (!ratingRes.ok) return res.status(400).json({ success: false, message: ratingRes.error });
    const commentRes = requiredString(comment || '', 'comment', { maxLen: LIMITS.description, minLen: 0 });
    if (!commentRes.ok) return res.status(400).json({ success: false, message: commentRes.error });

    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.userId !== req.user.id) return res.status(403).json({ success: false, message: 'Only the buyer can review this order.' });
    if (order.status !== 'completed') return res.status(400).json({ success: false, message: 'You can only review completed orders.' });
    if (!order.sellerId) return res.status(400).json({ success: false, message: 'This order has no seller to review.' });
    const existing = await Review.findOne({ where: { orderId: order.id, reviewerId: req.user.id } });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this order.' });
    if (order.sellerId === req.user.id) return res.status(400).json({ success: false, message: 'You cannot review yourself.' });

    const review = await Review.create({
      reviewerId: req.user.id, revieweeId: order.sellerId, orderId: order.id,
      rating: ratingRes.value, comment: commentRes.value ? sanitize(commentRes.value) : null,
    });
    res.status(201).json({ success: true, review });
  } catch (err) { next(err); }
});

// ── Profile ────────────────────────────────────────────────────────
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: publicProfile(user) });
  } catch (err) { next(err); }
});

router.put('/profile', auth, async (req, res, next) => {
  try {
    const { fullName, email: emailValue, phoneNumber, county, bio } = req.body;
    const fullRes = requiredString(fullName, 'Full name', { maxLen: 100 });
    if (!fullRes.ok) return res.status(400).json({ success: false, message: fullRes.error });
    const emailRes = email(emailValue);
    if (!emailRes.ok) return res.status(400).json({ success: false, message: emailRes.error });
    const phoneRes = phone(phoneNumber);
    if (!phoneRes.ok) return res.status(400).json({ success: false, message: phoneRes.error });
    if (!VALID_COUNTIES.includes(county)) return res.status(400).json({ success: false, message: 'Please choose a valid county.' });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const emailClash = await User.findOne({ where: { email: emailRes.value, id: { [Op.ne]: user.id } } });
    if (emailClash) return res.status(409).json({ success: false, message: 'That email is already registered to another account.' });
    const phoneClash = await User.findOne({ where: { phoneNumber: phoneRes.value, id: { [Op.ne]: user.id } } });
    if (phoneClash) return res.status(409).json({ success: false, message: 'That phone number is already registered to another account.' });

    await user.update({
      fullName: fullRes.value, email: emailRes.value, phoneNumber: phoneRes.value, county,
      bio: sanitize(String(bio || '').trim()).slice(0, 500),
    });
    res.json({ success: true, user: publicProfile(user) });
  } catch (err) { next(err); }
});

router.put('/profile/password', auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const pwRes = password(newPassword);
    if (!pwRes.ok) return res.status(400).json({ success: false, message: pwRes.error });
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const isMatch = await bcrypt.compare(String(currentPassword || ''), user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Your current password is incorrect.' });
    user.password = await bcrypt.hash(pwRes.value, 10);
    await user.save();
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.post('/profile/image', auth, uploadProfileSingle('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    const user = await User.findByPk(req.user.id);
    if (user.profileImage && user.profileImage.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', 'public', user.profileImage);
      try { if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); } catch (_e) { /* best effort */ }
    }
    user.profileImage = '/uploads/' + req.file.filename;
    await user.save();
    res.json({ success: true, user: publicProfile(user) });
  } catch (err) { next(err); }
});

module.exports = router;





