import { api } from './client';
import { MarketPrice } from '../types';

export async function getMarketPrices(category?: string, county?: string): Promise<{ prices: MarketPrice[]; isDemo: boolean }> {
  const q = new URLSearchParams();
  if (category && category !== 'All') q.set('category', category);
  if (county && county !== 'All') q.set('county', county);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  return api.get<{ prices: MarketPrice[]; isDemo: boolean }>(`/api/m/market-prices${suffix}`);
}
