import { useQuery } from '@tanstack/react-query';
import { getMarketPrices } from '../api/marketPrices';

export function useMarketPrices(category?: string, county?: string) {
  return useQuery({
    queryKey: ['market-prices', category, county],
    queryFn: () => getMarketPrices(category, county),
    staleTime: 5 * 60_000,
  });
}
