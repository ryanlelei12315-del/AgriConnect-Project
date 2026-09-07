import { useQuery } from '@tanstack/react-query';
import { getServices, getService, getServiceRequests } from '../api/services';

export function useServices(category?: string, search?: string) {
  return useQuery({
    queryKey: ['services', category, search],
    queryFn: () => getServices(category, search),
    staleTime: 60_000,
  });
}


export function useService(id?: number) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => getService(id!),
    enabled: !!id,
  });
}


export function useServiceRequests(role?: 'provider' | 'requester') {
  return useQuery({
    queryKey: ['service-requests', role],
    queryFn: () => getServiceRequests(role),
    staleTime: 30_000,
  });
}
