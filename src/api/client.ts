// API Base URL - uses environment variable or defaults to current origin for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('jwtToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Generic API function
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.error || errorData.message || 'API request failed');
    }

    // Handle 204 No Content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    return apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', { method: 'POST' });
  },

  getProfile: async () => {
    return apiRequest<any>('/user');
  },

  updateProfile: async (data: any) => {
    return apiRequest<any>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Puppies API
export const puppiesApi = {
  getAll: async (params?: { limit?: number; page?: number; breed?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.breed) searchParams.append('breed', params.breed);
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return apiRequest<{ data: any[]; pagination: any }>(`/puppies${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/puppies/${id}`);
  },

  getMyPuppies: async (params?: { limit?: number; page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    
    const query = searchParams.toString();
    return apiRequest<{ data: any[]; pagination: any }>(`/my-puppies${query ? `?${query}` : ''}`);
  },
};

// Litters API
export const littersApi = {
  getAll: async (params?: { limit?: number; offset?: number; breed?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.breed) searchParams.append('breed', params.breed);
    if (params?.status) searchParams.append('status', params.status);
    
    const query = searchParams.toString();
    return apiRequest<{ litters: any[]; pagination: any }>(`/litters${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return apiRequest<any>(`/litters/${id}`);
  },
};

// Blog API
export const blogApi = {
  getPosts: async (params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return apiRequest<{ posts: any[]; pagination: any }>(`/blog${query ? `?${query}` : ''}`);
  },

  getBySlug: async (slug: string) => {
    return apiRequest<any>(`/blog/${slug}`);
  },
};

// Admin API

// Define the response type for successful Square sync
interface SquareSyncResponse {
  status: string;
  message: string;
  squareItemId: string;
  syncedAt: string;
}

export const adminApi = {
  // Puppies management
  createPuppy: async (data: any) => {
    return apiRequest<any>('/admin/puppies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePuppy: async (id: string, data: any) => {
    return apiRequest<any>(`/admin/puppies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePuppy: async (id: string) => {
    return apiRequest(`/admin/puppies/${id}`, { method: 'DELETE' });
  },

  // New function for Square sync
  syncPuppyWithSquare: async (puppyId: string): Promise<SquareSyncResponse> => {
    return apiRequest<SquareSyncResponse>(`/admin/puppies/${puppyId}/sync-square`, {
      method: 'POST',
      // Body can be empty if the backend fetches puppy data using puppyId from URL
      // Or, if data needs to be sent: body: JSON.stringify(puppyData),
    });
  },

  // Litters management
  createLitter: async (data: any) => {
    return apiRequest<any>('/admin/litters', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateLitter: async (id: string, data: any) => {
    return apiRequest<any>(`/admin/litters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteLitter: async (id: string) => {
    return apiRequest(`/admin/litters/${id}`, { method: 'DELETE' });
  },

  // Blog management
  createPost: async (data: any) => {
    return apiRequest<any>('/admin/blog', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePost: async (id: string, data: any) => {
    return apiRequest<any>(`/admin/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePost: async (id: string) => {
    return apiRequest(`/admin/blog/${id}`, { method: 'DELETE' });
  },
};

// Upload API
export const uploadApi = {
  uploadFile: async (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const token = localStorage.getItem('jwtToken');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return apiRequest<{ url: string }>('/upload', {
      method: 'POST',
      headers,
      body: formData,
    });
  },
};
