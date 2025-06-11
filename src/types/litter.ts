// src/types/litter.ts

export type LitterStatus = 'Active' | 'Available Soon' | 'All Reserved' | 'All Sold' | 'Archived';

import { Puppy } from './puppy'; // Import Puppy type

export interface Litter {
  id: string;
  name: string;
  damName: string; // Renamed from mother
  sireName: string; // Renamed from father
  breed: string;
  dateOfBirth: string; // YYYY-MM-DD
  expectedDate?: string; // YYYY-MM-DD
  puppyCount?: number; // Made optional as it might not be known initially
  status: LitterStatus;
  description?: string;
  coverImageUrl?: string; // Matches page's coverImage if API sends this
  puppies?: Puppy[]; // Added for nested puppy data
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
