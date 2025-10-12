/**
 * @file This file serves as the main entry point for the application's API layer.
 * It exports a consolidated set of APIs for different domains like authentication, admin, public, etc.
 * It also defines and exports specialized API objects that compose functionality from other API modules.
 */

import { BlogPostStatus } from '@/types/api';

// Main API exports - all using Supabase directly
export { authApi } from './unifiedApi';
export { adminApi } from './adminApi';
export { publicApi } from './publicApi';

/**
 * @namespace littersApi
 * @description API for managing litters. These functions are wrappers around the `adminApi` litter methods.
 */
export const littersApi = {
  /**
   * Fetches all litters.
   * @param {object} [filters={}] - Optional filters to apply.
   * @returns {Promise<any>} A promise that resolves with the list of litters.
   */
  getAll: async (filters = {}) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.getAllLitters(filters);
  },
  /**
   * Fetches a single litter by its ID.
   * @param {string} id - The ID of the litter to fetch.
   * @returns {Promise<any>} A promise that resolves with the litter data.
   */
  getLitterById: async (id: string) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.getLitterById(id);
  },
  /**
   * Creates a new litter.
   * @param {any} data - The data for the new litter.
   * @returns {Promise<any>} A promise that resolves with the created litter data.
   */
  createLitter: async (data: any) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.createLitter(data);
  },
  /**
   * Updates an existing litter.
   * @param {string} id - The ID of the litter to update.
   * @param {any} data - The new data for the litter.
   * @returns {Promise<any>} A promise that resolves with the updated litter data.
   */
  updateLitter: async (id: string, data: any) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.updateLitter(id, data);
  },
  /**
   * Deletes a litter.
   * @param {string} id - The ID of the litter to delete.
   * @returns {Promise<any>} A promise that resolves when the litter is deleted.
   */
  deleteLitter: async (id: string) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.deleteLitter(id);
  }
};

/**
 * @namespace puppiesApi
 * @description API for public-facing puppy data. These functions are wrappers around the `publicApi` puppy methods.
 */
export const puppiesApi = {
  /**
   * Fetches a single puppy by its ID.
   * @param {string} id - The ID of the puppy to fetch.
   * @returns {Promise<any>} A promise that resolves with the puppy data.
   */
  getPuppyById: async (id: string) => {
    const { publicApi } = await import('./publicApi');
    return publicApi.getPuppyById(id);
  },
  /**
   * Fetches all puppies available to the public.
   * @param {object} [filters={}] - Optional filters to apply.
   * @returns {Promise<any>} A promise that resolves with the list of puppies.
   */
  getAll: async (filters = {}) => {
    const { publicApi } = await import('./publicApi');
    return publicApi.getAllPuppies(filters);
  }
};

/**
 * Re-exports utility functions related to authentication and client-side API helpers.
 */
export { getCurrentUser, isAdmin, requireAuth, requireAdmin, apiRequest, fetchAdminAPI } from './client';

/**
 * @namespace blogApi
 * @description API for managing and fetching blog posts.
 */
export const blogApi = {
  /**
   * Fetches a list of blog posts, with optional pagination and filtering.
   * @param {object} [params={}] - The query parameters.
   * @param {number} [params.page] - The page number to fetch.
   * @param {number} [params.limit] - The number of posts per page.
   * @param {string} [params.category] - The category to filter by.
   * @param {string} [params.status] - The status to filter by (e.g., 'published').
   * @returns {Promise<{posts: any[]}>} A promise that resolves to an object containing the list of transformed posts.
   */
  getPosts: async (params: { page?: number; limit?: number; category?: string; status?: BlogPostStatus } = {}) => {
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
        created_at: post.created_at,
        updated_at: post.updated_at,
        published_at: post.published_at,
        author_name: post.author_name,
        category: post.category,
        tags: post.tags || [],
        featured_image_url: post.featured_image_url
      })) || [];
      
      return { posts: transformedPosts };
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return { posts: [] };
    }
  },
  
  /**
   * Fetches a single blog post by its slug.
   * @param {string} slug - The slug of the post to fetch.
   * @returns {Promise<object>} A promise that resolves to the transformed post object.
   * @throws Will throw an error if the post is not found.
   */
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
        created_at: foundPost.created_at,
        updated_at: foundPost.updated_at,
        published_at: foundPost.published_at,
        author_name: foundPost.author_name,
        category: foundPost.category,
        tags: foundPost.tags || [],
        featured_image_url: foundPost.featured_image_url
      };
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  },
};