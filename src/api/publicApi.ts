import { supabase } from "@/integrations/supabase/client";

export const puppiesApi = {
  getAllPuppies: async () => {
    const { data, error } = await supabase
      .from('puppies')
      .select('*')
      .eq('status', 'Available')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match expected Puppy interface
    const transformedData = data?.map(item => ({
      id: item.id,
      name: item.name,
      breed: item.breed,
      birthDate: item.birth_date,
      price: item.price,
      description: item.description,
      status: item.status,
      gender: item.gender,
      image_urls: item.image_urls || [],
      photoUrl: item.photo_url,
      color: item.color,
      weight: item.weight,
      temperament: item.temperament || []
    })) || [];
    
    return { puppies: transformedData };
  },
  
  getPuppyById: async (id: string) => {
    const { data, error } = await supabase
      .from('puppies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match expected Puppy interface
    return {
      id: data.id,
      name: data.name,
      breed: data.breed,
      birthDate: data.birth_date,
      price: data.price,
      description: data.description,
      status: data.status,
      gender: data.gender,
      image_urls: data.image_urls || [],
      photoUrl: data.photo_url,
      color: data.color,
      weight: data.weight,
      temperament: data.temperament || []
    };
  },
};

export const littersApi = {
  getAll: async (filters = {}) => {
    let query = supabase
      .from('litters')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Transform the data to match expected Litter interface
    const transformedData = data?.map(item => ({
      id: item.id,
      name: item.name,
      breed: item.breed,
      damName: item.dam_name,
      sireName: item.sire_name,
      dateOfBirth: item.date_of_birth,
      status: item.status,
      description: item.description,
      coverImageUrl: item.cover_image_url,
      image_urls: item.image_urls || [],
      video_urls: item.video_urls || [],
      puppyCount: item.puppy_count,
      expectedDate: item.expected_date,
      puppies: []
    })) || [];
    
    return { litters: transformedData };
  },
  
  getLitterById: async (id: string) => {
    const { data, error } = await supabase
      .from('litters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transform the data to match expected Litter interface
    return {
      id: data.id,
      name: data.name,
      breed: data.breed,
      damName: data.dam_name,
      sireName: data.sire_name,
      dateOfBirth: data.date_of_birth,
      status: data.status,
      description: data.description,
      coverImageUrl: data.cover_image_url,
      image_urls: data.image_urls || [],
      video_urls: data.video_urls || [],
      puppyCount: data.puppy_count,
      expectedDate: data.expected_date,
      puppies: []
    };
  },

  createLitter: async (litterData: any) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.createLitter(litterData);
  },

  updateLitter: async (id: string, litterData: any) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.updateLitter(id, litterData);
  },

  deleteLitter: async (id: string) => {
    const { adminApi } = await import('./adminApi');
    return adminApi.deleteLitter(id);
  }
};

export const testimonialApi = {
  getAllPublic: async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('admin_approved', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};
