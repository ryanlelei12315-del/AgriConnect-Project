import { api } from './client';
import { ProduceListing } from '../types';

export interface ListingFilters {
  county?: string;
  category?: string;
  search?: string;
  availability?: string;
  minPrice?: string;
  maxPrice?: string;
}

export async function getListings(filters: ListingFilters = {}): Promise<ProduceListing[]> {
  const q = new URLSearchParams();
  if (filters.county && filters.county !== 'All') q.set('county', filters.county);
  if (filters.category && filters.category !== 'All') q.set('category', filters.category);
  if (filters.search) q.set('search', filters.search);
  if (filters.availability) q.set('availability', filters.availability);
  if (filters.minPrice) q.set('min_price', filters.minPrice);
  if (filters.maxPrice) q.set('max_price', filters.maxPrice);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const body = await api.get<{ listings: ProduceListing[] }>(`/api/listings${suffix}`);
  return body.listings;
}

export async function createListing(payload: {
  name: string;
  category: string;
  quantity_kg: number | string;
  price_per_kg_kes: number | string;
  county: string;
  description?: string;
}): Promise<ProduceListing> {
  const body = await api.post<{ listing: ProduceListing }>('/api/listings', {
    json: { ...payload } as unknown as Record<string, unknown>,
  });
  return body.listing;
}

export async function uploadListingImage(id: number, uri: string): Promise<ProduceListing> {
  const form = new FormData();
  const filename = uri.split('/').pop() || 'photo.jpg';
  form.append('image', {
    uri,
    name: filename,
    type: 'image/jpeg',
  } as unknown as Blob);
  const body = await api.post<{ listing: ProduceListing }>(`/api/listings/${id}/image`, { form });
  return body.listing;
}
