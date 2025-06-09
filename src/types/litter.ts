// src/types/litter.ts

export type LitterStatus = 'Active' | 'Available Soon' | 'All Reserved' | 'All Sold' | 'Archived';

export interface Litter {
  id: string;
  name: string;
  mother: string; // Assuming string ID or name
  father: string; // Assuming string ID or name
  breed: string;
  dateOfBirth: string; // YYYY-MM-DD
  expectedDate?: string; // YYYY-MM-DD
  puppyCount?: number; // Made optional as it might not be known initially
  status: LitterStatus;
  description?: string;
  coverImageUrl?: string;
  // Timestamps, if available from API
  createdAt?: string;
  updatedAt?: string;
}

// For creating a new litter
export type LitterCreationData = Omit<Litter, 'id' | 'createdAt' | 'updatedAt'>;

// For updating an existing litter
export type LitterUpdateData = Partial<LitterCreationData>;

// For API responses that list litters (both public and admin if structure is same)
export interface LitterListResponse {
  litters: Litter[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    offset?: number; // if used by API
  };
}
