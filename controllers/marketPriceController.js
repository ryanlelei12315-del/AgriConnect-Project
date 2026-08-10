/* eslint-env node */
const { MarketPrice } = require('../models/MarketPrice');

module.exports = {
  renderIndex: async (req, res) => {
    try {
      const { category, county } = req.query;
      const where = {};
      
      if (category && category !== 'All') where.category = category;
      if (county && county !== 'All') where.county = county;

      const prices = await MarketPrice.findAll({
        where,
        order: [['recordedAt', 'DESC'], ['produceName', 'ASC']]
      });

      res.render('market-prices', {
        user: req.user || null,
        prices,
        category: category || 'All',
        county: county || 'All'
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  }
};
