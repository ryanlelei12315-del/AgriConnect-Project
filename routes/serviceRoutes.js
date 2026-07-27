const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { Service } = require('../models/Service');
const { Op } = require('sequelize');

// GET /api/services - Get all services with search, county, and category filtering
router.get('/', async (req, res) => {
  try {
    const { county, category, search } = req.query;
    const whereClause = { available: true };

    if (county && county !== 'all') {
      whereClause.county = county;
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    const services = await Service.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    return res.json({ success: true, services });
  } catch (err) {
    console.error('Error fetching services:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/services/:id - Get a single service listing
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    return res.json({ success: true, service });
  } catch (err) {
    console.error('Error fetching service:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/services - Create a new service listing (Service Provider only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'provider' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only service providers can list services.' });
    }

    const { category, name, county, price, description } = req.body;

    if (!category || !name || !county || !price) {
      return res.status(400).json({ success: false, message: 'Please provide category, name, county, and price.' });
    }

    const service = await Service.create({
      providerId: req.user.id,
      category,
      name,
      county,
      price,
      description: description || '',
      available: true
    });

    return res.status(201).json({ success: true, message: 'Service listed successfully!', service });
  } catch (err) {
    console.error('Error listing service:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/services/:id - Delete a service listing (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Authorization check
    if (service.providerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await service.destroy();
    return res.json({ success: true, message: 'Service deleted successfully!' });
  } catch (err) {
    console.error('Error deleting service:', err.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
