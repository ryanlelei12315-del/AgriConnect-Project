/* eslint-env node */
const { ProduceListing } = require('../models/ProduceListing');
const { User } = require('../models/User');
const { buildWhere, parseFilters, normalizePage, PAGE_SIZE } = require('../services/marketplaceService');

module.exports = {
  renderMarketplace: async (req, res, next) => {
    try {
      const filters = parseFilters(req.query);
      const page = normalizePage(req.query.page);

      const where = buildWhere(filters);
      const { count, rows: listings } = await ProduceListing.findAndCountAll({
        where,
        include: [{ model: User, as: 'farmer', attributes: ['id', 'fullName', 'county'] }],
        order: [['createdAt', 'DESC']],
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });

      res.render('marketplace', {
        user: req.user,
        listings,
        category: filters.category,
        search: filters.search,
        county: filters.county,
        availability: filters.availability || '',
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        currentPage: page,
        totalPages: Math.ceil(count / PAGE_SIZE),
        error: null,
      });
    } catch (err) {
      next(err);
    }
  },
};