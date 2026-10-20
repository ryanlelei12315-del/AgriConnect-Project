/* eslint-env node */
const { Op } = require('sequelize');
const { BuyerDemand } = require('../models/BuyerDemand');
const { User } = require('../models/User');

const CATEGORIES = new Set(['Cereals', 'Vegetables', 'Fruits', 'Root Crops', 'Legumes', 'Dairy', 'Poultry', 'Other']);
const COUNTIES = new Set([
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa','Homa Bay','Isiolo','Kajiado',
  'Kakamega','Kericho','Kiambu','Kilifi','Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu',
  'Machakos','Makueni','Mandera','Marsabit','Meru','Migori','Mombasa','Murang’a','Nairobi','Nakuru',
  'Nandi','Narok','Nyamira','Nyandarua','Nyeri','Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi',
  'Trans Nzoia','Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot'
]);

module.exports = {
  renderBoard: async (req, res, next) => {
    try {
      const isBuyer = req.user.role === 'buyer';
      const where = isBuyer
        ? { buyerId: req.user.id }
        : { status: 'OPEN' };
      const filters = {};
      if (req.query.county && COUNTIES.has(req.query.county)) filters.county = req.query.county;
      if (req.query.search && String(req.query.search).trim()) {
        filters.cropName = { [Op.like]: '%' + String(req.query.search).trim().slice(0, 80) + '%' };
      }
      Object.assign(where, filters);
      const demands = await BuyerDemand.findAll({
        where,
        include: [{ model: User, as: 'buyer', attributes: ['id', 'fullName', 'county'] }],
        order: [['createdAt', 'DESC']],
        limit: 100,
      });
      res.render('demand-board', {
        user: req.user, demands, isBuyer,
        activeNav: 'demand-board',
        counties: Array.from(COUNTIES).sort(),
        selectedCounty: req.query.county || 'All',
        search: String(req.query.search || '').slice(0, 80),
        error: null,
      });
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      if (req.user.role !== 'buyer') return res.status(403).send('Only buyer accounts can publish demand.');
      const cropName = String(req.body.crop_name || '').trim();
      const category = String(req.body.category || 'Other');
      const county = String(req.body.county || '');
      const quantityKg = Number(req.body.quantity_kg);
      const maxRaw = String(req.body.max_price_per_kg_kes || '').trim();
      const maxPrice = maxRaw === '' ? null : Number(maxRaw);
      const requiredBy = String(req.body.required_by || '').trim() || null;
      const qualityNotes = String(req.body.quality_notes || '').trim();
      if (!cropName || cropName.length > 100 || !CATEGORIES.has(category) || !COUNTIES.has(county)) {
        return res.status(400).send('Enter a crop name, valid category, and valid county.');
      }
      if (!Number.isFinite(quantityKg) || quantityKg <= 0 || quantityKg > 100000000) {
        return res.status(400).send('Quantity must be greater than zero and within the supported limit.');
      }
      if (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice <= 0 || maxPrice > 100000000)) {
        return res.status(400).send('Maximum price must be a positive amount or left blank.');
      }
      if (requiredBy && (!/^\d{4}-\d{2}-\d{2}$/.test(requiredBy) || Number.isNaN(Date.parse(requiredBy)))) {
        return res.status(400).send('Enter a valid required-by date.');
      }
      if (qualityNotes.length > 1000) return res.status(400).send('Quality notes must be 1,000 characters or fewer.');
      await BuyerDemand.create({
        buyerId: req.user.id, cropName, category, county, quantityKg,
        maxPricePerKgKes: maxPrice, requiredBy, qualityNotes: qualityNotes || null,
      });
      return res.redirect('/demand-board?created=1');
    } catch (err) { next(err); }
  },

  updateStatus: async (req, res, next) => {
    try {
      if (req.user.role !== 'buyer') return res.status(403).send('Only buyers can manage demand posts.');
      const demand = await BuyerDemand.findByPk(req.params.id);
      if (!demand) return res.status(404).send('Demand post not found.');
      if (Number(demand.buyerId) !== Number(req.user.id)) return res.status(403).send('You can only update your own demand posts.');
      const status = String(req.body.status || '');
      if (!['OPEN', 'CLOSED', 'FULFILLED'].includes(status)) return res.status(400).send('Invalid demand status.');
      demand.status = status;
      await demand.save();
      return res.redirect('/demand-board');
    } catch (err) { next(err); }
  },
};
