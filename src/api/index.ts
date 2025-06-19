// Re-export all APIs from the unified API module
export { authApi, publicApi, adminApi, littersApi, puppiesApi } from './unifiedApi';

// Legacy exports for backward compatibility
export { fetchAdminAPI } from './client';

// Keep existing blog and testimonial APIs
export const blogApi = {
  getPosts: async (params: { page?: number; limit?: number; category?: string }) => {
    // Implementation for blog posts if needed
    return { data: [] };
  },
  getBySlug: async (slug: string) => {
    // Implementation for blog post by slug if needed
    return null;
  },
};

export const testimonialApi = {
  getAllPublic: async () => {
    // Implementation for testimonials if needed
    return [];
  },
};
