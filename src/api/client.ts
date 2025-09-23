import { supabase } from "@/integrations/supabase/client";

/**
 * Retrieves the currently authenticated user's session from Supabase.
 * @returns {Promise<object|null>} A promise that resolves to the user object if a session exists, otherwise null.
 * @throws Will throw an error if the Supabase `getUser` call fails.
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

/**
 * Checks if the currently authenticated user has an 'admin' or 'super-admin' role.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is an admin, otherwise false.
 */
export const isAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .in('role', ['admin', 'super-admin']);
    
  if (error) return false;
  return data && data.length > 0;
};

/**
 * Ensures that a user is authenticated.
 * @returns {Promise<object>} A promise that resolves to the user object if authenticated.
 * @throws Will throw an error with the message 'Authentication required' if no user is authenticated.
 */
export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

/**
 * Ensures that the current user is authenticated and has admin privileges.
 * @returns {Promise<object>} A promise that resolves to the user object if the user is an admin.
 * @throws Will throw an error if the user is not authenticated or does not have admin privileges.
 */
export const requireAdmin = async () => {
  const user = await requireAuth();
  const adminStatus = await isAdmin();
  if (!adminStatus) {
    throw new Error('Admin access required');
  }
  return user;
};

/**
 * A legacy API request function. This function is deprecated and will always throw an error.
 * @deprecated Use Supabase client methods directly instead.
 * @param {string} endpoint - The API endpoint to call.
 * @param {RequestInit} [options={}] - The request options.
 * @returns {Promise<T>} This function will not return and always throws an error.
 * @throws Will always throw an error indicating that Supabase client should be used directly.
 * @template T
 */
export const apiRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  throw new Error('Use Supabase client directly. Legacy API endpoints have been migrated to Supabase.');
};

/**
 * A legacy function for fetching from the admin API. This function is deprecated and will always throw an error.
 * @deprecated Use methods from `adminApi` namespace directly instead.
 * @param {string} url - The URL to fetch.
 * @param {RequestInit} [options={}] - The request options.
 * @returns {Promise<void>} This function will not return and always throws an error.
 * @throws Will always throw an error indicating that `adminApi` methods should be used instead.
 */
export const fetchAdminAPI = async (url: string, options: RequestInit = {}) => {
  throw new Error('Use adminApi methods directly instead of fetchAdminAPI');
};