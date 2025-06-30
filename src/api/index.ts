
// Re-export all APIs from the unified API module
export { authApi, publicApi, adminApi, littersApi, puppiesApi } from './unifiedApi';

// Legacy exports for backward compatibility
export { fetchAdminAPI } from './client';

// Export blog and testimonial APIs from adminApi with proper error handling
export const blogApi = {
  getPosts: async (params: { page?: number; limit?: number; category?: string; status?: string } = {}) => {
    const { adminApi } = await import('./unifiedApi');
    try {
      const result = await adminApi.getAllPosts(params);
      return { posts: result.posts || result.data || [] };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return { posts: [] };
    }
  },
  getBySlug: async (slug: string) => {
    // Implementation for blog post by slug if needed
    console.warn('getBySlug not yet implemented');
    return null;
  },
};

export const testimonialApi = {
  getAllPublic: async () => {
    const { adminApi } = await import('./unifiedApi');
    try {
      const result = await adminApi.getTestimonials();
      return result.testimonials || result.data || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  },
};
