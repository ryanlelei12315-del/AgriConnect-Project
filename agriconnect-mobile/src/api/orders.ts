import { api } from './client';
import { Order } from '../types';

export async function getOrders(status?: string): Promise<Order[]> {
  const suffix = status && status !== 'All' ? `?status=${status}` : '';
  const body = await api.get<{ orders: Order[] }>(`/api/m/orders${suffix}`);
  return body.orders;
}

export async function getOrder(id: number): Promise<Order> {
  const body = await api.get<{ order: Order }>(`/api/m/orders/${id}`);
  return body.order;
}

export async function createOrder(listingId: number, quantityKg: number | string): Promise<Order> {
  const body = await api.post<{ order: Order }>('/api/m/orders', {
    json: { listing_id: listingId, quantity_kg: quantityKg },
  });
  return body.order;
}

export async function updateOrderStatus(id: number, status: string): Promise<Order> {
  const body = await api.patch<{ order: Order }>(`/api/m/orders/${id}/status`, { json: { status } });
  return body.order;
}

export async function createReview(orderId: number, rating: number, comment: string): Promise<unknown> {
  return api.post('/api/m/reviews', { json: { order_id: orderId, rating, comment } });
}
