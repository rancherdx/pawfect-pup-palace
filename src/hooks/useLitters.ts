
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { littersApi } from "@/api";
import { toast } from "sonner";

export const useLitters = (filters = {}) => {
  return useQuery({
    queryKey: ['litters', filters],
    queryFn: () => littersApi.getAllLitters(filters),
  });
};

export const useLitter = (litterId: string | undefined) => {
  return useQuery({
    queryKey: ['litter', litterId],
    queryFn: () => litterId ? littersApi.getLitterById(litterId) : null,
    enabled: !!litterId,
  });
};

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
