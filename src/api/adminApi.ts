import { supabase } from "@/integrations/supabase/client";
import { requireAdmin } from "./client";

export const adminApi = {
  // Users
  getAllUsers: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    await requireAdmin();
    let query = supabase
      .from('profiles')
      .select(`
        *,
        user_roles!inner(role)
      `);
    
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data };
  },
  
  updateUser: async (id: string, userData: Record<string, unknown>) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteUser: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  // Puppies
  getAllPuppies: async () => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('puppies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { puppies: data || [], pagination: {} };
  },

  createPuppy: async (puppyData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('puppies')
      .insert(puppyData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updatePuppy: async (id: string, puppyData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('puppies')
      .update(puppyData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deletePuppy: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('puppies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  // Litters
  getAllLitters: async (filters = {}) => {
    await requireAdmin();
    let query = supabase
      .from('litters')
      .select('*')
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    return { litters: data || [] };
  },

  getLitterById: async (id: string) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('litters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  createLitter: async (litterData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('litters')
      .insert(litterData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateLitter: async (id: string, litterData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('litters')
      .update(litterData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteLitter: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('litters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};