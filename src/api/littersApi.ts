import { supabase } from "@/integrations/supabase/client";
import { Litter, LitterCreationData, LitterUpdateData } from '@/types/api';

export interface LitterListResponse {
  litters: Litter[];
  pagination?: {
    total: number;
    current_page: number;
    total_pages: number;
  };
}

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
    slug: item.slug,
    breed: item.breed,
    dam_name: item.dam_name,
    sire_name: item.sire_name,
    dam_id: item.dam_id,
    sire_id: item.sire_id,
    date_of_birth: item.date_of_birth,
    status: item.status,
    description: item.description,
    cover_image_url: item.cover_image_url,
    image_urls: item.image_urls || [],
    video_urls: item.video_urls || [],
    puppy_count: item.puppy_count,
    expected_date: item.expected_date,
    breed_template_id: item.breed_template_id,
    created_at: item.created_at,
    updated_at: item.updated_at
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
    slug: data.slug,
    breed: data.breed,
    dam_name: data.dam_name,
    sire_name: data.sire_name,
    dam_id: data.dam_id,
    sire_id: data.sire_id,
    date_of_birth: data.date_of_birth,
    status: data.status,
    description: data.description,
    cover_image_url: data.cover_image_url,
    image_urls: data.image_urls || [],
    video_urls: data.video_urls || [],
    puppy_count: data.puppy_count,
    expected_date: data.expected_date,
    breed_template_id: data.breed_template_id,
    created_at: data.created_at,
    updated_at: data.updated_at
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
      dam_name: data.dam_name,
      sire_name: data.sire_name,
      dam_id: data.dam_id,
      sire_id: data.sire_id,
      date_of_birth: data.date_of_birth,
      status: data.status,
      description: data.description,
      cover_image_url: data.cover_image_url,
      image_urls: data.image_urls || [],
      video_urls: data.video_urls || [],
      puppy_count: data.puppy_count,
      expected_date: data.expected_date,
      breed_template_id: data.breed_template_id,
      slug: data.slug
    })
    .select('*')
    .single();
    
  if (error) throw error;
  
  return {
    id: newLitter.id,
    name: newLitter.name,
    slug: newLitter.slug,
    breed: newLitter.breed,
    dam_name: newLitter.dam_name,
    sire_name: newLitter.sire_name,
    dam_id: newLitter.dam_id,
    sire_id: newLitter.sire_id,
    date_of_birth: newLitter.date_of_birth,
    status: newLitter.status,
    description: newLitter.description,
    cover_image_url: newLitter.cover_image_url,
    image_urls: newLitter.image_urls || [],
    video_urls: newLitter.video_urls || [],
    puppy_count: newLitter.puppy_count,
    expected_date: newLitter.expected_date,
    breed_template_id: newLitter.breed_template_id,
    created_at: newLitter.created_at,
    updated_at: newLitter.updated_at
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
  const updateData: Record<string, any> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.breed !== undefined) updateData.breed = data.breed;
  if (data.dam_name !== undefined) updateData.dam_name = data.dam_name;
  if (data.sire_name !== undefined) updateData.sire_name = data.sire_name;
  if (data.dam_id !== undefined) updateData.dam_id = data.dam_id;
  if (data.sire_id !== undefined) updateData.sire_id = data.sire_id;
  if (data.date_of_birth !== undefined) updateData.date_of_birth = data.date_of_birth;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.cover_image_url !== undefined) updateData.cover_image_url = data.cover_image_url;
  if (data.image_urls !== undefined) updateData.image_urls = data.image_urls;
  if (data.video_urls !== undefined) updateData.video_urls = data.video_urls;
  if (data.puppy_count !== undefined) updateData.puppy_count = data.puppy_count;
  if (data.expected_date !== undefined) updateData.expected_date = data.expected_date;
  if (data.breed_template_id !== undefined) updateData.breed_template_id = data.breed_template_id;
  if (data.slug !== undefined) updateData.slug = data.slug;

  const { data: updatedLitter, error } = await supabase
    .from('litters')
    .update(updateData)
    .eq('id', id)
    .select('*')
    .single();
    
  if (error) throw error;
  
  return {
    id: updatedLitter.id,
    name: updatedLitter.name,
    slug: updatedLitter.slug,
    breed: updatedLitter.breed,
    dam_name: updatedLitter.dam_name,
    sire_name: updatedLitter.sire_name,
    dam_id: updatedLitter.dam_id,
    sire_id: updatedLitter.sire_id,
    date_of_birth: updatedLitter.date_of_birth,
    status: updatedLitter.status,
    description: updatedLitter.description,
    cover_image_url: updatedLitter.cover_image_url,
    image_urls: updatedLitter.image_urls || [],
    video_urls: updatedLitter.video_urls || [],
    puppy_count: updatedLitter.puppy_count,
    expected_date: updatedLitter.expected_date,
    breed_template_id: updatedLitter.breed_template_id,
    created_at: updatedLitter.created_at,
    updated_at: updatedLitter.updated_at
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