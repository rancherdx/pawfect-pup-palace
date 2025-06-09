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
        // Fallback if .json() fails or if it's not a JSON response
        message: `HTTP ${response.status}: ${response.statusText}`
      }));

      // Check for admin path and 401/403 for specific logging
      if (endpoint.startsWith('/admin') && (response.status === 401 || response.status === 403)) {
        console.error(`Admin API request unauthorized for ${endpoint}:`, errorData.details || errorData.message || errorData.error || `Status ${response.status}`);
        // Note: The original fetchAdminAPI had a comment about not redirecting here, which is correct.
        // ProtectedRoute handles redirection. This log is for server-side issues for an already "logged-in" admin.
      }
      // Prioritize 'details', then 'error', then 'message' from errorData
      throw new Error(errorData.details || errorData.error || errorData.message || 'API request failed');
    }

    // Handle 204 No Content responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    // The main error construction and specific admin 401/403 logging is done in the `if (!response.ok)` block.
    // This catch block is for network errors or other issues before a response is processed.
    console.error(`Network or unexpected error during API request to ${endpoint}:`, error);
    throw error; // Re-throw the original error or a new generic one if needed
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

// Testimonial API for public fetching
interface Testimonial {
  id: string;
  name: string;
  location?: string;
  testimonial_text: string;
  rating: number; // e.g., 1-5
  puppy_name?: string;
  image_url?: string;
  created_at: string;
}

// Define types for create/update payloads to omit generated fields
type TestimonialCreationData = Omit<Testimonial, 'id' | 'created_at'>;
type TestimonialUpdateData = Partial<TestimonialCreationData>;

export const testimonialApi = {
  getAllPublic: async (params?: { limit?: number }): Promise<Testimonial[]> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    // Assuming direct array response for public testimonials
    return apiRequest<Testimonial[]>(`/testimonials${query ? `?${query}` : ''}`);
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

// Define BreedTemplate interface
interface BreedTemplate {
  id: string;
  breedName: string;
  description: string;
  size: string;
  temperament: string;
  careInstructions: string;
  commonTraits: string[];
  averageWeight?: {
    min: number;
    max: number;
  };
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

  // New function for fetching breed templates
  getBreedTemplates: async (): Promise<BreedTemplate[]> => {
    // Assuming the API returns an array directly.
    // If it's nested under a 'data' property like other GET ALLs, it would be:
    // const response = await apiRequest<{ data: BreedTemplate[] }>('/admin/breed-templates');
    // return response.data;
    // For now, assume direct array response:
    return apiRequest<BreedTemplate[]>('/admin/breed-templates');
  },

  // Testimonial Management
  getAllTestimonials: async (params?: { page?: number; limit?: number }): Promise<{ data: Testimonial[]; pagination?: any }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    // Assuming admin endpoint might have pagination and data nesting
    return apiRequest<{ data: Testimonial[]; pagination?: any }>(`/admin/testimonials${query ? `?${query}` : ''}`);
  },

  createTestimonial: async (data: TestimonialCreationData): Promise<Testimonial> => {
    return apiRequest<Testimonial>('/admin/testimonials', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTestimonial: async (id: string, data: TestimonialUpdateData): Promise<Testimonial> => {
    return apiRequest<Testimonial>(`/admin/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTestimonial: async (id: string): Promise<void> => {
    return apiRequest<void>(`/admin/testimonials/${id}`, { // Expecting 204 No Content, so apiRequest might return {} which is fine for void
      method: 'DELETE',
    });
  }
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
