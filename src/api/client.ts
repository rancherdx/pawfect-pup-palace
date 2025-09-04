// Worker API client for admin and public endpoints
const API_BASE_URL = '/api';

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('jwtToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Admin API client with authentication
export const fetchAdminAPI = async (url: string, options: RequestInit = {}) => {
  const mergedOptions: RequestInit = {
    headers: {
      ...getAuthHeaders(),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, mergedOptions);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch data' }));
    throw new Error(error.message || 'Failed to fetch data');
  }
  return await response.json();
};

// Generic API request function
export const apiRequest = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const config: RequestInit = {
    headers: {
      ...getAuthHeaders(),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch data' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};
