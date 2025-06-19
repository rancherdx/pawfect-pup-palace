
// Re-export all APIs from the unified API module
export { authApi, publicApi, adminApi, littersApi, puppiesApi } from './unifiedApi';

// Legacy exports for backward compatibility
export { fetchAdminAPI } from './client';

// Export blog and testimonial APIs from adminApi
export const blogApi = {
  getPosts: async (params: { page?: number; limit?: number; category?: string; status?: string } = {}) => {
    const result = await adminApi.getAllPosts(params);
    return { posts: result.posts || result.data || [] };
  },
  getBySlug: async (slug: string) => {
    // Implementation for blog post by slug if needed
    return null;
  },
};

export const testimonialApi = {
  getAllPublic: async () => {
    const result = await adminApi.getTestimonials();
    return result.testimonials || result.data || [];
  },
};
