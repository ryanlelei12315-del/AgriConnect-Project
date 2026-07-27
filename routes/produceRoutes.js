const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { Produce } = require('../models/Produce');
const { User } = require('../models/User');
const { Op } = require('sequelize');

// GET /api/produce - Get all produce listings with search and county filtering
router.get('/', async (req, res) => {
  try {
    const { county, search } = req.query;
    const whereClause = { available: true };

    if (county && county !== 'all') {
      whereClause.county = county;
    }

    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    const listings = await Produce.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, listings });
  } catch (err) {
    console.error('Error fetching produce:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/produce/:id - Get a single produce listing
router.get('/:id', async (req, res) => {
  try {
    const item = await Produce.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    return res.json({ success: true, listing: item });
  } catch (err) {
    console.error('Error fetching produce item:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/produce - Create a new produce listing (Farmer only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'farmer' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only farmers can list produce.' });
    }

    const { name, quantity, price, county, description, image } = req.body;

    if (!name || !quantity || !price || !county) {
      return res.status(400).json({ success: false, message: 'Please provide name, quantity, price, and county.' });
    }

    const listing = await Produce.create({
      userId: req.user.id,
      name,
      quantity,
      price,
      county,
      description: description || '',
      image: image || '/images/designarena_image_ni9bxflg.png',
      available: true
    });

    return res.status(201).json({ success: true, message: 'Produce listed successfully!', listing });
  } catch (err) {
    console.error('Error listing produce:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/produce/:id - Delete a produce listing (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Produce.findByPk(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Authorization check
    if (listing.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await listing.destroy();
    return res.json({ success: true, message: 'Listing deleted successfully!' });
  } catch (err) {
    console.error('Error deleting produce listing:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
