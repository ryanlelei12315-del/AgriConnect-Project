/* eslint-env node */
/**
 * Marketplace query building. Pure + dependency-free so it can be unit-tested.
 *
 * Instead of pulling thousands of rows into Node and filtering in JS, this
 * builds a Sequelize WHERE clause that MySQL evaluates — only matching rows
 * are returned, and only the current page's rows are transferred.
 */
const { Op } = require('sequelize');
const { VALID_CATEGORIES } = require('../utils/validation');

const PAGE_SIZE = 12;

/** Sanitize + normalize an integer page number. */
function normalizePage(raw) {
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return n;
}

/**
 * Build the Sequelize WHERE clause for marketplace filters.
 * Only status = LISTED produce is ever shown.
 */
function buildWhere({ search, category, county, availability, minPrice, maxPrice }) {
  const where = { status: 'LISTED' };

  if (category && category !== 'All' && VALID_CATEGORIES.includes(category)) {
    where.category = category;
  }

  if (county && county !== 'All' && String(county).trim()) {
    where.county = String(county).trim();
  }

  if (search && String(search).trim() !== '') {
    where.name = { [Op.like]: `%${String(search).trim()}%` };
  }

  // Availability: "Available" means there is stock remaining (> 0).
  if (availability === 'available') {
    where.quantityKg = { [Op.gt]: 0 };
  } else if (availability === 'sold-out') {
    where.quantityKg = { [Op.lte]: 0 };
  }

  // Price range: both bounds supplied → BETWEEN; otherwise only the set one.
  const min = Number(minPrice);
  const max = Number(maxPrice);
  if ((Number.isFinite(min) && min > 0) || (Number.isFinite(max) && max > 0)) {
    const price = {};
    if (Number.isFinite(min) && min > 0) price[Op.gte] = min;
    if (Number.isFinite(max) && max > 0) price[Op.lte] = max;
    where.pricePerKgKes = price;
  }

  return where;
}

/**
 * Normalize raw filter params from req.query.
 */
function parseFilters(query) {
  const category = String(query.category || 'All');
  const county = String(query.county || 'All');
  return {
    search: String(query.search || ''),
    category: category === 'All' ? 'All' : category,
    county: county === 'All' ? 'All' : county,
    availability: ['available', 'sold-out'].includes(query.availability) ? query.availability : null,
    minPrice: String(query.min_price || ''),
    maxPrice: String(query.max_price || ''),
  };
}

module.exports = { buildWhere, parseFilters, normalizePage, PAGE_SIZE };