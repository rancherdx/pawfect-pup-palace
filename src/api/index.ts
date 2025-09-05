// Main API exports - all using Supabase directly
export { authApi, publicApi } from './unifiedApi';
export { adminApi } from './adminApi';
export { puppiesApi, littersApi, testimonialApi } from './publicApi';

// Utility functions for auth
export { getCurrentUser, isAdmin, requireAuth, requireAdmin } from './client';