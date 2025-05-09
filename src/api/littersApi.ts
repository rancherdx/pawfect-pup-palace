
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

// Litters API
export const getAllLitters = async (params: { breed?: string, status?: string, limit?: number, offset?: number } = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.breed) queryParams.append('breed', params.breed);
  if (params.status) queryParams.append('status', params.status);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.offset) queryParams.append('offset', params.offset.toString());
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return fetchAPI<{ litters: any[], pagination: any }>(`/litters${queryString}`);
};

export const getLitterById = async (id: string) => {
  return fetchAPI<any>(`/litters/${id}`);
};

export const createLitter = async (litterData: any) => {
  return fetchAPI<any>('/litters', {
    method: 'POST',
    body: JSON.stringify(litterData),
  });
};

export const updateLitter = async (id: string, litterData: any) => {
  return fetchAPI<any>(`/litters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(litterData),
  });
};

export const deleteLitter = async (id: string) => {
  return fetchAPI<{ success: boolean }>(`/litters/${id}`, {
    method: 'DELETE',
  });
};
