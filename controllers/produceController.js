/* eslint-env node */
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');
const { getToken, verifyToken } = require('../middlewares/pageAuth');
const {
  positiveNumber,
  requiredString,
  enumValue,
  VALID_CATEGORIES,
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
      data.description = String(body.description).trim() || null;
    }
  }

  return { errors, data };
}

module.exports = {
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