
import { fetchAPI } from "@/utils/fetchAPI";
import { User } from "@/types";

const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export const fetchAdminAPI = async (url: string, options: any = {}) => {
  const mergedOptions = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    ...options,
  };

  const response = await fetch(`${STRAPI_API_URL}${url}`, mergedOptions);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch data');
  }
  return await response.json();
};

export const adminApi = {
  // Users
  getAllUsers: (params: { page?: number; limit?: number; search?: string } = {}) => 
    fetchAdminAPI('/api/admin/users', { method: 'GET' }),
  
  updateUser: (id: string, userData: any) => 
    fetchAdminAPI(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteUser: (id: string) => 
    fetchAdminAPI(`/api/admin/users/${id}`, { method: 'DELETE' }),

  // Puppies
  getAllPuppies: async () => {
    const response = await fetchAdminAPI('/api/admin/puppies', { method: 'GET' });
    return { puppies: response.data || response.puppies || [], pagination: response.pagination || {} };
  },

  createPuppy: (puppyData: any) => 
    fetchAdminAPI('/api/admin/puppies', {
      method: 'POST',
      body: JSON.stringify(puppyData),
    }),

  updatePuppy: (id: string, puppyData: any) => 
    fetchAdminAPI(`/api/admin/puppies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(puppyData),
    }),

  deletePuppy: (id: string) => 
    fetchAdminAPI(`/api/admin/puppies/${id}`, { method: 'DELETE' }),

  // Stud Dogs
  getStudDogs: (params: { page?: number; limit?: number; search?: string } = {}) => 
    fetchAdminAPI('/api/admin/stud-dogs', { method: 'GET' }),

  createStudDog: (studDogData: any) => 
    fetchAdminAPI('/api/admin/stud-dogs', {
      method: 'POST',
      body: JSON.stringify(studDogData),
    }),

  updateStudDog: (id: string, studDogData: any) => 
    fetchAdminAPI(`/api/admin/stud-dogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studDogData),
    }),

  deleteStudDog: (id: string) => 
    fetchAdminAPI(`/api/admin/stud-dogs/${id}`, { method: 'DELETE' }),

  // Blog Posts
  getAllPosts: (params: { status?: string; page?: number; limit?: number } = {}) => 
    fetchAdminAPI('/api/admin/blog-posts', { method: 'GET' }),

  createPost: (postData: any) => 
    fetchAdminAPI('/api/admin/blog-posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),

  updatePost: (id: string, postData: any) => 
    fetchAdminAPI(`/api/admin/blog-posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    }),

  deletePost: (id: string) => 
    fetchAdminAPI(`/api/admin/blog-posts/${id}`, { method: 'DELETE' }),

  // Testimonials
  getTestimonials: async () => {
    return fetchAdminAPI('/api/testimonials');
  },
  createTestimonial: async (data: any) => {
    return fetchAdminAPI('/api/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateTestimonial: async (id: string, data: any) => {
    return fetchAdminAPI(`/api/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteTestimonial: async (id: string) => {
    return fetchAdminAPI(`/api/testimonials/${id}`, {
      method: 'DELETE',
    });
  },
  // Breeds
  getBreedTemplates: async () => {
    return fetchAdminAPI('/api/breed-templates');
  },
  createBreedTemplate: async (data: any) => {
    return fetchAdminAPI('/api/breed-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateBreedTemplate: async (id: string, data: any) => {
    return fetchAdminAPI(`/api/breed-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
   deleteBreedTemplate: async (id: string) => {
    return fetchAdminAPI(`/api/breed-templates/${id}`, {
      method: 'DELETE',
    });
  },
  // Litters
  getAllLitters: async (filters = {}) => {
    let query = '/api/litters';
    if (Object.keys(filters).length) {
      query += '?' + new URLSearchParams(filters).toString();
    }
    return fetchAdminAPI(query);
  },
  getLitterById: async (id: string) => {
    return fetchAdminAPI(`/api/litters/${id}`);
  },
  createLitter: async (data: any) => {
    return fetchAdminAPI('/api/litters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateLitter: async (id: string, data: any) => {
    return fetchAdminAPI(`/api/litters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteLitter: async (id: string) => {
    return fetchAdminAPI(`/api/litters/${id}`, {
      method: 'DELETE',
    });
  },
};

export const blogApi = {
    getPosts: async (params: { page?: number; limit?: number; category?: string }) => {
        let query = '/api/posts?populate=*';
        if (params.page) query += `&pagination[page]=${params.page}`;
        if (params.limit) query += `&pagination[pageSize]=${params.limit}`;
        if (params.category) query += `&filters[category][$eq]=${params.category}`;
        return fetchAPI(query);
    },
    getBySlug: async (slug: string) => {
        const query = `/api/posts?filters[slug][$eq]=${slug}&populate=*`;
        const result = await fetchAPI(query);
        return result?.data?.[0]?.attributes;
    },
};

export const puppiesApi = {
    getAllPuppies: async () => {
        const response = await fetchAPI('/api/puppies');
        return { puppies: response.data || response.puppies || [] };
    },
    getPuppyById: async (id: string) => {
        const response = await fetchAPI(`/api/puppies/${id}`);
        return response.data || response;
    },
};

export const littersApi = {
  getAll: async (filters = {}) => {
    let query = '/api/litters';
    if (Object.keys(filters).length) {
      query += '?' + new URLSearchParams(filters).toString();
    }
    return fetchAPI(query);
  },
  getLitterById: async (id: string) => {
    const query = `/api/litters/${id}`;
    return fetchAPI(query);
  },
  createLitter: async (data: any) => {
    const query = `/api/litters`;
     return fetchAPI(query, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
   updateLitter: async (id: string, data: any) => {
    return fetchAPI(`/api/litters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
   deleteLitter: async (id: string) => {
    return fetchAPI(`/api/litters/${id}`, {
      method: 'DELETE',
    });
  },
};

export const testimonialApi = {
  getAllPublic: async () => {
    const response = await fetchAPI('/api/testimonials');
    return response.data || response;
  },
};
