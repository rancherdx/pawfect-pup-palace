import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api";
import { toast } from "sonner";

/**
 * @hook useParents
 * @description A custom hook to fetch a list of parents, with optional filters.
 */
export const useParents = (filters = {}) => {
  return useQuery({
    queryKey: ['parents', filters],
    queryFn: () => adminApi.getAllParents(),
  });
};

/**
 * @hook useParentMutations
 * @description A custom hook that provides mutation functions for creating, updating, and deleting parents.
 */
export const useParentMutations = () => {
  const queryClient = useQueryClient();
  
  const createParent = useMutation({
    mutationFn: (parentData: any) => adminApi.createParent(parentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success("Parent created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create parent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  const updateParent = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminApi.updateParent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success("Parent updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update parent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  const deleteParent = useMutation({
    mutationFn: (id: string) => adminApi.deleteParent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success("Parent deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete parent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return {
    createParent,
    updateParent,
    deleteParent
  };
};