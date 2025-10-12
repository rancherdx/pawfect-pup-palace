import { supabase } from "@/integrations/supabase/client";
import { Parent } from '@/types/api';

export type { Parent };

export interface ParentListResponse {
  parents: Parent[];
  pagination?: {
    total: number;
    current_page: number;
    total_pages: number;
  };
}

export type ParentCreationData = Omit<Parent, 'id' | 'created_at' | 'updated_at'>;
export type ParentUpdateData = Partial<ParentCreationData>;

/**
 * Fetches all active parents from the database.
 */
export const getAll = async (params?: Record<string, unknown>): Promise<ParentListResponse> => {
  let query = supabase
    .from('parents')
    .select('*')
    .eq('is_active', true);
    
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  
  const transformedData: Parent[] = data?.map(item => ({
    id: item.id,
    name: item.name,
    breed: item.breed,
    gender: item.gender as 'Male' | 'Female',
    description: item.description,
    image_urls: item.image_urls || [],
    certifications: item.certifications || [],
    bloodline_info: item.bloodline_info,
    health_clearances: item.health_clearances || [],
    is_active: item.is_active,
    created_at: item.created_at,
    updated_at: item.updated_at
  })) || [];
  
  return { 
    parents: transformedData, 
    pagination: { 
      total: transformedData.length, 
      current_page: 1, 
      total_pages: 1 
    } 
  };
};

/**
 * Fetches a single parent by its unique ID.
 */
export const getParentById = async (id: string): Promise<Parent> => {
  const { data, error } = await supabase
    .from('parents')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    breed: data.breed,
    gender: data.gender as 'Male' | 'Female',
    description: data.description,
    image_urls: data.image_urls || [],
    certifications: data.certifications || [],
    bloodline_info: data.bloodline_info,
    health_clearances: data.health_clearances || [],
    is_active: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
};

/**
 * Creates a new parent in the database.
 */
export const createParent = async (data: ParentCreationData): Promise<Parent> => {
  const { data: newParent, error } = await supabase
    .from('parents')
    .insert({
      name: data.name,
      breed: data.breed,
      gender: data.gender,
      description: data.description,
      image_urls: data.image_urls || [],
      certifications: data.certifications || [],
      bloodline_info: data.bloodline_info,
      health_clearances: data.health_clearances || [],
      is_active: data.is_active
    })
    .select('*')
    .single();
    
  if (error) throw error;
  
  return {
    id: newParent.id,
    name: newParent.name,
    breed: newParent.breed,
    gender: newParent.gender as 'Male' | 'Female',
    description: newParent.description,
    image_urls: newParent.image_urls || [],
    certifications: newParent.certifications || [],
    bloodline_info: newParent.bloodline_info,
    health_clearances: newParent.health_clearances || [],
    is_active: newParent.is_active,
    created_at: newParent.created_at,
    updated_at: newParent.updated_at
  };
};

/**
 * Updates an existing parent in the database.
 */
export const updateParent = async (id: string, data: ParentUpdateData): Promise<Parent> => {
  const { data: updatedParent, error } = await supabase
    .from('parents')
    .update({
      name: data.name,
      breed: data.breed,
      gender: data.gender,
      description: data.description,
      image_urls: data.image_urls,
      certifications: data.certifications,
      bloodline_info: data.bloodline_info,
      health_clearances: data.health_clearances,
      is_active: data.is_active
    })
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) throw error;
  
  return {
    id: updatedParent.id,
    name: updatedParent.name,
    breed: updatedParent.breed,
    gender: updatedParent.gender as 'Male' | 'Female',
    description: updatedParent.description,
    image_urls: updatedParent.image_urls || [],
    certifications: updatedParent.certifications || [],
    bloodline_info: updatedParent.bloodline_info,
    health_clearances: updatedParent.health_clearances || [],
    is_active: updatedParent.is_active,
    created_at: updatedParent.created_at,
    updated_at: updatedParent.updated_at
  };
};

/**
 * Deletes a parent from the database.
 */
export const deleteParent = async (id: string): Promise<{ id: string }> => {
  const { error } = await supabase
    .from('parents')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return { id };
};