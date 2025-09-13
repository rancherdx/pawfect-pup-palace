import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publicApi } from "@/api/publicApi";
import { adminApi } from "@/api/adminApi";
import { toast } from "sonner";

// Hook for public testimonials
export const useTestimonials = (limit: number = 6) => {
  return useQuery({
    queryKey: ['testimonials', limit],
    queryFn: () => publicApi.getTestimonials(limit),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Hook for featured testimonials
export const useFeaturedTestimonials = (limit: number = 3) => {
  return useQuery({
    queryKey: ['featured-testimonials', limit],
    queryFn: () => publicApi.getFeaturedTestimonials(limit),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Admin hook for testimonial management
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