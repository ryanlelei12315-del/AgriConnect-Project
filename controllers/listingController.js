/* eslint-env node */
const { Op } = require('sequelize');
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const {
  positiveNumber,
  requiredString,
  enumValue,
  VALID_CATEGORIES,
  VALID_STATUSES,
  LIMITS,
} = require('../utils/validation');
const { sanitize } = require('../utils/sanitize');
const { sequelize } = require('../config/database');
const { createPublishedListing } = require('../services/entitlementService');
const {
  parseSort,
  normalizePage,
  PAGE_SIZE,
} = require('../services/marketplaceService');
const path = require('path');
const fs = require('fs');
const { LISTING_TRANSITIONS } = require('../utils/transitions');

module.exports = {
  // GET /api/listings?county=&category=&status=LISTED&search=&sort=&page=
  // Public browse (authenticated) with safe pagination + sort allowlist.
  list: async (req, res, next) => {
    try {
      const { county, category, status = 'LISTED', search, sort } = req.query;
      const where = {};

      // Validate status against the known enum values — reject anything else.
      if (VALID_STATUSES.produce.includes(status)) {
        where.status = status;
      }

      if (county && String(county).trim()) {
        where.county = String(county).trim();
      }

      if (category && VALID_CATEGORIES.includes(category)) {
        where.category = category;
      }

      // Search by produce name (case-insensitive LIKE). Limit length to prevent abuse.
      if (search && String(search).trim()) {
        where.name = { [Op.like]: `%${String(search).trim().slice(0, 100)}%` };
      }

      const page = normalizePage(req.query.page);
      const order = parseSort(sort);

      const { count, rows: listings } = await ProduceListing.findAndCountAll({
        where,
        order,
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName', 'county'] }],
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });

      return res.json({
        success: true,
        listings,
        pagination: {
          page,
          perPage: PAGE_SIZE,
          total: count,
          totalPages: Math.ceil(count / PAGE_SIZE),
        },
      });
    } catch (err) {
      if (err.code === 'ACTIVE_LISTING_LIMIT_REACHED') {
        return res.status(403).json({
          success: false,
          code: err.code,
          message: err.message,
          usage: err.usage,
        });
      }
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

      const { listing, usage } = await createPublishedListing({
        sequelize,
        User,
        ProduceListing,
        userId: req.user.id,
        attributes: {
        name: nameRes.value,
        category: catRes.value,
        quantityKg: qtyRes.value,
        pricePerKgKes: priceRes.value,
        county: countyRes.value,
        description: description ? sanitize(String(description).slice(0, LIMITS.description)) : null,
        },
      });

      return res.status(201).json({ success: true, listing, usage });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/listings/:id/status (owner only)
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status is a known enum value
      if (!VALID_STATUSES.produce.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status.' });
      }

      const result = await sequelize.transaction(async (transaction) => {
        // Lock the row to prevent concurrent status changes from bypassing
        // the ownership check between read and write.
        const listing = await ProduceListing.findByPk(id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!listing) {
          const error = new Error('Listing not found.');
          error.status = 404;
          throw error;
        }
        if (listing.farmerId !== req.user.id) {
          const error = new Error('You can only update your own listings.');
          error.status = 403;
          throw error;
        }

        // Validate the state transition is allowed
        const allowed = LISTING_TRANSITIONS[listing.status] || [];
        if (!allowed.includes(status)) {
          const error = new Error(`Cannot transition from ${listing.status} to ${status}.`);
          error.status = 400;
          throw error;
        }

        await listing.update({ status }, { transaction });
        return listing;
      });

      return res.json({ success: true, listing: result });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ success: false, message: err.message });
      }
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
