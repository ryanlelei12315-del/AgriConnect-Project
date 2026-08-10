/* eslint-env node */
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');
const { getToken, verifyToken } = require('../middlewares/pageAuth');

module.exports = {
  // GET /produce/new
  renderNewForm: (req, res) => {
    if (req.user.role !== 'farmer') {
      return res.status(403).render('index', { notFound: true, message: 'Only farmers can post produce.' });
    }
    res.render('produce/new', { user: req.user });
  },

  // POST /produce
  createProduce: async (req, res) => {
    try {
      if (req.user.role !== 'farmer') return res.status(403).send('Unauthorized');

      const { name, category, quantity, unit, price, location, description } = req.body;
      
      // Basic validation
      if (!name || !category || !quantity || !price || !location) {
        return res.status(400).send('Missing required fields');
      }

      const listing = await ProduceListing.create({
        farmerId: req.user.id,
        name,
        category,
        quantityKg: quantity, // Assuming unit conversion handles this or it's standard
        pricePerKgKes: price,
        county: location,
        description,
        status: 'LISTED',
        // imageUrl: req.file ? `/images/uploads/${req.file.filename}` : null // To be added with multer
      });

      res.redirect('/dashboard?created=success');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  // GET /produce/:id
  renderShow: async (req, res) => {
    try {
      const token = getToken(req);
      const user = token ? verifyToken(token) : null;

      const listing = await ProduceListing.findByPk(req.params.id, {
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName', 'county', 'phoneNumber'] }]
      });

      if (!listing) return res.status(404).render('index', { notFound: true });

      res.render('produce/show', { user: user, listing });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  // GET /produce/:id/edit
  renderEditForm: async (req, res) => {
    try {
      const listing = await ProduceListing.findByPk(req.params.id);
      
      if (!listing) return res.status(404).render('index', { notFound: true });
      if (listing.farmerId !== req.user.id) return res.status(403).send('Unauthorized');

      res.render('produce/edit', { user: req.user, listing });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  // POST /produce/:id/update
  updateProduce: async (req, res) => {
    try {
      const listing = await ProduceListing.findByPk(req.params.id);
      
      if (!listing) return res.status(404).send('Not found');
      if (listing.farmerId !== req.user.id) return res.status(403).send('Unauthorized');

      const { name, category, quantity, price, location, description, status } = req.body;

      await listing.update({
        name,
        category,
        quantityKg: quantity,
        pricePerKgKes: price,
        county: location,
        description,
        status: status || listing.status
      });

      res.redirect(`/produce/${listing.id}`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  },

  // POST /produce/:id/delete
  deleteProduce: async (req, res) => {
    try {
      const listing = await ProduceListing.findByPk(req.params.id);
      
      if (!listing) return res.status(404).send('Not found');
      if (listing.farmerId !== req.user.id) return res.status(403).send('Unauthorized');

      await listing.update({ status: 'INACTIVE' }); // Soft delete

      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
};
