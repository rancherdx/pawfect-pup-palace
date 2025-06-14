// API Base URL - uses environment variable or defaults to current origin for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

import {
  Puppy,
  PuppyCreationData,
  PuppyUpdateData,
  AdminPuppyListResponse,
  PublicPuppyListResponse,
  Litter,
  LitterCreationData,
  LitterUpdateData,
  LitterListResponse,
  User,
  UserRegistrationData,
  UserLoginData,
  AuthResponse,
  RefreshTokenResponse as AuthRefreshTokenResponse,
  UserProfileUpdateData,
  BlogPost,
  BlogPostsResponse,
  BlogPostCreateData,
  BlogPostUpdateData,
  PaginationInfo, // Added for use in various responses
  MyPuppiesResponse // Added for getMyPuppies
} from '../types';

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

// Define authApi next, so it's available to apiRequest
// The local RefreshTokenResponse interface is removed as we'll use AuthRefreshTokenResponse from types.
export const authApi = {
  login: async (credentials: UserLoginData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (registrationData: UserRegistrationData): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },

  logout: async () => { // No specific response type needed, or define one if backend sends structured logout confirmation
    return apiRequest('/auth/logout', { method: 'POST' });
  },

  getProfile: async (): Promise<User> => {
    return apiRequest<User>('/user');
  },

  updateProfile: async (profileData: UserProfileUpdateData): Promise<User> => {
    return apiRequest<User>('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // refreshToken is defined here, and will be called by apiRequest below
  refreshToken: async (currentRefreshToken: string): Promise<AuthRefreshTokenResponse> => {
    // Special direct fetch or minimal apiRequest call for refresh to avoid loops
    // For this specific call, we construct it more directly to avoid apiRequest calling itself indefinitely for /auth/refresh-token
    const url = `${API_BASE_URL}/auth/refresh-token`;
    const config: RequestInit = {
        method: 'POST',
        headers: { // Minimal headers for refresh token
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
    };
    const response = await fetch(url, config);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status} ${response.statusText}` }));
        throw new Error(errorData.message || 'Token refresh failed');
    }
    return response.json() as Promise<AuthRefreshTokenResponse>; // Ensure return type matches
  },
};


// Generic API function
// Now apiRequest can call authApi.refreshToken if authApi is defined above it.
// However, the previous version of authApi's methods (login, register etc) call apiRequest.
// This creates a circular dependency if not careful.
// The solution for refreshToken is to have it NOT use apiRequest itself, or use a very basic version.
// The version of authApi.refreshToken above now uses fetch directly.

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry: boolean = false // Flag to prevent infinite refresh loops
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const getConfig = () => ({
    ...options,
    headers: {
      ...getAuthHeaders(), // Reads 'jwtToken' from localStorage
      ...options.headers,
    },
  });

  try {
    const response = await fetch(url, getConfig());

    if (!response.ok) {
      // Avoid refresh attempts for login, register, or the refresh-token endpoint itself.
      const canAttemptRefresh = response.status === 401 &&
                                !isRetry &&
                                !endpoint.startsWith('/auth/login') &&
                                !endpoint.startsWith('/auth/register') &&
                                !endpoint.startsWith('/auth/refresh-token');

      if (canAttemptRefresh) {
        const currentRefreshToken = localStorage.getItem('jwtRefreshToken');
        if (currentRefreshToken) {
          try {
            console.log(`Attempting token refresh for ${endpoint}`);
            const refreshResp = await authApi.refreshToken(currentRefreshToken); // authApi is defined above

            localStorage.setItem('jwtToken', refreshResp.token);
            if (refreshResp.refreshToken) {
              localStorage.setItem('jwtRefreshToken', refreshResp.refreshToken);
            }
            console.log(`Token refreshed. Retrying ${endpoint}`);
            return apiRequest<T>(endpoint, options, true); // Recursive call with isRetry = true
          } catch (refreshError: any) {
            console.error('Token refresh failed:', refreshError.message || refreshError);
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('jwtRefreshToken');
            // Propagate an error that would lead to logout or redirect
            // Use the original response's error data if possible for consistency
            const originalErrorData = await response.json().catch(() => ({ message: `HTTP ${response.status} ${response.statusText}` }));
            throw new Error(originalErrorData.details || originalErrorData.error || originalErrorData.message || `Session expired after failed refresh attempt for ${endpoint}`);
          }
        } else {
            console.log('No refresh token available. Cannot refresh session for endpoint:', endpoint);
        }
      }

      // Standard error handling if not 401, or if refresh shouldn't be attempted / failed
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`
      }));

      if (endpoint.startsWith('/admin') && (response.status === 401 || response.status === 403)) {
        console.error(`Admin API request unauthorized for ${endpoint}:`, errorData.details || errorData.message || errorData.error || `Status ${response.status}`);
      }
      throw new Error(errorData.details || errorData.error || errorData.message || 'API request failed');
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }
    return await response.json();

  } catch (error) {
    // This outer catch handles network errors from fetch() itself, or errors re-thrown (e.g. from failed refresh)
    // Ensure error is an instance of Error before trying to access message property
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`API Request to ${endpoint} failed: ${errorMessage}`);
    // Re-throw the original error object if it's an Error, otherwise wrap it
    if (error instanceof Error) {
        throw error;
    } else {
        throw new Error(errorMessage);
    }
  }
};

// Puppies API (and other APIs like Litters, Blog, Testimonial, Admin, Upload)
// These are defined after apiRequest and authApi, and use apiRequest.

export const puppiesApi = {
  getAll: async (params?: { limit?: number; page?: number; breed?: string; status?: string }): Promise<PublicPuppyListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.breed) searchParams.append('breed', params.breed);
    if (params?.status) searchParams.append('status', params.status);
    
    const endpointWithQuery = `/puppies${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest<PublicPuppyListResponse>(endpointWithQuery);
  },

  getById: async (id: string): Promise<Puppy> => {
    return apiRequest<Puppy>(`/puppies/${id}`);
  },

  getMyPuppies: async (params?: { limit?: number; page?: number }): Promise<MyPuppiesResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    
    const query = searchParams.toString();
    return apiRequest<MyPuppiesResponse>(`/my-puppies${query ? `?${query}` : ''}`);
  },
};

export const littersApi = {
  getAll: async (params?: { limit?: number; offset?: number; breed?: string; status?: string }): Promise<LitterListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    if (params?.breed) searchParams.append('breed', params.breed);
    if (params?.status) searchParams.append('status', params.status);
    
    const endpointWithQuery = `/litters${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return apiRequest<LitterListResponse>(endpointWithQuery);
  },

  getById: async (id: string): Promise<Litter> => {
    return apiRequest<Litter>(`/litters/${id}`);
  },
};

export const blogApi = {
  getPosts: async (params?: { limit?: number; offset?: number }): Promise<BlogPostsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return apiRequest<BlogPostsResponse>(`/blog${query ? `?${query}` : ''}`);
  },

  getBySlug: async (slug: string): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`/blog/${slug}`);
  },
};

interface Testimonial {
  id: string;
  name: string;
  location?: string;
  testimonial_text: string;
  rating: number;
  puppy_name?: string;
  image_url?: string;
  created_at: string;
}
type TestimonialCreationData = Omit<Testimonial, 'id' | 'created_at'>;
type TestimonialUpdateData = Partial<TestimonialCreationData>;

export const testimonialApi = {
  getAllPublic: async (params?: { limit?: number }): Promise<Testimonial[]> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    return apiRequest<Testimonial[]>(`/testimonials${query ? `?${query}` : ''}`);
  },
};

interface SquareSyncResponse {
  status: string;
  message: string;
  squareItemId: string;
  syncedAt: string;
}
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
  getAllPuppies: async (): Promise<AdminPuppyListResponse> => apiRequest<AdminPuppyListResponse>('/admin/puppies'),
  createPuppy: async (data: PuppyCreationData): Promise<Puppy> => {
    return apiRequest<Puppy>('/admin/puppies', { method: 'POST', body: JSON.stringify(data) });
  },
  updatePuppy: async (id: string, data: PuppyUpdateData): Promise<Puppy> => {
    return apiRequest<Puppy>(`/admin/puppies/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deletePuppy: async (id: string) => {
    return apiRequest(`/admin/puppies/${id}`, { method: 'DELETE' });
  },
  syncPuppyWithSquare: async (puppyId: string): Promise<SquareSyncResponse> => {
    return apiRequest<SquareSyncResponse>(`/admin/puppies/${puppyId}/sync-square`, { method: 'POST' });
  },
  getAllLitters: async (params?: { limit?: number; offset?: number }): Promise<LitterListResponse> => {
    // Ensure params are correctly stringified for URLSearchParams
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return apiRequest<LitterListResponse>(`/admin/litters${query ? `?${query}` : ''}`);
  },
  createLitter: async (data: LitterCreationData): Promise<Litter> => {
    return apiRequest<Litter>('/admin/litters', { method: 'POST', body: JSON.stringify(data) });
  },
  updateLitter: async (id: string, data: LitterUpdateData): Promise<Litter> => {
    return apiRequest<Litter>(`/admin/litters/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteLitter: async (id: string): Promise<void> => {
    return apiRequest<void>(`/admin/litters/${id}`, { method: 'DELETE' });
  },
  createPost: async (data: BlogPostCreateData): Promise<BlogPost> => {
    return apiRequest<BlogPost>('/admin/blog', { method: 'POST', body: JSON.stringify(data) });
  },
  updatePost: async (id: string, data: BlogPostUpdateData): Promise<BlogPost> => {
    return apiRequest<BlogPost>(`/admin/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deletePost: async (id: string): Promise<void> => { // Assuming no content response (204)
    return apiRequest<void>(`/admin/blog/${id}`, { method: 'DELETE' });
  },
  getBreedTemplates: async (): Promise<BreedTemplate[]> => {
    return apiRequest<BreedTemplate[]>('/admin/breed-templates');
  },
  getAllTestimonials: async (params?: { page?: number; limit?: number }): Promise<{ data: Testimonial[]; pagination?: PaginationInfo }> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    return apiRequest<{ data: Testimonial[]; pagination?: PaginationInfo }>(`/admin/testimonials${query ? `?${query}` : ''}`);
  },
  createTestimonial: async (data: TestimonialCreationData): Promise<Testimonial> => {
    return apiRequest<Testimonial>('/admin/testimonials', { method: 'POST', body: JSON.stringify(data) });
  },
  updateTestimonial: async (id: string, data: TestimonialUpdateData): Promise<Testimonial> => {
    return apiRequest<Testimonial>(`/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteTestimonial: async (id: string): Promise<void> => {
    return apiRequest<void>(`/admin/testimonials/${id}`, { method: 'DELETE' });
  }
};

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
    // For file uploads with FormData, Content-Type should not be set to application/json
    // It should be automatically set by the browser to multipart/form-data
    // So, we remove Content-Type from getAuthHeaders() if it's a FormData request.
    // However, getAuthHeaders() sets application/json.
    // A better approach: apiRequest should handle FormData specifically.
    // For now, we will rely on ...options.headers potentially overriding it for uploadApi.
    // The current apiRequest might incorrectly set Content-Type for FormData.
    // Let's assume this is handled or will be handled separately.
    // The provided code for uploadApi does not pass specific headers to override Content-Type.
    // This means apiRequest will set 'Content-Type': 'application/json', which is wrong for FormData.

    // Correction for uploadApi: remove Content-Type from headers for FormData
    const uploadHeaders = getAuthHeaders();
    delete uploadHeaders['Content-Type']; // Remove default JSON content type for FormData

    return apiRequest<{ url: string }>('/upload', {
      method: 'POST',
      headers: uploadHeaders, // Use headers without 'Content-Type'
      body: formData,
    });
  },
};
