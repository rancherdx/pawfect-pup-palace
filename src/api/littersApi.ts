import { supabase } from "@/integrations/supabase/client";
import { Litter, LitterListResponse, LitterCreationData, LitterUpdateData } from '@/types/litter';

/**
 * Fetches all active litters from the database.
 * @param {Record<string, unknown>} [params] - Optional query parameters (currently unused).
 * @returns {Promise<LitterListResponse>} A promise that resolves to an object containing the list of litters and pagination info.
 * @throws Will throw an error if the Supabase query fails.
 */
export const getAll = async (params?: Record<string, unknown>): Promise<LitterListResponse> => {
  let query = supabase
    .from('litters')
    .select('*')
    .eq('status', 'Active');
    
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  
  // Transform the data to match the expected Litter interface
  const transformedData: Litter[] = data?.map(item => ({
    id: item.id,
    name: item.name,
    breed: item.breed,
    damName: item.dam_name,
    sireName: item.sire_name,
    dateOfBirth: item.date_of_birth,
    status: item.status as any,
    description: item.description,
    coverImageUrl: item.cover_image_url,
    image_urls: item.image_urls || [],
    video_urls: item.video_urls || [],
    puppyCount: item.puppy_count,
    expectedDate: item.expected_date,
    puppies: []
  })) || [];
  
  return { 
    litters: transformedData, 
    pagination: { 
      total: transformedData.length, 
      current_page: 1, 
      total_pages: 1 
    } 
  };
};

/**
 * @deprecated Use `getAll` instead.
 */
export const getAllLitters = getAll;

/**
 * Fetches a single litter by its unique ID.
 * @param {string} id - The UUID of the litter to fetch.
 * @returns {Promise<Litter>} A promise that resolves to the transformed litter object.
 * @throws Will throw an error if the Supabase query fails or if no litter is found.
 */
export const getLitterById = async (id: string): Promise<Litter> => {
  const { data, error } = await supabase
    .from('litters')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  
  // Transform the data to match the expected Litter interface
  return {
    id: data.id,
    name: data.name,
    breed: data.breed,
    damName: data.dam_name,
    sireName: data.sire_name,
    dateOfBirth: data.date_of_birth,
    status: data.status as any,
    description: data.description,
    coverImageUrl: data.cover_image_url,
    image_urls: data.image_urls || [],
    video_urls: data.video_urls || [],
    puppyCount: data.puppy_count,
    expectedDate: data.expected_date,
    puppies: []
  };
};

/**
 * Creates a new litter in the database.
 * @param {LitterCreationData} data - The data for the new litter.
 * @returns {Promise<Litter>} A promise that resolves to the newly created and transformed litter object.
 * @throws Will throw an error if the Supabase insert operation fails.
 */
export const createLitter = async (data: LitterCreationData): Promise<Litter> => {
  const { data: newLitter, error } = await supabase
    .from('litters')
    .insert({
      name: data.name,
      breed: data.breed,
      dam_name: data.damName,
      sire_name: data.sireName,
      date_of_birth: data.dateOfBirth,
      status: data.status,
      description: data.description,
      cover_image_url: data.coverImageUrl,
      image_urls: data.image_urls || [],
      video_urls: data.video_urls || [],
      puppy_count: data.puppyCount,
      expected_date: data.expectedDate
    })
    .select('*')
    .single();
    
  if (error) throw error;
  
  return {
    id: newLitter.id,
    name: newLitter.name,
    breed: newLitter.breed,
    damName: newLitter.dam_name,
    sireName: newLitter.sire_name,
    dateOfBirth: newLitter.date_of_birth,
    status: newLitter.status as any,
    description: newLitter.description,
    coverImageUrl: newLitter.cover_image_url,
    image_urls: newLitter.image_urls || [],
    video_urls: newLitter.video_urls || [],
    puppyCount: newLitter.puppy_count,
    expectedDate: newLitter.expected_date,
    puppies: []
  };
};

/**
 * Updates an existing litter in the database.
 * @param {string} id - The UUID of the litter to update.
 * @param {LitterUpdateData} data - An object containing the fields to update.
 * @returns {Promise<Litter>} A promise that resolves to the updated and transformed litter object.
 * @throws Will throw an error if the Supabase update operation fails.
 */
export const updateLitter = async (id: string, data: LitterUpdateData): Promise<Litter> => {
  const { data: updatedLitter, error } = await supabase
    .from('litters')
    .update({
      name: data.name,
      breed: data.breed,
      dam_name: data.damName,
      sire_name: data.sireName,
      date_of_birth: data.dateOfBirth,
      status: data.status,
      description: data.description,
      cover_image_url: data.coverImageUrl,
      image_urls: data.image_urls || [],
      video_urls: data.video_urls || [],
      puppy_count: data.puppyCount,
      expected_date: data.expectedDate
    })
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) throw error;
  
  return {
    id: updatedLitter.id,
    name: updatedLitter.name,
    breed: updatedLitter.breed,
    damName: updatedLitter.dam_name,
    sireName: updatedLitter.sire_name,
    dateOfBirth: updatedLitter.date_of_birth,
    status: updatedLitter.status as any,
    description: updatedLitter.description,
    coverImageUrl: updatedLitter.cover_image_url,
    image_urls: updatedLitter.image_urls || [],
    video_urls: updatedLitter.video_urls || [],
    puppyCount: updatedLitter.puppy_count,
    expectedDate: updatedLitter.expected_date,
    puppies: []
  };
};

/**
 * Deletes a litter from the database.
 * @param {string} id - The UUID of the litter to delete.
 * @returns {Promise<{ id: string }>} A promise that resolves to an object containing the ID of the deleted litter.
 * @throws Will throw an error if the Supabase delete operation fails.
 */
export const deleteLitter = async (id: string): Promise<{ id: string }> => {
  const { error } = await supabase
    .from('litters')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return { id };
};