
// --- REAL imports that exist ---
import * as puppiesApi from './puppiesApi';
import * as littersApi from './littersApi';

// --- STUB missing APIs to avoid build errors ---
// These stubs prevent TS errors elsewhere in the app.
const testimonialApi = {
  getAllPublic: async (_params?: any) => [],
};
const adminApi = {};
const blogApi = {
  getPosts: async (_params?: any) => ({ posts: [], pagination: {} }),
  getBySlug: async (_slug: string) => ({}),
};
const uploadApi = {
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

