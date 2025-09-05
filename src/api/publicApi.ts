import { supabase } from "@/integrations/supabase/client";

export const puppiesApi = {
  getAllPuppies: async () => {
    const { data, error } = await supabase
      .from('puppies')
      .select('*')
      .eq('status', 'Available')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { puppies: data || [] };
  },
  
  getPuppyById: async (id: string) => {
    const { data, error } = await supabase
      .from('puppies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
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
    return { litters: data || [] };
  },
  
  getLitterById: async (id: string) => {
    const { data, error } = await supabase
      .from('litters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }
};

export const testimonialApi = {
  getAllPublic: async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};
