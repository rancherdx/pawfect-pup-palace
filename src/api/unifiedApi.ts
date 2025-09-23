import { supabase } from "@/integrations/supabase/client";
import { requireAuth } from "./client";

/**
 * @namespace authApi
 * @description A collection of functions for handling user authentication and profile management using Supabase Auth.
 */
export const authApi = {
  /**
   * Signs in a user with their email and password.
   * @param {object} credentials - The user's login credentials.
   * @param {string} credentials.email - The user's email address.
   * @param {string} credentials.password - The user's password.
   * @returns {Promise<any>} A promise that resolves with the session data upon successful login.
   * @throws Will throw an error if the sign-in attempt fails.
   */
  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  },
  
  /**
   * Registers a new user with an email, password, and name.
   * @param {object} userData - The data for the new user.
   * @param {string} userData.email - The new user's email address.
   * @param {string} userData.password - The new user's password.
   * @param {string} userData.name - The new user's name.
   * @returns {Promise<any>} A promise that resolves with the new user's data upon successful registration.
   * @throws Will throw an error if the sign-up attempt fails.
   */
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
  
  /**
   * Signs out the currently authenticated user.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   * @throws Will throw an error if the sign-out attempt fails.
   */
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  },
  
  /**
   * Fetches the profile of the currently authenticated user.
   * Requires authentication.
   * @returns {Promise<any>} A promise that resolves to the user's profile data.
   * @throws Will throw an error if the user is not authenticated or if the Supabase query fails.
   */
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
  
  /**
   * Updates the profile of the currently authenticated user.
   * Requires authentication.
   * @param {any} userData - An object containing the profile data to update.
   * @returns {Promise<any>} A promise that resolves to the updated profile data.
   * @throws Will throw an error if the user is not authenticated or if the Supabase query fails.
   */
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

/**
 * @namespace publicApi
 * @description A collection of public-facing API functions for fetching data like puppies and litters.
 * @deprecated This version of publicApi may be outdated. Prefer using the one exported from `src/api/publicApi.ts`.
 */
export const publicApi = {
  /**
   * Fetches all available puppies, with optional filtering.
   * @param {object} [params] - Optional parameters for filtering and pagination.
   * @param {string} [params.breed] - Filter by breed.
   * @param {string} [params.status] - Filter by status.
   * @param {number} [params.limit] - The maximum number of results to return.
   * @param {number} [params.page] - The page number for pagination.
   * @returns {Promise<{puppies: any[], pagination: object}>} A promise that resolves to an object containing puppies and pagination info.
   * @throws Will throw an error if the Supabase query fails.
   */
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

  /**
   * Fetches a single puppy by its ID.
   * @param {string} id - The UUID of the puppy to fetch.
   * @returns {Promise<any>} A promise that resolves to the puppy object.
   * @throws Will throw an error if the Supabase query fails.
   */
  getPuppyById: async (id: string) => {
    const { data, error } = await supabase
      .from('puppies')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Fetches all active litters, with optional filtering and pagination.
   * @param {object} [params] - Optional parameters.
   * @param {string} [params.breed] - Filter by breed.
   * @param {string} [params.status] - Filter by status.
   * @param {number} [params.limit] - The maximum number of results.
   * @param {number} [params.offset] - The starting offset for pagination.
   * @returns {Promise<{litters: any[], pagination: object}>} A promise that resolves to an object containing litters and pagination info.
   * @throws Will throw an error if the Supabase query fails.
   */
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

  /**
   * Fetches a single litter by its ID.
   * @param {string} id - The UUID of the litter to fetch.
   * @returns {Promise<any>} A promise that resolves to the litter object.
   * @throws Will throw an error if the Supabase query fails.
   */
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