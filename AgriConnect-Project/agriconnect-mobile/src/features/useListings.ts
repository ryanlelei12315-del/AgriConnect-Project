import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListings, createListing, uploadListingImage, type ListingFilters } from '../api/listings';

export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => getListings(filters),
    staleTime: 60_000,
  });
}


export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createListing,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}


export function useUploadListingImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, uri }: { id: number; uri: string }) => uploadListingImage(id, uri),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings'] }),
  });
}
