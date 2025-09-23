import { supabase } from "@/integrations/supabase/client";
import { Puppy } from '@/types/puppy';

/**
 * @namespace publicApi
 * @description A collection of optimized, public-facing API endpoints for fetching data without authentication.
 */
export const publicApi = {
  /**
   * Fetches a list of featured, available puppies.
   * @param {number} [limit=3] - The maximum number of featured puppies to return.
   * @returns {Promise<Puppy[]>} A promise that resolves to an array of featured puppy objects.
   * @throws Will throw an error if the Supabase query fails.
   */
  getFeaturedPuppies: async (limit: number = 3): Promise<Puppy[]> => {
    const { data, error } = await supabase
      .from('puppies')
      .select(`
        id, name, breed, birth_date, price, status, gender, 
        image_urls, photo_url, color, weight, is_featured, description
      `)
      .eq('status', 'Available')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Fetches a paginated and filterable list of all puppies.
   * @param {object} [filters={}] - The filter and pagination options.
   * @param {string} [filters.breed] - Filter by a specific breed.
   * @param {string} [filters.status] - Filter by status (e.g., 'Available').
   * @param {string} [filters.search] - A search term to match against puppy names and breeds.
   * @param {number} [filters.limit=50] - The number of puppies to return per page.
   * @param {number} [filters.offset=0] - The starting offset for pagination.
   * @param {string} [filters.litter_id] - Filter puppies belonging to a specific litter.
   * @returns {Promise<{ puppies: Puppy[]; total: number }>} A promise that resolves to an object containing the list of puppies and the total count.
   * @throws Will throw an error if the Supabase query fails.
   */
  getAllPuppies: async (filters: {
    breed?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
    litter_id?: string;
  } = {}): Promise<{ puppies: Puppy[]; total: number }> => {
    const { breed, status, search, limit = 50, offset = 0, litter_id } = filters;
    
    let query = supabase
      .from('puppies')
      .select(`
        id, name, breed, birth_date, price, status, gender,
        image_urls, photo_url, color, weight, is_featured,
        litter_id, description
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (breed && breed !== 'All Breeds') {
      query = query.eq('breed', breed);
    }

    if (status && status !== 'All') {
      query = query.eq('status', status as any);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,breed.ilike.%${search}%`);
    }

    if (litter_id) {
      query = query.eq('litter_id', litter_id);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    
    return {
      puppies: data || [],
      total: count || 0
    };
  },

  /**
   * Fetches a single puppy by its ID, including information about its litter.
   * @param {string} id - The UUID of the puppy to fetch.
   * @returns {Promise<Puppy | null>} A promise that resolves to the puppy object, or null if not found.
   * @throws Will throw an error if the Supabase query fails for reasons other than not found.
   */
  getPuppyById: async (id: string): Promise<Puppy | null> => {
    const { data, error } = await supabase
      .from('puppies')
      .select(`
        *, 
        litters (
          id, name, dam_name, sire_name, breed, date_of_birth
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  },

  /**
   * Fetches a single puppy by its slug, including information about its litter.
   * @param {string} slug - The unique slug of the puppy to fetch.
   * @returns {Promise<Puppy | null>} A promise that resolves to the puppy object, or null if not found.
   * @throws Will throw an error if the Supabase query fails for reasons other than not found.
   */
  getPuppyBySlug: async (slug: string): Promise<Puppy | null> => {
    const { data, error } = await supabase
      .from('puppies')
      .select(`
        *, 
        litters (
          id, name, dam_name, sire_name, breed, date_of_birth
        )
      `)
      .eq('slug', slug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  },

  /**
   * Fetches a single litter by its unique slug.
   * @param {string} slug - The unique slug of the litter to fetch.
   * @returns {Promise<any | null>} A promise that resolves to the litter object, or null if not found.
   * @throws Will throw an error if the Supabase query fails for reasons other than not found.
   */
  getLitterBySlug: async (slug: string): Promise<any | null> => {
    const { data, error } = await supabase
      .from('litters')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  },

  /**
   * Fetches a list of approved testimonials.
   * @param {number} [limit=6] - The maximum number of testimonials to return.
   * @returns {Promise<any[]>} A promise that resolves to an array of testimonial objects.
   * @throws Will throw an error if the Supabase query fails.
   */
  getTestimonials: async (limit: number = 6): Promise<any[]> => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, name, content, rating, location, puppy_name, is_featured')
      .eq('admin_approved', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Fetches a list of featured, approved testimonials.
   * @param {number} [limit=3] - The maximum number of featured testimonials to return.
   * @returns {Promise<any[]>} A promise that resolves to an array of featured testimonial objects.
   * @throws Will throw an error if the Supabase query fails.
   */
  getFeaturedTestimonials: async (limit: number = 3): Promise<any[]> => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('id, name, content, rating, location, puppy_name')
      .eq('admin_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Fetches a unique, sorted list of available puppy breeds.
   * @returns {Promise<string[]>} A promise that resolves to an array of breed names.
   * @throws Will throw an error if the Supabase query fails.
   */
  getAvailableBreeds: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('puppies')
      .select('breed')
      .eq('status', 'Available')
      .not('breed', 'is', null);
    
    if (error) throw error;
    
    const breeds = Array.from(new Set(data?.map(p => p.breed).filter(Boolean)));
    return breeds.sort();
  },

  /**
   * Fetches a list of litters, including their puppy count.
   * @param {number} [limit=10] - The maximum number of litters to return.
   * @returns {Promise<any[]>} A promise that resolves to an array of litter objects.
   * @throws Will throw an error if the Supabase query fails.
   */
  getLitters: async (limit: number = 10): Promise<any[]> => {
    const { data, error } = await supabase
      .from('litters')
      .select(`
        id, name, breed, dam_name, sire_name, date_of_birth, 
        expected_date, status, description, image_urls, puppy_count
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * Fetches a list of published blog posts.
   * @param {number} [limit=10] - The maximum number of blog posts to return.
   * @returns {Promise<any[]>} A promise that resolves to an array of blog post objects.
   * @throws Will throw an error if the Supabase query fails.
   */
  getBlogPosts: async (limit: number = 10): Promise<any[]> => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image_url, published_at, category')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
};