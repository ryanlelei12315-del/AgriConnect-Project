import { api } from './client';
import { ProduceListing } from '../types';

/** Farmer's own produce list with sales summaries. */
export async function getMyProduce(): Promise<ProduceListing[]> {
  const body = await api.get<{ produce: ProduceListing[] }>('/api/m/produce');
  return body.produce;
}

export async function updateProduce(
  id: number,
  payload: Partial<{
    name: string;
    category: string;
    quantity: number | string;
    price: number | string;
    location: string;
    description: string;
    status: string;
  }>
): Promise<ProduceListing> {
  const body = await api.put<{ listing: ProduceListing }>(`/api/m/produce/${id}`, {
    json: { ...payload } as unknown as Record<string, unknown>,
  });
  return body.listing;
}

export async function deleteProduce(id: number): Promise<ProduceListing> {
  const body = await api.del<{ listing: ProduceListing }>(`/api/m/produce/${id}`);
  return body.listing;
}

export async function getFarmer(id: number): Promise<{
  farmer: import('../types').AuthUser;
  listings: ProduceListing[];
  reviews: import('../types').Review[];
  averageRating: number | null;
  reviewCount: number;
}> {
  return api.get(`/api/m/farmers/${id}`);
}
