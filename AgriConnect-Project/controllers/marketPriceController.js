/* eslint-env node */
const { getKamisPrices, clearCache, getCacheStats } = require('../services/kamisService');
const { MarketPrice } = require('../models/MarketPrice');

module.exports = {
  renderIndex: async (req, res, next) => {
    try {
      const { category, county, refresh } = req.query;
      let prices = [];

      try {
        if (refresh === 'true') {
          clearCache();
        }
        prices = await getKamisPrices();
      } catch (apiErr) {
        console.error('[MarketPrices] KAMIS fetch failed, falling back to DB:', apiErr.message);
        const where = {};
        if (category && category !== 'All') where.category = category;
        if (county && county !== 'All') where.county = county;

        prices = await MarketPrice.findAll({
          where,
          order: [['recordedAt', 'DESC'], ['produceName', 'ASC']],
        });

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
      }

      if (category && category !== 'All') {
        prices = prices.filter((p) => p.category === category);
      }
      if (county && county !== 'All') {
        prices = prices.filter((p) => p.county === county);
      }

      const stats = getCacheStats();

      res.render('market-prices', {
        user: req.user || null,
        prices,
        category: category || 'All',
        county: county || 'All',
        activeNav: 'market-prices',
        isDemo: false,
        cacheStats: stats
      });
    } catch (err) {
      next(err);
    }
  },

  clearCache: async (req, res) => {
    clearCache();
    res.json({ success: true, message: 'KAMIS cache cleared' });
  },

  getCacheStats: async (req, res) => {
    res.json(getCacheStats());
  }
};