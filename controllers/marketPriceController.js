/* eslint-env node */
const { fetchLatestPrices } = require('../services/shabaRecordsService');
const { MarketPrice } = require('../models/MarketPrice');

module.exports = {
  renderIndex: async (req, res, next) => {
    try {
      const { category, county } = req.query;
      let prices = [];
      let isDemo = false;

      try {
        // Try live API first
        prices = await fetchLatestPrices({ limit: 50 });
      } catch (apiErr) {
        console.error(
          '[MarketPrices] API fetch failed, falling back to seed data:',
          apiErr.message
        );
        // Fallback to database seed data
        const where = {};
        if (category && category !== 'All') where.category = category;
        if (county && county !== 'All') where.county = county;

        prices = await MarketPrice.findAll({
          where,
          order: [
            ['recordedAt', 'DESC'],
            ['produceName', 'ASC'],
          ],
        });

        // Map DB fields to view shape
        prices = prices.map((p) => ({
          produceName: p.produceName,
          category: p.category,
          marketName: p.marketName,
          county: p.county,
          price: Number(p.price),
          unit: p.unit,
          priceChange: Number(p.priceChange) || 0,
          source: p.source || 'AgriConnect Data',
          recordedAt: p.recordedAt,
        }));

        isDemo = true;
      }

      // Client-side filter by category and county (API does not support these filters directly in latest endpoint)
      if (category && category !== 'All') {
        prices = prices.filter((p) => p.category === category);
      }
      if (county && county !== 'All') {
        prices = prices.filter((p) => p.county === county);
      }

      res.render('market-prices', {
        user: req.user || null,
        prices,
        category: category || 'All',
        county: county || 'All',
        isDemo,
      });
    } catch (err) {
      next(err);
    }
  },
};
