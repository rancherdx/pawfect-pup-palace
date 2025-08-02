// --- Puppy API STUB ----
import { Puppy, PublicPuppyListResponse } from '@/types/puppy';

const dummyPuppy: Puppy = {
  id: 'puppy-1',
  name: 'Buddy',
  breed: 'Golden Retriever',
  birthDate: '2024-01-10',
  price: 1500,
  description: 'A playful golden retriever puppy.',
  status: 'Available',
  gender: 'Male',
};

export const getAll = async (_params?: Record<string, unknown>): Promise<Puppy[]> => {
  return [dummyPuppy];
};

export const getAllPuppies = async (_params?: Record<string, unknown>): Promise<{ puppies: Puppy[]; pagination: Record<string, unknown> }> => {
  return { puppies: [dummyPuppy], pagination: { currentPage: 1, totalPages: 1, totalPuppies: 1 } };
};

export const getPuppyById = async (id: string): Promise<Puppy> => {
  return { ...dummyPuppy, id };
};
};
