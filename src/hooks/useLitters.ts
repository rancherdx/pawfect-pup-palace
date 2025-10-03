import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { littersApi } from "@/api";
import { toast } from "sonner";

/**
 * @hook useLitters
 * @description A custom hook to fetch a list of litters, with optional filters.
 * @param {object} [filters={}] - Optional filters to apply to the query.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the react-query useQuery hook.
 */
export const useLitters = (filters = {}) => {
  return useQuery({
    queryKey: ['litters', filters],
    queryFn: () => littersApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * @hook useLitter
 * @description A custom hook to fetch a single litter by its ID.
 * @param {string | undefined} litterId - The ID of the litter to fetch. The query is disabled if the ID is not provided.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the react-query useQuery hook.
 */
export const useLitter = (litterId: string | undefined) => {
  return useQuery({
    queryKey: ['litter', litterId],
    queryFn: () => litterId ? littersApi.getLitterById(litterId) : null,
    enabled: !!litterId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

/**
 * @hook useLitterMutations
 * @description A custom hook that provides mutation functions for creating, updating, and deleting litters.
 * It handles react-query cache invalidation and displays toasts on success or error.
 * @returns {{ createLitter: import('@tanstack/react-query').UseMutationResult, updateLitter: import('@tanstack/react-query').UseMutationResult, deleteLitter: import('@tanstack/react-query').UseMutationResult }} An object containing the mutation functions.
 */
export const useLitterMutations = () => {
  const queryClient = useQueryClient();
  
  const createLitter = useMutation({
    mutationFn: (litterData: any) => littersApi.createLitter(litterData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['litters'] });
      toast.success("Litter created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create litter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  const updateLitter = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => littersApi.updateLitter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['litters'] });
      toast.success("Litter updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update litter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  const deleteLitter = useMutation({
    mutationFn: (id: string) => littersApi.deleteLitter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['litters'] });
      toast.success("Litter deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete litter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return {
    createLitter,
    updateLitter,
    deleteLitter
  };
};
