/* eslint-env node */
const axios = require('axios');
const BASE_URL = process.env.SHAMBA_API_BASE_URL || 'https://api-data.shambarecords.com/api/v1';
const PUBLIC_KEY = process.env.SHAMBA_PUBLIC_KEY;
const SECRET_KEY = process.env.SHAMBA_SECRET_KEY;

if (!PUBLIC_KEY) {
  console.warn('[ShambaRecords] SHAMBA_PUBLIC_KEY is not set. Market prices will not load.');
}
/**
 * Fetch latest prices from Shamba Records.
 * Returns an array of flat price objects compatible with the current view.
 */
async function fetchLatestPrices({ countyId, limit = 50 } = {}) {
  if (!PUBLIC_KEY) throw new Error('Shamba Records API key is not configured.');

  const payload = {};
  if (countyId) payload.county_id = Number(countyId);
  if (limit) payload.limit = Number(limit);

  const response = await axios.post(`${BASE_URL}/prices/latest`, payload, {
    headers: {
      'X-API-Key': PUBLIC_KEY,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  const data = response.data?.data || [];
  const flat = [];

  for (const item of data) {
    const product = item.product || {};
    const prices = Array.isArray(item.prices) ? item.prices : [];

    for (const p of prices) {
      flat.push({
        produceName: product.name || 'Unknown',
        category: product.category || 'Other',
        marketName: p.market?.name || 'Unknown Market',
        county: '', // API does not return county in latest prices; fill from market if needed
        price: Number(p.price) || 0,
        unit: p.unit || '',
        priceChange: 0,
        source: 'ShambaRecords',
        recordedAt: p.recorded_at ? new Date(p.recorded_at) : new Date(),
      });
    }
  }

  return flat;
}

module.exports = { fetchLatestPrices };
