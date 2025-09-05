// Main API exports - all using Supabase directly
export { authApi, publicApi } from './unifiedApi';
export { adminApi } from './adminApi';
export { puppiesApi, littersApi, testimonialApi } from './publicApi';

// Utility functions for auth
export { getCurrentUser, isAdmin, requireAuth, requireAdmin, apiRequest, fetchAdminAPI } from './client';

// Blog API using admin methods
export const blogApi = {
  getPosts: async (params: { page?: number; limit?: number; category?: string; status?: string } = {}) => {
    const { adminApi } = await import('./adminApi');
    try {
      const result = await adminApi.getAllPosts(params);
      // Transform blog posts to match expected interface
      const transformedPosts = result?.data?.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        createdAt: post.created_at,
        updatedAt: post.updated_at,
        publishedAt: post.published_at,
        authorName: post.author_name,
        category: post.category,
        tags: post.tags || [],
        featuredImageUrl: post.featured_image_url
      })) || [];
      
      return { posts: transformedPosts };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return { posts: [] };
    }
  },
  
  getBySlug: async (slug: string) => {
    console.warn('getBySlug not yet implemented');
    return null;
  },
};