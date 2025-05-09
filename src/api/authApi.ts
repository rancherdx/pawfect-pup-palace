
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

// Authentication API
export const login = async (email: string, password: string) => {
  const response = await fetchAPI<{ token: string, user: any }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Store the auth token
  localStorage.setItem('authToken', response.token);
  authToken = response.token;
  
  return response.user;
};

export const register = async (userData: { email: string, password: string, name: string }) => {
  const response = await fetchAPI<{ token: string, user: any }>('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  
  // Store the auth token
  localStorage.setItem('authToken', response.token);
  authToken = response.token;
  
  return response.user;
};

export const logout = async () => {
  try {
    await fetchAPI('/logout', { method: 'POST' });
  } finally {
    // Always clear auth data even if API call fails
    localStorage.removeItem('authToken');
    authToken = null;
  }
};

export const getCurrentUser = async () => {
  if (!authToken) return null;
  try {
    return await fetchAPI<any>('/user');
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};

export const isAuthenticated = () => !!authToken;
