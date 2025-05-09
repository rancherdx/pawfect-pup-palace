
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

// Puppies API
export const getAllPuppies = async (params: { breed?: string, status?: string, limit?: number, offset?: number } = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.breed) queryParams.append('breed', params.breed);
  if (params.status) queryParams.append('status', params.status);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return fetchAPI<{ puppies: any[], pagination: any }>(`/puppies${queryString}`);
};

export const getPuppyById = async (id: string) => {
  return fetchAPI<any>(`/puppies/${id}`);
};

export const createPuppy = async (puppyData: any) => {
  return fetchAPI<any>('/puppies', {
    method: 'POST',
    body: JSON.stringify(puppyData),
  });
};

export const updatePuppy = async (id: string, puppyData: any) => {
  return fetchAPI<any>(`/puppies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(puppyData),
  });
};

export const deletePuppy = async (id: string) => {
  return fetchAPI<{ success: boolean }>(`/puppies/${id}`, {
    method: 'DELETE',
  });
};

export const uploadPuppyImage = async (file: File) => {
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
};
