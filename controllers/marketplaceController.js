/* eslint-env node */
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');
const { Op } = require('sequelize');

module.exports = {
  renderMarketplace: async (req, res) => {
    try {
      const { category, search, county } = req.query;
      
      const where = { status: 'LISTED' };
      if (category && category !== 'All') {
        where.category = category;
      }
      
      if (county && county !== 'All') {
        where.county = county;
      }

      if (search && search.trim() !== '') {
        where.name = { [Op.like]: `%${search.trim()}%` };
      }

      const page = parseInt(req.query.page) || 1;
      const limit = 12; // 12 listings per page
      const offset = (page - 1) * limit;

      const { count, rows: listings } = await ProduceListing.findAndCountAll({
        where,
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName', 'county'] }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      const totalPages = Math.ceil(count / limit);

      res.render('marketplace', {
        user: req.user,
        listings,
        category: category || 'All',
        search: search || '',
        county: county || 'All',
        currentPage: page,
        totalPages,
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
