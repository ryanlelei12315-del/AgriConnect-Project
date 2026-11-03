import { api } from './client';
import { ServiceListing, ServiceRequest } from '../types';

export async function getServices(category?: string, search?: string): Promise<ServiceListing[]> {
  const q = new URLSearchParams();
  if (category && category !== 'All') q.set('category', category);
  if (search) q.set('search', search);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  const body = await api.get<{ services: ServiceListing[] }>(`/api/m/services${suffix}`);
  return body.services;
}

export async function getService(id: number): Promise<ServiceListing> {
  const body = await api.get<{ service: ServiceListing }>(`/api/m/services/${id}`);
  return body.service;
}

export async function requestService(id: number, payload: {
  location: string;
  requested_date: string;
  description?: string;
}): Promise<ServiceRequest> {
  const body = await api.post<{ request: ServiceRequest }>(`/api/m/services/${id}/request`, {
    json: { ...payload } as unknown as Record<string, unknown>,
  });
  return body.request;
}

/** role = 'provider' returns requests received by the current user. */
export async function getServiceRequests(role?: 'provider' | 'requester'): Promise<ServiceRequest[]> {
  const suffix = role ? `?role=${role}` : '';
  const body = await api.get<{ requests: ServiceRequest[] }>(`/api/m/service-requests${suffix}`);
  return body.requests;
}

export async function updateServiceRequestStatus(id: number, status: string): Promise<ServiceRequest> {
  const body = await api.patch<{ request: ServiceRequest }>(`/api/m/service-requests/${id}/status`, {
    json: { status },
  });
  return body.request;
}
