
// src/types/puppy.ts
import { PaginationInfo } from './common';

export type PuppyStatus = 'Available' | 'Reserved' | 'Sold' | 'Not For Sale';
export type PuppySize = 'Toy' | 'Small' | 'Medium' | 'Large' | 'Giant' | '';

export interface Puppy {
  id: string;
  name: string;
  breed: string;
  birthDate: string; // Standardize to birthDate (camelCase)
  price: number;
  description: string;
  status: PuppyStatus;
  photoUrl?: string; // Standardize to photoUrl
  weight?: number;
  size?: PuppySize;
  temperament?: string;
  careNotes?: string;
  motherName?: string;
  fatherName?: string;
  litterId?: string;
  squareStatus?: 'Synced' | 'Not Synced' | 'Error' | string;
  squareItemId?: string;
  gender?: string;
  color?: string; // Added for page display consistency
  // Timestamps, if available from API
  createdAt?: string;
  updatedAt?: string;
}

// For creating a new puppy - fields required by the backend
// Omit server-generated fields. Make essential fields non-optional.
export type PuppyCreationData = Omit<Puppy, 'id' | 'squareStatus' | 'squareItemId' | 'createdAt' | 'updatedAt' | 'gender' | 'photoUrl' | 'weight' | 'size' | 'temperament' | 'careNotes' | 'motherName' | 'fatherName' | 'litterId'> & {
  name: string;
  breed: string;
  birthDate: string;
  price: number;
  status: PuppyStatus;
  description: string;
  // Optional fields during creation that are not server-generated
  photoUrl?: string;
  weight?: number;
  size?: PuppySize;
  temperament?: string;
  careNotes?: string;
  motherName?: string;
  fatherName?: string;
  litterId?: string;
  gender?: string;
};

// For updating an existing puppy
export type PuppyUpdateData = Partial<PuppyCreationData>;

// For API responses that list puppies for admin
export interface AdminPuppyListResponse {
  puppies: Puppy[];
  // Add pagination fields if they exist, e.g.
  // pagination?: { total: number; page: number; limit: number; };
}

// Updated to use puppies instead of data to match actual usage
export interface PublicPuppyListResponse {
  puppies: Puppy[];
  pagination?: PaginationInfo;
}

export interface MyPuppiesResponse {
  data: Puppy[];
  pagination: PaginationInfo;
}
