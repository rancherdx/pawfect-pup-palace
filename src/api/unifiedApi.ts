
// Unified API client for all backend calls
import type { Litter, LitterCreationData, LitterUpdateData, LitterListResponse } from '@/types/litter';
import type { Puppy, PublicPuppyListResponse } from '@/types/puppy';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Generic API request function with proper error handling
async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch data' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('jwtToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  register: async (userData: { email: string; password: string; name: string }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
  
  getProfile: async () => {
    return apiRequest('/users/me', {
      headers: getAuthHeaders(),
    });
  },
  
  updateProfile: async (userData: any) => {
    return apiRequest('/users/me/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
  },
  
  refreshToken: async (refreshToken: string) => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};

// Public API
export const publicApi = {
  // Puppies
  getAllPuppies: async (params?: { breed?: string; status?: string; limit?: number; page?: number }): Promise<PublicPuppyListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.breed) searchParams.set('breed', params.breed);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const result = await apiRequest(`/puppies${query}`);
    
    // Ensure consistent response structure
    return {
      puppies: result.puppies || result.data || [],
      pagination: result.pagination || {}
    };
  },

  getPuppyById: async (id: string): Promise<Puppy> => {
    return apiRequest(`/puppies/${id}`);
  },

  // Litters
  getAllLitters: async (params?: { breed?: string; status?: string; limit?: number; offset?: number }): Promise<LitterListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.breed) searchParams.set('breed', params.breed);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest(`/litters${query}`);
  },

  getLitterById: async (id: string): Promise<Litter> => {
    return apiRequest(`/litters/${id}`);
  },

  // Settings
  getPublicSettings: async () => {
    return apiRequest('/settings/public');
  },

  // System Status
  getSystemStatus: async () => {
    return apiRequest('/system/status');
  },

  getSystemUptime: async () => {
    return apiRequest('/system/uptime');
  },
};

// Admin API
export const adminApi = {
  // Users
  getUsers: async (params?: { page?: number; limit?: number; searchQuery?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.searchQuery) searchParams.set('searchQuery', params.searchQuery);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest(`/admin/users${query}`, {
      headers: getAuthHeaders(),
    });
  },

  getUserById: async (id: string) => {
    return apiRequest(`/admin/users/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  updateUser: async (id: string, userData: any) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: string) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // Puppies (Admin)
  getAllPuppies: async () => {
    const response = await apiRequest('/admin/puppies', {
      headers: getAuthHeaders(),
    });
    return { puppies: response.data || response.puppies || [], pagination: response.pagination || {} };
  },

  createPuppy: async (puppyData: any) => {
    return apiRequest('/admin/puppies', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(puppyData),
    });
  },

  updatePuppy: async (id: string, puppyData: any) => {
    return apiRequest(`/admin/puppies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(puppyData),
    });
  },

  deletePuppy: async (id: string) => {
    return apiRequest(`/admin/puppies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // Litters (Admin)
  getAllLitters: async (filters = {}) => {
    let query = '/admin/litters';
    if (Object.keys(filters).length) {
      query += '?' + new URLSearchParams(filters).toString();
    }
    return apiRequest(query, {
      headers: getAuthHeaders(),
    });
  },

  getLitterById: async (id: string) => {
    return apiRequest(`/admin/litters/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  createLitter: async (litterData: LitterCreationData): Promise<Litter> => {
    return apiRequest('/admin/litters', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(litterData),
    });
  },

  updateLitter: async (id: string, litterData: LitterUpdateData): Promise<Litter> => {
    return apiRequest(`/admin/litters/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(litterData),
    });
  },

  deleteLitter: async (id: string): Promise<{ id: string }> => {
    return apiRequest(`/admin/litters/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // Blog Posts
  getAllPosts: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set('status', params.status);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest(`/admin/blog-posts${query}`, {
      headers: getAuthHeaders(),
    });
  },

  createPost: async (postData: any) => {
    return apiRequest('/admin/blog-posts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    });
  },

  updatePost: async (id: string, postData: any) => {
    return apiRequest(`/admin/blog-posts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    });
  },

  deletePost: async (id: string) => {
    return apiRequest(`/admin/blog-posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // Testimonials
  getTestimonials: async () => {
    return apiRequest('/admin/testimonials', {
      headers: getAuthHeaders(),
    });
  },

  createTestimonial: async (data: any) => {
    return apiRequest('/admin/testimonials', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  updateTestimonial: async (id: string, data: any) => {
    return apiRequest(`/admin/testimonials/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  deleteTestimonial: async (id: string) => {
    return apiRequest(`/admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // Settings (Admin)
  getSettings: async () => {
    return apiRequest('/admin/settings', {
      headers: getAuthHeaders(),
    });
  },

  updateSetting: async (key: string, value: any) => {
    return apiRequest(`/admin/settings/${key}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ value }),
    });
  },

  // Transactions
  getTransactions: async (params?: { page?: number; limit?: number; status?: string; searchQuery?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.searchQuery) searchParams.set('searchQuery', params.searchQuery);
    
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest(`/admin/transactions${query}`, {
      headers: getAuthHeaders(),
    });
  },

  // Email Templates
  getEmailTemplates: async () => {
    return apiRequest('/admin/email-templates', {
      headers: getAuthHeaders(),
    });
  },

  getEmailTemplateById: async (id: string) => {
    return apiRequest(`/admin/email-templates/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  updateEmailTemplate: async (id: string, templateData: any) => {
    return apiRequest(`/admin/email-templates/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(templateData),
    });
  },

  // Integrations
  getIntegrations: async () => {
    return apiRequest('/admin/integrations', {
      headers: getAuthHeaders(),
    });
  },

  updateIntegration: async (id: string, integrationData: any) => {
    return apiRequest(`/admin/integrations/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(integrationData),
    });
  },

  // Data Deletion Requests
  getDataDeletionRequests: async () => {
    return apiRequest('/admin/data-deletion-requests', {
      headers: getAuthHeaders(),
    });
  },

  getDataDeletionRequestById: async (id: string) => {
    return apiRequest(`/admin/data-deletion-requests/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  updateDataDeletionRequestStatus: async (id: string, status: string) => {
    return apiRequest(`/admin/data-deletion-requests/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
  },
};

// Legacy compatibility exports
export const littersApi = {
  getAll: publicApi.getAllLitters,
  getAllLitters: publicApi.getAllLitters,
  getLitterById: publicApi.getLitterById,
  createLitter: adminApi.createLitter,
  updateLitter: adminApi.updateLitter,
  deleteLitter: adminApi.deleteLitter,
};

export const puppiesApi = {
  getAll: publicApi.getAllPuppies,
  getAllPuppies: publicApi.getAllPuppies,
  getPuppyById: publicApi.getPuppyById,
};
