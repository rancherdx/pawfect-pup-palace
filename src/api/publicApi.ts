import { supabase } from "@/integrations/supabase/client";
import { Puppy } from '@/types/puppy';

// Optimized public API endpoints for better performance
export const publicApi = {
  // Get featured puppies with optimized query
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

  // Get all available puppies with filtering
  getAllPuppies: async (filters: {
    breed?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ puppies: Puppy[]; total: number }> => {
    const { breed, status, search, limit = 50, offset = 0 } = filters;
    
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

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    
    return {
      puppies: data || [],
      total: count || 0
    };
  },

  // Get single puppy with litter info
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

  // Get testimonials optimized
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

  // Get featured testimonials
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

  // Get available breeds list
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

  // Get litters with puppy count
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

  // Get published blog posts
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