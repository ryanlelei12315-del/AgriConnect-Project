/* eslint-env node */
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const {
  positiveNumber,
  requiredString,
  enumValue,
  VALID_CATEGORIES,
  LIMITS,
} = require('../utils/validation');
const { sanitize } = require('../utils/sanitize');
const path = require('path');
const fs = require('fs');
module.exports = {
  // GET /api/listings?county=&category=&status=LISTED — public browse (authed)
  list: async (req, res, next) => {
    try {
      const { county, category, status = 'LISTED' } = req.query;
      const where = {};

      if (status) where.status = status;
      if (county) where.county = county;
      if (category && VALID_CATEGORIES.includes(category)) where.category = category;

      const listings = await ProduceListing.findAll({
        where,
        order: [['createdAt', 'DESC']],
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName', 'county'] }],
      });

      return res.json({ success: true, listings });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/listings (farmer only)
  create: async (req, res, next) => {
    try {
      if (req.user.role !== 'farmer') {
        return res.status(403).json({ success: false, message: 'Only farmers can post listings.' });
      }

      const { name, category, quantity_kg, price_per_kg_kes, county, description } = req.body;

      const nameRes = requiredString(name, 'name', { maxLen: LIMITS.produceName });
      if (!nameRes.ok) return res.status(400).json({ success: false, message: nameRes.error });

      const catRes = enumValue(category, VALID_CATEGORIES, 'category');
      if (!catRes.ok) return res.status(400).json({ success: false, message: catRes.error });

      const qtyRes = positiveNumber(quantity_kg, 'quantity', { min: 0 });
      if (!qtyRes.ok) return res.status(400).json({ success: false, message: qtyRes.error });

      const priceRes = positiveNumber(price_per_kg_kes, 'price', { min: 0 });
      if (!priceRes.ok) return res.status(400).json({ success: false, message: priceRes.error });

      const countyRes = requiredString(county, 'county', { maxLen: LIMITS.county });
      if (!countyRes.ok) return res.status(400).json({ success: false, message: countyRes.error });

      const listing = await ProduceListing.create({
        farmerId: req.user.id,
        name: nameRes.value,
        category: catRes.value,
        quantityKg: qtyRes.value,
        pricePerKgKes: priceRes.value,
        county: countyRes.value,
        description: description ? sanitize(String(description).slice(0, LIMITS.description)) : null,
        status: 'LISTED',
      });

      return res.status(201).json({ success: true, listing });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/listings/:id/status (owner only)
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['LISTED', 'PENDING', 'SOLD', 'INACTIVE'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
      }

      const listing = await ProduceListing.findByPk(id);
      if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });
      if (listing.farmerId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You can only update your own listings.' });
      }

      listing.status = status;
      await listing.save();

      return res.json({ success: true, listing });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/listings/:id/image (owner only)
  uploadImage: async (req, res, next) => {
    try {
      const { id } = req.params;

      const listing = await ProduceListing.findByPk(id);
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found.' });
      }
      if (listing.farmerId !== req.user.id) {
        return res
          .status(403)
          .json({ success: false, message: 'You can only update your own listings.' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded.' });
      }

      // Optional: delete old image file if it exists and is not a placeholder
      if (listing.imageUrl && listing.imageUrl.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', 'public', listing.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      listing.imageUrl = '/uploads/' + req.file.filename;
      await listing.save();

      return res.json({ success: true, listing });
    } catch (err) {
      next(err);
    }
  },
};
