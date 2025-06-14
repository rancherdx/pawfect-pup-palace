
// --- Litter API STUB ----
import { Litter, LitterListResponse, LitterStatus } from '@/types/litter';

const dummyLitter: Litter = {
  id: 'litter-1',
  name: 'Happy Golden Litter',
  damName: 'Molly',
  sireName: 'Max',
  breed: 'Golden Retriever',
  dateOfBirth: '2024-02-01',
  status: 'Active',
  puppyCount: 5,
  // Optional:
  expectedDate: undefined,
  description: 'A lovely litter of golden retriever puppies.',
  coverImageUrl: '',
  puppies: [],
};

export const getAll = async (_params?: any): Promise<LitterListResponse> => {
  return { litters: [dummyLitter], pagination: { total: 1, current_page: 1, total_pages: 1 } };
};

export const getAllLitters = getAll;

export const getLitterById = async (id: string): Promise<Litter> => {
  return { ...dummyLitter, id };
};

export const createLitter = async (_data: Partial<Litter>): Promise<Litter> => {
  return { ...dummyLitter, ..._data, id: 'new-litter-id' };
};

export const updateLitter = async (_id: string, data: Partial<Litter>): Promise<Litter> => {
  return { ...dummyLitter, ...data, id: _id };
};

export const deleteLitter = async (_id: string): Promise<{ id: string }> => {
  return { id: _id };
};
