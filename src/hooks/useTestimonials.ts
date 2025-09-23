import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publicApi } from "@/api/publicApi";
import { adminApi } from "@/api/adminApi";
import { toast } from "sonner";

/**
 * @hook useTestimonials
 * @description A custom hook to fetch a list of public testimonials.
 * @param {number} [limit=6] - The maximum number of testimonials to fetch.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the react-query useQuery hook.
 */
export const useTestimonials = (limit: number = 6) => {
  return useQuery({
    queryKey: ['testimonials', limit],
    queryFn: () => publicApi.getTestimonials(limit),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * @hook useFeaturedTestimonials
 * @description A custom hook to fetch a list of featured testimonials.
 * @param {number} [limit=3] - The maximum number of featured testimonials to fetch.
 * @returns {import('@tanstack/react-query').UseQueryResult} The result of the react-query useQuery hook.
 */
export const useFeaturedTestimonials = (limit: number = 3) => {
  return useQuery({
    queryKey: ['featured-testimonials', limit],
    queryFn: () => publicApi.getFeaturedTestimonials(limit),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * @hook useTestimonialMutations
 * @description A custom hook that provides mutation functions for creating, updating, and deleting testimonials.
 * It handles react-query cache invalidation and displays toasts on success or error.
 * @returns {{ createTestimonial: import('@tanstack/react-query').UseMutationResult, updateTestimonial: import('@tanstack/react-query').UseMutationResult, deleteTestimonial: import('@tanstack/react-query').UseMutationResult }} An object containing the mutation functions.
 */
export const useTestimonialMutations = () => {
  const queryClient = useQueryClient();
  
  const createTestimonial = useMutation({
    mutationFn: (testimonialData: any) => adminApi.createTestimonial(testimonialData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      toast.success("Testimonial created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create testimonial: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  const updateTestimonial = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminApi.updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      toast.success("Testimonial updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update testimonial: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  const deleteTestimonial = useMutation({
    mutationFn: (id: string) => adminApi.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      toast.success("Testimonial deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete testimonial: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return {
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
  };
};