
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// Store the authentication token
let authToken: string | null = localStorage.getItem('authToken');

// Helper for making API requests
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'An unexpected error occurred' }));
      
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        authToken = null;
        toast.error("Your session has expired. Please log in again.");
        // Optionally redirect to login page here
        window.location.href = '/login';
      }
      
      throw new Error(error.error || 'An unexpected error occurred');
    }
    
    // For DELETE requests or other requests that may not return JSON
    if (response.status === 204 || options.method === 'DELETE') {
      return { success: true } as T;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Authentication API
export const auth = {
  login: async (email: string, password: string) => {
    const response = await fetchAPI<{ token: string, user: any }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store the auth token
    localStorage.setItem('authToken', response.token);
    authToken = response.token;
    
    return response.user;
  },
  
  register: async (userData: { email: string, password: string, name: string }) => {
    const response = await fetchAPI<{ token: string, user: any }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store the auth token
    localStorage.setItem('authToken', response.token);
    authToken = response.token;
    
    return response.user;
  },
  
  logout: async () => {
    try {
      await fetchAPI('/logout', { method: 'POST' });
    } finally {
      // Always clear auth data even if API call fails
      localStorage.removeItem('authToken');
      authToken = null;
    }
  },
  
  getCurrentUser: async () => {
    if (!authToken) return null;
    try {
      return await fetchAPI<any>('/user');
    } catch (error) {
      console.error("Failed to get current user:", error);
      return null;
    }
  },
  
  isAuthenticated: () => !!authToken,
};

// Puppies API
export const puppiesApi = {
  getAllPuppies: async (params: { breed?: string, status?: string, limit?: number, offset?: number } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.breed) queryParams.append('breed', params.breed);
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return fetchAPI<{ puppies: any[], pagination: any }>(`/puppies${queryString}`);
  },
  
  getPuppyById: async (id: string) => {
    return fetchAPI<any>(`/puppies/${id}`);
  },
  
  createPuppy: async (puppyData: any) => {
    return fetchAPI<any>('/puppies', {
      method: 'POST',
      body: JSON.stringify(puppyData),
    });
  },
  
  updatePuppy: async (id: string, puppyData: any) => {
    return fetchAPI<any>(`/puppies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(puppyData),
    });
  },
  
  deletePuppy: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/puppies/${id}`, {
      method: 'DELETE',
    });
  },
  
  uploadPuppyImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_URL}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : '',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Image upload failed' }));
      throw new Error(error.error || 'Image upload failed');
    }
    
    return await response.json();
  },
};

// Litters API
export const littersApi = {
  getAllLitters: async (params: { breed?: string, status?: string, limit?: number, offset?: number } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.breed) queryParams.append('breed', params.breed);
    if (params.status) queryParams.append('status', params.status);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return fetchAPI<{ litters: any[], pagination: any }>(`/litters${queryString}`);
  },
  
  getLitterById: async (id: string) => {
    return fetchAPI<any>(`/litters/${id}`);
  },
  
  createLitter: async (litterData: any) => {
    return fetchAPI<any>('/litters', {
      method: 'POST',
      body: JSON.stringify(litterData),
    });
  },
  
  updateLitter: async (id: string, litterData: any) => {
    return fetchAPI<any>(`/litters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(litterData),
    });
  },
  
  deleteLitter: async (id: string) => {
    return fetchAPI<{ success: boolean }>(`/litters/${id}`, {
      method: 'DELETE',
    });
  },
};
