/* eslint-env node */
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');
const { OrderItem } = require('../models/OrderItem');
const { Order } = require('../models/Order');
const { sequelize } = require('../config/database');
const { getToken, verifyToken } = require('../middlewares/pageAuth');
const { sanitize } = require('../utils/sanitize');
const {
  positiveNumber,
  requiredString,
  enumValue,
  VALID_CATEGORIES,
  VALID_UNITS,
  LIMITS,
} = require('../utils/validation');

function validateProduceInput(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.name !== undefined) {
    const r = requiredString(body.name, 'Produce name', { maxLen: LIMITS.produceName });
    if (!r.ok) errors.push(r.error);
    else data.name = r.value;
  }

  if (!partial || body.category !== undefined) {
    const r = enumValue(body.category, VALID_CATEGORIES, 'category');
    if (!r.ok) errors.push('Please choose a valid category.');
    else data.category = r.value;
  }

  if (!partial || body.quantity !== undefined) {
    const r = positiveNumber(body.quantity, 'quantity', { min: 0 });
    if (!r.ok) errors.push(r.error);
    else data.quantityKg = r.value;
  }

  if (!partial || body.unit !== undefined) {
    const u = enumValue(body.unit, VALID_UNITS, 'unit');
    if (!u.ok) errors.push('Please choose a valid unit.');
    else data.unit = u.value;
  }

  if (!partial || body.price !== undefined) {
    const r = positiveNumber(body.price, 'price', { min: 0 });
    if (!r.ok) errors.push(r.error);
    else data.pricePerKgKes = r.value;
  }

  if (!partial || body.location !== undefined) {
    const r = requiredString(body.location, 'Location', { maxLen: LIMITS.county });
    if (!r.ok) errors.push(r.error);
    else data.county = r.value;
  }

  if (body.description !== undefined) {
    if (String(body.description).length > LIMITS.description) {
      errors.push(`Description must be ${LIMITS.description} characters or fewer.`);
    } else {
      data.description = sanitize(String(body.description).trim()) || null;
    }
  }

  return { errors, data };
}

module.exports = {
  // GET /produce
  renderProduceIndex: async (req, res, next) => {
    try {
      if (req.user.role !== 'farmer') {
        return res.status(403).render('index', { notFound: true, message: 'Only farmers can manage produce.' });
      }

      const listings = await ProduceListing.findAll({
        where: { farmerId: req.user.id },
        order: [['createdAt', 'DESC']],
      });

      const listingIds = listings.map(l => l.id);

      let salesMap = new Map();
      let pendingOrdersMap = new Map();

      if (listingIds.length > 0) {
        const [salesRows] = await sequelize.query(
          `SELECT oi.listing_id, SUM(oi.quantity_kg) AS total_kg, SUM(oi.total_kes) AS total_revenue
           FROM order_items oi
           JOIN orders o ON oi.order_id = o.id
           WHERE o.seller_id = ? AND o.status = 'completed' AND oi.listing_id IN (?)
           GROUP BY oi.listing_id`,
          {
            replacements: [req.user.id, listingIds],
            type: sequelize.QueryTypes.SELECT,
          }
        );

        const salesList = Array.isArray(salesRows) ? salesRows : [];
        for (const row of salesList) {
          salesMap.set(row.listing_id, {
            kgSold: Number(row.total_kg || 0),
            revenue: Number(row.total_revenue || 0),
          });
        }

        const [pendingRows] = await sequelize.query(
          `SELECT oi.listing_id, COUNT(*) AS pending_count
           FROM order_items oi
           JOIN orders o ON oi.order_id = o.id
           WHERE o.seller_id = ? AND o.status = 'pending' AND oi.listing_id IN (?)
           GROUP BY oi.listing_id`,
          {
            replacements: [req.user.id, listingIds],
            type: sequelize.QueryTypes.SELECT,
          }
        );

        const pendingList = Array.isArray(pendingRows) ? pendingRows : [];
        for (const row of pendingList) {
          pendingOrdersMap.set(row.listing_id, Number(row.pending_count || 0));
        }
      }

      const produce = listings.map(l => {
        const sales = salesMap.get(l.id) || { kgSold: 0, revenue: 0 };
        const pendingOrders = pendingOrdersMap.get(l.id) || 0;
        return {
          ...l.toJSON(),
          kgSold: sales.kgSold,
          revenue: sales.revenue,
          pendingOrders,
        };
      });

      const totals = produce.reduce(
        (acc, p) => {
          acc.stock += Number(p.quantityKg || 0);
          acc.kgSold += p.kgSold;
          acc.revenue += p.revenue;
          acc.count += 1;
          return acc;
        },
        { stock: 0, kgSold: 0, revenue: 0, count: 0 }
      );

      res.render('produce', {
        user: req.user,
        currentPage: 'produce',
        produce,
        totals,
      });
    } catch (err) {
      console.error('Produce index error:', err.message);
      next(err);
    }
  },

  // GET /produce/new
  renderNewForm: (req, res) => {
    if (req.user.role !== 'farmer') {
      return res.status(403).render('index', { notFound: true, message: 'Only farmers can post produce.' });
    }
    res.render('produce/new', { user: req.user, error: null, listing: null });
  },

  // POST /produce
  createProduce: async (req, res, next) => {
    try {
      if (req.user.role !== 'farmer') {
        return res.status(403).render('index', { notFound: true, message: 'Only farmers can post produce.' });
      }

      const { errors, data } = validateProduceInput(req.body);
      if (errors.length > 0) {
        return res.status(400).render('produce/new', {
          user: req.user,
          error: errors[0],
          listing: null,
        });
      }

      const listing = await ProduceListing.create({
        farmerId: req.user.id,
        ...data,
        status: 'LISTED',
      });

      res.redirect('/produce/' + listing.id + '?created=success');
    } catch (err) {
      next(err);
    }
  },

  // GET /produce/:id
  renderShow: async (req, res, next) => {
    try {
      const token = getToken(req);
      const user = token ? verifyToken(token) : null;

      const listing = await ProduceListing.findByPk(req.params.id, {
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName', 'county', 'phoneNumber'] }],
      });

      if (!listing) return res.status(404).render('index', { notFound: true });

      res.render('produce/show', { user, listing });
    } catch (err) {
      next(err);
    }
  },

  // GET /produce/:id/edit
  renderEditForm: async (req, res, next) => {
    try {
      const listing = await ProduceListing.findByPk(req.params.id);
      if (!listing) return res.status(404).render('index', { notFound: true });
      if (listing.farmerId !== req.user.id) return res.status(403).send('Unauthorized');

      res.render('produce/edit', { user: req.user, listing, error: null });
    } catch (err) {
      next(err);
    }
  },

  // POST /produce/:id/update
  updateProduce: async (req, res, next) => {
    try {
      const listing = await ProduceListing.findByPk(req.params.id);
      if (!listing) return res.status(404).send('Not found');
      if (listing.farmerId !== req.user.id) return res.status(403).send('Unauthorized');

      const { errors, data } = validateProduceInput(req.body, { partial: true });
      if (errors.length > 0) {
        return res.status(400).render('produce/edit', {
          user: req.user,
          listing,
          error: errors[0],
        });
      }

      if (req.body.status) {
        const st = enumValue(req.body.status, ['LISTED', 'PENDING', 'SOLD', 'INACTIVE']);
        if (!st.ok) return res.status(400).render('produce/edit', { user: req.user, listing, error: 'Invalid status.' });
        data.status = st.value;
      }

      await listing.update(data);
      res.redirect('/produce/' + listing.id);
    } catch (err) {
      next(err);
    }
  },

  // POST /produce/:id/delete (soft-delete)
  deleteProduce: async (req, res, next) => {
    try {
      const listing = await ProduceListing.findByPk(req.params.id);
      if (!listing) return res.status(404).send('Not found');
      if (listing.farmerId !== req.user.id) return res.status(403).send('Unauthorized');

      await listing.update({ status: 'INACTIVE' });
      res.redirect('/dashboard');
    } catch (err) {
      next(err);
    }
  },
};
