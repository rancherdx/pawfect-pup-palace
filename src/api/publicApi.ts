import { fetchAPI } from "@/utils/fetchAPI";

export const blogApi = {
  getPosts: async (params: { page?: number; limit?: number; category?: string }) => {
    let query = '/api/posts?populate=*';
    if (params.page) query += `&pagination[page]=${params.page}`;
    if (params.limit) query += `&pagination[pageSize]=${params.limit}`;
    if (params.category) query += `&filters[category][$eq]=${params.category}`;
    return fetchAPI(query);
  },
  getBySlug: async (slug: string) => {
    const query = `/api/posts?filters[slug][$eq]=${slug}&populate=*`;
    const result = await fetchAPI(query);
    return result?.data?.[0]?.attributes;
  },
};

export const puppiesApi = {
  getAllPuppies: async () => {
    const response = await fetchAPI('/api/puppies');
    return { puppies: response.data || response.puppies || [] };
  },
  getPuppyById: async (id: string) => {
    const response = await fetchAPI(`/api/puppies/${id}`);
    return response.data || response;
  },
};

export const littersApi = {
  getAll: async (filters = {}) => {
    let query = '/api/litters';
    if (Object.keys(filters).length) {
      query += '?' + new URLSearchParams(filters).toString();
    }
    return fetchAPI(query);
  },
  getLitterById: async (id: string) => {
    const query = `/api/litters/${id}`;
    return fetchAPI(query);
  },
  createLitter: async (data: Record<string, unknown>) => {
    const query = `/api/litters`;
    return fetchAPI(query, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateLitter: async (id: string, data: Record<string, unknown>) => {
    return fetchAPI(`/api/litters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteLitter: async (id: string) => {
    return fetchAPI(`/api/litters/${id}`, {
      method: 'DELETE',
    });
  },
};

export const testimonialApi = {
  getAllPublic: async () => {
    const response = await fetchAPI('/api/testimonials');
    return response.data || response;
  },
};
};
