import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrder, createOrder, updateOrderStatus, createReview } from '../api/orders';

export function useOrders(status?: string) {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: () => getOrders(status),
    staleTime: 30_000,
  });
}


export function useOrder(id?: number) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });
}


export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ listingId, quantityKg }: { listingId: number; quantityKg: number | string }) =>
      createOrder(listingId, quantityKg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}


export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateOrderStatus(id, status),
    onSuccess: (data: { id: number }) => {
      qc.invalidateQueries({ queryKey: ['order', data.id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}


export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, rating, comment }: { orderId: number; rating: number; comment: string }) =>
      createReview(orderId, rating, comment),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
