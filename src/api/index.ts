
// --- REAL imports that exist ---
import * as puppiesApi from './puppiesApi';
import * as littersApi from './littersApi';

// --- fetchAdminAPI STUB (for admin pages expecting fetchAdminAPI as a default function) ---
/** Dummy fetchAdminAPI implementation for wiring up admin pages. Replace with real API as appropriate. */
const fetchAdminAPI = async (url: string, options?: RequestInit) => {
  // Just return a dummy shape, enough for useQuery/Mutation fake calls.
  // Add more branches if/when strict types needed
  if (url.includes("users")) {
    return {
      users: [],
      currentPage: 1,
      totalPages: 1,
      totalUsers: 0,
      limit: 10,
    };
  }
  if (url.includes("stud-dogs")) {
    return {
      studDogs: [],
      currentPage: 1,
      totalPages: 1,
      totalStudDogs: 0,
      limit: 10,
    };
  }
  // Fallback
  return {};
};

// --- ADMIN API STUB: stub out all required admin methods so TS doesn't error ---
const adminApi = {
  // Puppies
  getAllPuppies: async () => ({ puppies: [], pagination: {} }),
  createPuppy: async (_data: any) => ({}),
  updatePuppy: async (_id: string, _data: any) => ({}),
  deletePuppy: async (_id: string) => ({}),
  syncPuppyWithSquare: async (_id: string) => ({}),
  // Litters
  getAllLitters: async () => ({ litters: [], pagination: {} }),
  createLitter: async (_data: any) => ({}),
  updateLitter: async (_id: string, _data: any) => ({}),
  deleteLitter: async (_id: string) => ({}),
  // Breed Templates
  getBreedTemplates: async () => [],
  // Testimonials
  getAllTestimonials: async () => [],
  createTestimonial: async (_data: any) => ({}),
  updateTestimonial: async (_id: string, _data: any) => ({}),
  deleteTestimonial: async (_id: string) => ({}),
  // Blog Posts (needed in BlogManager)
  deletePost: async (_id: string) => ({}),
  updatePost: async (_id: string, _data: any) => ({}),
  createPost: async (_data: any) => ({}),
  // Stud Dogs, Users, etc can be added here as needed
};

// --- TESTIMONIAL API stub ---
const testimonialApi = {
  getAllPublic: async (_params?: any) => [],
  getAllTestimonials: async () => [],
  createTestimonial: async (_data: any) => ({}),
  updateTestimonial: async (_id: string, _data: any) => ({}),
  deleteTestimonial: async (_id: string) => ({}),
};

// --- BLOG API stub ---
const blogApi = {
  getPosts: async (_params?: any) => ({ posts: [], pagination: {} }),
  getBySlug: async (_slug: string) => ({}),
  // CRUD here is stubbed on adminApi (for admin use)
};

// --- UPLOAD API stub ---
const uploadApi = {
  uploadFile: async (..._args: any[]) => ({}),
};

// --- EXPORTS ---
export {
  puppiesApi,
  littersApi,
  adminApi,
  testimonialApi,
  blogApi,
  uploadApi,
  fetchAdminAPI,
};
