import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyProduce, updateProduce, deleteProduce, getFarmer } from '../api/produce';

export function useMyProduce() {
  return useQuery({
    queryKey: ['my-produce'],
    queryFn: () => getMyProduce(),
    staleTime: 30_000,
  });
}


export function useFarmer(id?: number) {
  return useQuery({
    queryKey: ['farmer', id],
    queryFn: () => getFarmer(id!),
    enabled: !!id,
  });
}


export function useUpdateProduce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateProduce>[1] }) =>
      updateProduce(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-produce'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}


export function useDeleteProduce() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProduce,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-produce'] });
      qc.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
