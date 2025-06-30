// Legacy compatibility - keeping minimal exports for backward compatibility
import { fetchAPI } from "@/utils/fetchAPI";

const STRAPI_API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;
const STRAPI_API_URL = import.meta.env.VITE_STRAPI_API_URL || '/api';

// Keep fetchAdminAPI for any legacy code that might still use it
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

// All auth functionality now comes from unifiedApi - removing duplicates
