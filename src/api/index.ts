
// --- REAL imports that exist ---
import * as puppiesApi from './puppiesApi';
import * as littersApi from './littersApi';

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
  createPost: async (_data: any) => ({}),
  updatePost: async (_id: string, _data: any) => ({}),
  deletePost: async (_id: string) => ({}),
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
};
