
import { fetchAPI } from "@/utils/fetchAPI";

const STRAPI_API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;
const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL || '/api';

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

// Generic API request function
export const apiRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(`${STRAPI_API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch data' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('jwtToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Auth API functions
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  register: async (userData: { email: string; password: string; name: string }) => {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },
  
  getProfile: async () => {
    return apiRequest('/api/users/me', {
      headers: getAuthHeaders(),
    });
  },
  
  updateProfile: async (userData: any) => {
    return apiRequest('/api/users/me/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
  },
  
  refreshToken: async (refreshToken: string) => {
    return apiRequest('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};
