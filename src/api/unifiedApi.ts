import { supabase } from "@/integrations/supabase/client";
import { requireAuth } from "./client";

// Auth API using Supabase Auth
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  },
  
  register: async (userData: { email: string; password: string; name: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name
        }
      }
    });
    if (error) throw error;
    return data;
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },
  
  getProfile: async () => {
    const user = await requireAuth();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateProfile: async (userData: any) => {
    const user = await requireAuth();
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Public API
export const publicApi = {
  getAllPuppies: async (params?: { breed?: string; status?: string; limit?: number; page?: number }) => {
    let query = supabase
      .from('puppies')
      .select('*')
      .eq('status', 'Available');
    
    if (params?.breed) {
      query = query.eq('breed', params.breed);
    }
    
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    return {
      puppies: data || [],
      pagination: {}
    };
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

  getAllLitters: async (params?: { breed?: string; status?: string; limit?: number; offset?: number }) => {
    let query = supabase
      .from('litters')
      .select('*')
      .eq('status', 'Active');
    
    if (params?.breed) {
      query = query.eq('breed', params.breed);
    }
    
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    
    if (params?.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    
    return {
      litters: data || [],
      pagination: {}
    };
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