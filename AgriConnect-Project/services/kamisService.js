const axios = require('axios');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');

const CACHE_TTL = 6 * 60 * 60;
const kamisCache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 600 });

async function scrapeKamisPrices() {
  try {
    const url = 'https://kamis.go.ke';
    
    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    const $ = cheerio.load(data);
    const priceData = [];

    $('table tbody tr').each((index, element) => {
      const row = $(element);
      const crop = row.find('td').eq(0).text().trim();
      const market = row.find('td').eq(1).text().trim();
      const unit = row.find('td').eq(2).text().trim();
      const wholesalePrice = row.find('td').eq(3).text().trim();
      const retailPrice = row.find('td').eq(4).text().trim();
      const dateStr = row.find('td').eq(5).text().trim();

      if (crop && market && retailPrice) {
        priceData.push({
          produceName: crop,
          marketName: market,
          unit: unit || 'kg',
          wholesalePrice: parseFloat(wholesalePrice.replace(/[^0-9.-]+/g, '')) || 0,
          retailPrice: parseFloat(retailPrice.replace(/[^0-9.-]+/g, '')) || 0,
          recordedAt: dateStr || new Date().toISOString().split('T')[0],
          source: 'KAMIS'
        });
      }
    });

    return priceData;
  } catch (error) {
    console.error('[KAMIS] Scraping failed:', error.message);
    throw error;
  }
}

async function getKamisPrices() {
  const cacheKey = 'kamis-prices';
  const cached = kamisCache.get(cacheKey);
  
  if (cached) {
    console.log('[KAMIS] Serving from cache');
    return cached;
  }

  try {
    console.log('[KAMIS] Cache miss — scraping live...');
    const prices = await scrapeKamisPrices();
    
    if (prices.length > 0) {
      kamisCache.set(cacheKey, prices);
      console.log(`[KAMIS] Cached ${prices.length} price records`);
    }
    
    return prices;
  } catch (error) {
    console.error('[KAMIS] Failed to fetch, attempting stale cache...');
    const stale = kamisCache.get(cacheKey);
    if (stale) {
      console.log('[KAMIS] Serving stale cache as fallback');
      return stale;
    }
    
    return [
      { produceName: 'Dry Maize', marketName: 'Nairobi (Wakulima)', unit: '90kg', wholesalePrice: 4200, retailPrice: 4500, recordedAt: new Date().toISOString().split('T')[0], source: 'Fallback' },
      { produceName: 'Irish Potatoes', marketName: 'Mombasa (Kongowea)', unit: '50kg', wholesalePrice: 3100, retailPrice: 3500, recordedAt: new Date().toISOString().split('T')[0], source: 'Fallback' }
    ];
  }
}

function clearCache() {
  kamisCache.flushAll();
  console.log('[KAMIS] Cache cleared');
}

function getCacheStats() {
  return {
    keys: kamisCache.keys().length,
    hits: kamisCache.getStats().hits,
    misses: kamisCache.getStats().misses,
    ksize: kamisCache.getStats().ksize
  };
}

module.exports = { getKamisPrices, clearCache, getCacheStats };