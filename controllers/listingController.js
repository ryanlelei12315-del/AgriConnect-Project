/* eslint-env node */
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');

/** Valid listing status transitions (state machine) */
const VALID_CATEGORIES = [
  'Vegetables',
  'Cereals',
  'Root Crops',
  'Legumes',
  'Fruits',
  'Dairy',
  'Livestock',
  'Other',
];

/**
 * GET /api/listings?county=&category=&status=LISTED
 * Public browse (authenticated users). Returns flattened listings
 * with farmer display info.
 */
async function list(req, res) {
  try {
    const { county, category, status = 'LISTED' } = req.query;
    const where = {};

    if (status) where.status = status;
    if (county) where.county = county;
    if (category) where.category = category;

    const listings = await ProduceListing.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'farmer',
          attributes: ['id', 'fullName', 'county'],
        },
      ],
    });

    return res.json({ success: true, listings });
  } catch (err) {
    console.error('Listing list error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * POST /api/listings  (farmer only)
 * Creates a produce listing for the authenticated farmer.
 */
async function create(req, res) {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Only farmers can post listings.' });
    }

    const { name, category, quantity_kg, price_per_kg_kes, county, description } = req.body;

    if (!name || !quantity_kg || !price_per_kg_kes || !county) {
      return res.status(400).json({
        success: false,
        message: 'name, quantity_kg, price_per_kg_kes, and county are required.',
      });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `category must be one of: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    const listing = await ProduceListing.create({
      farmerId: req.user.id,
      name,
      category: category || 'Other',
      quantityKg: quantity_kg,
      pricePerKgKes: price_per_kg_kes,
      county,
      description: description || null,
      status: 'LISTED',
    });

    return res.status(201).json({ success: true, listing });
  } catch (err) {
    console.error('Listing create error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

/**
 * PATCH /api/listings/:id/status  (owner only)
 * Marks a listing LISTED → PENDING → SOLD.
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['LISTED', 'PENDING', 'SOLD'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const listing = await ProduceListing.findByPk(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }
    if (listing.farmerId !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: 'You can only update your own listings.' });
    }

    listing.status = status;
    await listing.save();

    return res.json({ success: true, listing });
  } catch (err) {
    console.error('Listing status error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { list, create, updateStatus, VALID_CATEGORIES };
