import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publicApi } from "@/api/publicApi";
import { adminApi } from "@/api/adminApi";
import { toast } from "sonner";
import { Puppy } from "@/types/puppy";

// Hook for public puppy data
export const usePuppies = (filters: {
  breed?: string;
  status?: string;
  search?: string;
  limit?: number;
} = {}) => {
  return useQuery({
    queryKey: ['puppies', filters],
    queryFn: () => publicApi.getAllPuppies(filters),
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
};

// Hook for featured puppies
export const useFeaturedPuppies = (limit: number = 3) => {
  return useQuery({
    queryKey: ['featured-puppies', limit],
    queryFn: () => publicApi.getFeaturedPuppies(limit),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Hook for single puppy details
export const usePuppy = (id: string | undefined) => {
  return useQuery({
    queryKey: ['puppy', id],
    queryFn: () => id ? publicApi.getPuppyById(id) : null,
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute
  });
};

// Hook for available breeds
export const useAvailableBreeds = () => {
  return useQuery({
    queryKey: ['available-breeds'],
    queryFn: () => publicApi.getAvailableBreeds(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
};

// Admin hook for puppy management
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