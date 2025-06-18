
// Utility for making API requests to Strapi or similar backend
const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${STRAPI_API_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch data' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};
