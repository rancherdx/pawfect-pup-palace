import { fetchAdminAPI } from "./client";

export const adminApi = {
  // Users
  getAllUsers: (params: { page?: number; limit?: number; search?: string } = {}) => 
    fetchAdminAPI('/api/admin/users', { method: 'GET' }),
  
  updateUser: (id: string, userData: Record<string, unknown>) => 
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

  createPuppy: (puppyData: Record<string, unknown>) => 
    fetchAdminAPI('/api/admin/puppies', {
      method: 'POST',
      body: JSON.stringify(puppyData),
    }),

  updatePuppy: (id: string, puppyData: Record<string, unknown>) => 
    fetchAdminAPI(`/api/admin/puppies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(puppyData),
    }),

  deletePuppy: (id: string) => 
    fetchAdminAPI(`/api/admin/puppies/${id}`, { method: 'DELETE' }),

  // Stud Dogs
  getStudDogs: (params: { page?: number; limit?: number; search?: string } = {}) => 
    fetchAdminAPI('/api/admin/stud-dogs', { method: 'GET' }),

  createStudDog: (studDogData: Record<string, unknown>) => 
    fetchAdminAPI('/api/admin/stud-dogs', {
      method: 'POST',
      body: JSON.stringify(studDogData),
    }),

  updateStudDog: (id: string, studDogData: Record<string, unknown>) => 
    fetchAdminAPI(`/api/admin/stud-dogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studDogData),
    }),

  deleteStudDog: (id: string) => 
    fetchAdminAPI(`/api/admin/stud-dogs/${id}`, { method: 'DELETE' }),

  // Blog Posts
  getAllPosts: (params: { status?: string; page?: number; limit?: number } = {}) => 
    fetchAdminAPI('/api/admin/blog-posts', { method: 'GET' }),

  createPost: (postData: Record<string, unknown>) => 
    fetchAdminAPI('/api/admin/blog-posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    }),

  updatePost: (id: string, postData: Record<string, unknown>) => 
    fetchAdminAPI(`/api/admin/blog-posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    }),

  deletePost: (id: string) => 
    fetchAdminAPI(`/api/admin/blog-posts/${id}`, { method: 'DELETE' }),

  // Testimonials
  getTestimonials: async () => {
    return fetchAdminAPI('/admin/testimonials');
  },
  createTestimonial: async (data: Record<string, unknown>) => {
    return fetchAdminAPI('/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateTestimonial: async (id: string, data: Record<string, unknown>) => {
    return fetchAdminAPI(`/admin/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteTestimonial: async (id: string) => {
    return fetchAdminAPI(`/admin/testimonials/${id}`, {
      method: 'DELETE',
    });
  },

  // Breeds
  getBreedTemplates: async () => {
    return fetchAdminAPI('/admin/breed-templates');
  },
  createBreedTemplate: async (data: Record<string, unknown>) => {
    return fetchAdminAPI('/admin/breed-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateBreedTemplate: async (id: string, data: Record<string, unknown>) => {
    return fetchAdminAPI(`/admin/breed-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteBreedTemplate: async (id: string) => {
    return fetchAdminAPI(`/admin/breed-templates/${id}`, {
      method: 'DELETE',
    });
  },

  // Litters
  getAllLitters: async (filters = {}) => {
    let query = '/admin/litters';
    if (Object.keys(filters).length) {
      query += '?' + new URLSearchParams(filters).toString();
    }
    return fetchAdminAPI(query);
  },
  getLitterById: async (id: string) => {
    return fetchAdminAPI(`/admin/litters/${id}`);
  },
  createLitter: async (data: Record<string, unknown>) => {
    return fetchAdminAPI('/admin/litters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateLitter: async (id: string, data: Record<string, unknown>) => {
    return fetchAdminAPI(`/admin/litters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteLitter: async (id: string) => {
    return fetchAdminAPI(`/admin/litters/${id}`, {
      method: 'DELETE',
    });
  },

  // Third-party integration management
  getIntegrations: () => fetchAdminAPI('/admin/integrations'),
  createIntegration: (data: Record<string, unknown>) => fetchAdminAPI('/admin/integrations', { method: 'POST', body: JSON.stringify(data) }),
  updateIntegration: (id: string, data: Record<string, unknown>) => fetchAdminAPI(`/admin/integrations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIntegration: (id: string) => fetchAdminAPI(`/admin/integrations/${id}`, { method: 'DELETE' }),

  // Site settings management
  getSiteSettings: () => fetchAdminAPI('/admin/settings'),
  updateSiteSettings: (data: Record<string, unknown>) => fetchAdminAPI('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
