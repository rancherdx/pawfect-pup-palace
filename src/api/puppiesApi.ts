import { supabase } from "@/integrations/supabase/client";
import { Puppy } from '@/types/api';

export type PuppyCreationData = Omit<Puppy, 'id' | 'created_at' | 'updated_at'>;
export type PuppyUpdateData = Partial<PuppyCreationData>;

export interface PublicPuppyListResponse {
  puppies: Puppy[];
  pagination?: {
    total: number;
    current_page: number;
    total_pages: number;
  };
}

/**
 * Fetches all available puppies from the database.
 * @param {Record<string, unknown>} [params] - Optional query parameters (currently unused).
 * @returns {Promise<Puppy[]>} A promise that resolves to an array of transformed puppy objects.
 * @throws Will throw an error if the Supabase query fails.
 */
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

/**
 * Fetches all available puppies and wraps the result in a response object with pagination info.
 * @param {Record<string, unknown>} [params] - Optional query parameters passed to `getAll`.
 * @returns {Promise<PublicPuppyListResponse>} A promise that resolves to a response object containing the puppies and mock pagination data.
 */
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

/**
 * Fetches a single puppy by its unique ID.
 * @param {string} id - The UUID of the puppy to fetch.
 * @returns {Promise<Puppy>} A promise that resolves to the transformed puppy object.
 * @throws Will throw an error if the Supabase query fails or if no puppy is found.
 */
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