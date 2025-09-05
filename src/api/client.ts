import { supabase } from "@/integrations/supabase/client";

// Helper function to get current user session
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to check if user is admin
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

// Helper function to ensure user is authenticated
export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

// Helper function to ensure user is admin
export const requireAdmin = async () => {
  const user = await requireAuth();
  const adminStatus = await isAdmin();
  if (!adminStatus) {
    throw new Error('Admin access required');
  }
  return user;
};

// Legacy API request function - replaced with Supabase direct calls
export const apiRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  throw new Error('Use Supabase client directly. Legacy API endpoints have been migrated to Supabase.');
};

// Legacy fetch admin API for compatibility
export const fetchAdminAPI = async (url: string, options: RequestInit = {}) => {
  throw new Error('Use adminApi methods directly instead of fetchAdminAPI');
};