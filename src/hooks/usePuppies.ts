import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publicApi } from "@/api/publicApi";
import { adminApi } from "@/api/adminApi";
import { toast } from "sonner";
import { Puppy } from "@/types/api";

/**
 * @hook usePuppies
 * @description A custom hook to fetch a list of puppies with optional filters.
 * @param {object} [filters={}] - Optional filters for breed, status, search term, and limit.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the react-query useQuery hook.
 */
export const usePuppies = (filters: {
  breed?: string;
  status?: string;
  search?: string;
  limit?: number;
} = {}) => {
  return useQuery({
    queryKey: ['puppies', filters],
    queryFn: () => publicApi.getAllPuppies(filters),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * @hook useFeaturedPuppies
 * @description A custom hook to fetch a list of featured puppies.
 * @param {number} [limit=3] - The maximum number of featured puppies to fetch.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the react-query useQuery hook.
 */
export const useFeaturedPuppies = (limit: number = 3) => {
  return useQuery({
    queryKey: ['featured-puppies', limit],
    queryFn: () => publicApi.getFeaturedPuppies(limit),
    staleTime: 15 * 60 * 1000, // Cache for 15 minutes
  });
};

/**
 * @hook usePuppy
 * @description A custom hook to fetch the details of a single puppy by its ID.
 * @param {string | undefined} id - The ID of the puppy to fetch. The query is disabled if the ID is not provided.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the react-query useQuery hook.
 */
export const usePuppy = (id: string | undefined) => {
  return useQuery({
    queryKey: ['puppy', id],
    queryFn: () => id ? publicApi.getPuppyById(id) : null,
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

/**
 * @hook useAvailableBreeds
 * @description A custom hook to fetch a list of unique, available puppy breeds.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the react-query useQuery hook.
 */
export const useAvailableBreeds = () => {
  return useQuery({
    queryKey: ['available-breeds'],
    queryFn: () => publicApi.getAvailableBreeds(),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * @hook usePuppyMutations
 * @description A custom hook that provides mutation functions for creating, updating, and deleting puppies.
 * It handles react-query cache invalidation and displays toasts on success or error.
 * @returns {{ createPuppy: import('@tanstack/react-query').UseMutationResult, updatePuppy: import('@tanstack/react-query').UseMutationResult, deletePuppy: import('@tanstack/react-query').UseMutationResult }} An object containing the mutation functions.
 */
export const usePuppyMutations = () => {
  const queryClient = useQueryClient();
  
  const createPuppy = useMutation({
    mutationFn: (puppyData: any) => adminApi.createPuppy(puppyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      queryClient.invalidateQueries({ queryKey: ['featured-puppies'] });
      queryClient.invalidateQueries({ queryKey: ['available-breeds'] });
      toast.success("Puppy created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create puppy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  const updatePuppy = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminApi.updatePuppy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      queryClient.invalidateQueries({ queryKey: ['featured-puppies'] });
      queryClient.invalidateQueries({ queryKey: ['puppy'] });
      toast.success("Puppy updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update puppy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  const deletePuppy = useMutation({
    mutationFn: (id: string) => adminApi.deletePuppy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      queryClient.invalidateQueries({ queryKey: ['featured-puppies'] });
      queryClient.invalidateQueries({ queryKey: ['available-breeds'] });
      toast.success("Puppy deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete puppy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return {
    createPuppy,
    updatePuppy,
    deletePuppy
  };
};