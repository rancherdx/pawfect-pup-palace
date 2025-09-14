// Main API exports - all using Supabase directly
export { authApi } from './unifiedApi';
export { adminApi } from './adminApi';
export { publicApi } from './publicApi';

// Litters API
export const littersApi = {
  getAll: async (filters = {}) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.getAllLitters(filters);
  },
  getLitterById: async (id: string) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.getLitterById(id);
  },
  createLitter: async (data: any) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.createLitter(data);
  },
  updateLitter: async (id: string, data: any) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.updateLitter(id, data);
  },
  deleteLitter: async (id: string) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.deleteLitter(id);
  }
};

// Puppies API
export const puppiesApi = {
  getPuppyById: async (id: string) => {
    const { publicApi } = await import('./publicApi');
    return publicApi.getPuppyById(id);
  },
  getAll: async (filters = {}) => {
    const { publicApi } = await import('./publicApi');
    return publicApi.getAllPuppies(filters);
  }
};

// Utility functions for auth
export { getCurrentUser, isAdmin, requireAuth, requireAdmin, apiRequest, fetchAdminAPI } from './client';

// Blog API using admin methods
export const blogApi = {
  getPosts: async (params: { page?: number; limit?: number; category?: string; status?: string } = {}) => {
    const { adminApi } = await import('./adminApi');
    try {
      const result = await adminApi.getAllPosts(params);
      // Transform blog posts to match expected interface
      const transformedPosts = result?.posts?.map((post: any) => ({
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
    const { adminApi } = await import('./adminApi');
    try {
      const result = await adminApi.getAllPosts({ status: 'published' });
      const posts = result?.posts || [];
      const foundPost = posts.find((post: any) => post.slug === slug);
      
      if (!foundPost) {
        throw new Error('Post not found');
      }
      
      return {
        id: foundPost.id,
        title: foundPost.title,
        slug: foundPost.slug,
        content: foundPost.content,
        excerpt: foundPost.excerpt,
        status: foundPost.status,
        createdAt: foundPost.created_at,
        updatedAt: foundPost.updated_at,
        publishedAt: foundPost.published_at,
        author: foundPost.author_name,
        category: foundPost.category,
        tags: foundPost.tags || [],
        featuredImageUrl: foundPost.featured_image_url
      };
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  },
};