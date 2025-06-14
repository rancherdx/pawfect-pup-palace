
// DO NOT import from './authApi' if it doesn't exist.
// If you later add that file, you can uncomment these lines.

// --- REAL imports that exist ---
import * as puppiesApi from './puppiesApi';
import * as littersApi from './littersApi';

// --- STUB missing APIs to avoid build errors ---
// These stubs prevent TS errors elsewhere in the app.
export const testimonialApi = {
  getAllPublic: async (_params?: any) => [],
};
export const adminApi = {};
export const blogApi = {
  getPosts: async (_params?: any) => ({ posts: [], pagination: {} }),
  getBySlug: async (_slug: string) => ({}),
};
export const uploadApi = {
  uploadFile: async (..._args: any[]) => ({}),
};

// --- EXPORTS ---
export {
  puppiesApi,
  littersApi,
  testimonialApi,
  adminApi,
  blogApi,
  uploadApi,
};
