
import { fetchAPI } from "@/utils/fetchAPI";

const STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;
const STRAPI_API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

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
