import { supabase } from "@/integrations/supabase/client";
import { Puppy, PublicPuppyListResponse } from '@/types/puppy';

export const getAll = async (params?: Record<string, unknown>): Promise<Puppy[]> => {
  const { data, error } = await supabase
    .from('puppies')
    .select('*')
    .eq('status', 'Available')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  // Transform the data to match the expected Puppy interface
  return data?.map(item => ({
    id: item.id,
    name: item.name,
    breed: item.breed,
    birth_date: item.birth_date,
    price: item.price,
    description: item.description,
    status: item.status as any,
    gender: item.gender as any,
    image_urls: item.image_urls || [],
    color: item.color,
    weight: item.weight
  })) || [];
};

export const getAllPuppies = async (params?: Record<string, unknown>): Promise<PublicPuppyListResponse> => {
  const puppies = await getAll(params);
  return { 
    puppies, 
    pagination: { 
      current_page: 1, 
      total_pages: 1, 
      total: puppies.length 
    } 
  };
};

export const getPuppyById = async (id: string): Promise<Puppy> => {
  const { data, error } = await supabase
    .from('puppies')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  
  // Transform the data to match the expected Puppy interface
  return {
    id: data.id,
    name: data.name,
    breed: data.breed,
    birth_date: data.birth_date,
    price: data.price,
    description: data.description,
    status: data.status as any,
    gender: data.gender as any,
    image_urls: data.image_urls || [],
    color: data.color,
    weight: data.weight
  };
};