
// src/types/puppy.ts
import { PaginationInfo } from './common';

export type PuppyStatus = 'Available' | 'Reserved' | 'Sold' | 'Not For Sale';
export type PuppySize = 'Toy' | 'Small' | 'Medium' | 'Large' | 'Giant' | '';

export interface Puppy {
  id: string;
  name: string;
  breed: string;
  birth_date: string; // Match actual DB schema
  price: number;
  description: string;
  status: PuppyStatus;
  photo_url?: string; // Match actual DB schema (legacy field)
  image_urls?: string[]; // New multi-image field
  video_urls?: string[]; // New video field
  weight?: number;
  size?: PuppySize;
  temperament?: string[];
  care_notes?: string; // Match DB schema
  mother_name?: string; // Match DB schema
  father_name?: string; // Match DB schema
  litter_id?: string; // Match DB schema
  square_status?: 'Synced' | 'Not Synced' | 'Error' | string;
  square_item_id?: string; // Match DB schema
  gender?: string;
  color?: string;
  // Featured puppy fields
  is_featured?: boolean;
  banner_text?: string;
  banner_color?: string;
  // Additional fields that exist in DB
  breed_template_id?: string;
  owner_user_id?: string;
  slug?: string; // Added for slug-based routing
  // Timestamps, if available from API
  created_at?: string;
  updated_at?: string;
}

export type PuppyCreationData = Omit<Puppy, 'id' | 'square_status' | 'square_item_id' | 'created_at' | 'updated_at'> & {
  name: string;
  breed: string;
  birth_date: string;
  price: number;
  status: PuppyStatus;
  description: string;
}

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
