/* eslint-env node */
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');

module.exports = {
  renderMarketplace: async (req, res) => {
    try {
      const { category, search } = req.query;
      
      const where = { status: 'LISTED' };
      if (category && category !== 'All') {
        where.category = category;
      }
      
      // If we had a robust search, we could use Op.like for name, but skipping for simplicity or basic implementation.
      // We'll just fetch all LISTED and optionally filter by category for now.

      const listings = await ProduceListing.findAll({
        where,
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName', 'county'] }],
        order: [['createdAt', 'DESC']]
      });

      // Filter by search in-memory (for simple MVP search)
      let filteredListings = listings;
      if (search) {
        const lowerSearch = search.toLowerCase();
        filteredListings = listings.filter(l => l.name.toLowerCase().includes(lowerSearch));
      }

      res.render('marketplace', {
        user: req.user,
        listings: filteredListings,
        category: category || 'All',
        search: search || '',
        error: null
      });
    } catch (err) {
      console.error(err);
      res.status(500).render('marketplace', {
        user: req.user,
        listings: [],
        category: 'All',
        search: '',
        error: 'Unable to load marketplace data.'
      });
    }
  }
};
