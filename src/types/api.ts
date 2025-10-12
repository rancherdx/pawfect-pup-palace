// This file will contain all the TypeScript interfaces for the API data models.
// Defined based on the database schema in /docs/JULES_BACKEND_GUIDE.md

export type PuppyStatus = 'Available' | 'Reserved' | 'Sold' | 'Not For Sale';
export type LitterStatus = 'Active' | 'Available Soon' | 'All Reserved' | 'All Sold' | 'Archived';
export type AppRole = 'user' | 'admin' | 'super-admin';
export type RelatedEntityType = 'puppy' | 'litter' | 'general';
export type SenderType = 'user' | 'admin' | 'system';
export type PageType = 'puppy' | 'litter' | 'home' | 'about' | string; // Allow for custom pages
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type IntegrationService = 'square' | 'google-business' | 'apple-pay';
export type IntegrationEnvironment = 'sandbox' | 'production';

export interface Puppy {
  id: string; // uuid
  name: string;
  slug?: string | null;
  breed: string;
  breed_template_id?: string | null; // uuid
  litter_id?: string | null; // uuid
  owner_user_id?: string | null; // uuid
  birth_date?: string | null; // date
  price?: number | null; // numeric
  weight?: number | null; // numeric
  color?: string | null;
  gender?: string | null;
  description?: string | null;
  status: PuppyStatus;
  temperament?: string[] | null;
  image_urls?: string[] | null;
  video_urls?: string[] | null;
  photo_url?: string | null; // Legacy field
  is_featured?: boolean | null;
  banner_text?: string | null;
  banner_color?: string | null;
  created_at?: string; // timestamptz - optional for API responses
  updated_at?: string; // timestamptz - optional for API responses
}

export interface Litter {
  id: string; // uuid
  name: string;
  slug?: string | null;
  dam_name?: string | null;
  sire_name?: string | null;
  dam_id?: string | null; // uuid - FK to parents table
  sire_id?: string | null; // uuid - FK to parents table
  breed: string;
  breed_template_id?: string | null; // uuid
  date_of_birth?: string | null; // date
  expected_date?: string | null; // date
  puppy_count?: number | null;
  status: LitterStatus;
  description?: string | null;
  cover_image_url?: string | null; // Legacy field
  image_urls?: string[] | null;
  video_urls?: string[] | null;
  created_at?: string; // timestamptz - optional for API responses
  updated_at?: string; // timestamptz - optional for API responses
}

// Type aliases for form data
export type LitterCreationData = Omit<Litter, 'id' | 'created_at' | 'updated_at'>;
export type LitterUpdateData = Partial<LitterCreationData>;

export interface BreedTemplate {
  id: string; // uuid
  breed_name: string;
  description?: string | null;
  size?: string | null;
  temperament?: string[] | null;
  care_instructions?: string | null;
  common_traits?: string[] | null;
  exercise_needs?: string | null;
  grooming_needs?: string | null;
  average_weight_min?: number | null;
  average_weight_max?: number | null;
  life_expectancy_min?: number | null;
  life_expectancy_max?: number | null;
  akc_group?: string | null;
  origin_country?: string | null;
  health_considerations?: string[] | null;
  good_with_kids?: boolean | null;
  good_with_pets?: boolean | null;
  hypoallergenic?: boolean | null;
  photo_url?: string | null;
  gallery_urls?: string[] | null;
  created_at?: string | null; // timestamptz
  updated_at?: string | null; // timestamptz
}

export interface Parent {
  id: string; // uuid
  name: string;
  breed: string;
  gender: 'Male' | 'Female';
  description?: string | null;
  image_urls?: string[] | null;
  certifications?: string[] | null;
  bloodline_info?: string | null;
  health_clearances?: string[] | null;
  is_active: boolean;
  created_at?: string; // timestamptz - optional for API responses
  updated_at?: string; // timestamptz - optional for API responses
}

export interface StudDog {
  id: string; // uuid
  name: string;
  breed_id: string;
  age?: number | null;
  description?: string | null;
  temperament?: string | null;
  certifications?: string[] | null;
  image_urls?: string[] | null;
  stud_fee: number;
  is_available: boolean;
  owner_user_id?: string | null; // uuid
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface SeoMeta {
  id: string; // uuid
  page_type: PageType;
  page_id?: string | null;
  page_slug?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  og_type?: string | null;
  twitter_card?: string | null;
  twitter_title?: string | null;
  twitter_description?: string | null;
  twitter_image?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  schema_markup?: any | null; // jsonb - can be any JSON value
  created_at?: string | null; // timestamptz
  updated_at?: string | null; // timestamptz
}

export interface Profile {
  id: string; // uuid, references auth.users(id)
  name?: string | null;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface UserRole {
  id: string; // uuid
  user_id: string; // uuid, references auth.users(id)
  role: AppRole;
}

export interface Transaction {
  id: string; // uuid
  user_id?: string | null; // uuid
  puppy_id?: string | null; // uuid
  amount: number; // in cents
  currency: string;
  status: string; // Database uses string, not enum
  square_payment_id?: string | null;
  payment_method_details?: any | null; // jsonb - can be any JSON value
  created_at: string; // timestamptz
}

export interface Conversation {
  id: string; // uuid
  user_id: string; // uuid
  title: string;
  related_entity_type?: RelatedEntityType | null;
  related_entity_id?: string | null; // uuid
  is_archived: boolean;
  last_message_at?: string | null; // timestamptz
  last_message_preview?: string | null;
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface Message {
  id: string; // uuid
  conversation_id: string; // uuid
  sender_id: string; // uuid
  sender_type: SenderType;
  content: string;
  attachments?: string | null;
  read_at?: string | null; // timestamptz
  sent_at: string; // timestamptz
}

export interface ThirdPartyIntegration {
  service: IntegrationService;
  environment: IntegrationEnvironment;
  data_ciphertext: string;
  other_config: Record<string, any>; // jsonb
  is_active: boolean;
  created_by?: string | null; // uuid
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

export interface SiteSettings {
  key: string;
  value: any; // jsonb - can be string, number, boolean, null, object, or array
  updated_at: string; // timestamptz
}

export interface ApplePayConfig {
  merchant_id: string;
  domain_verified: boolean;
  certificate_uploaded: boolean;
  processing_certificate_id?: string | null;
  last_verified?: string | null; // timestamptz
  domains?: string[];
}

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  category?: string | null;
  status: BlogPostStatus;
  featured_image_url?: string | null; // Database uses snake_case
  excerpt?: string | null;
  author_name?: string | null; // Database uses snake_case
  published_at?: string | null; // Database uses snake_case
  tags?: string[] | null; // Database field
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  puppies: {
    total: number;
    available: number;
  };
  litters: {
    total: number;
    active: number;
  };
  transactions: {
    total: number;
  };
  users: {
    total: number;
  };
  revenue: {
    total: number;
  };
  testimonials: {
    total: number;
  };
  blogPosts: {
    total: number;
  };
}

export type DataDeletionRequestStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface DataDeletionRequest {
  id: string;
  user_id?: string | null;
  name?: string | null;
  email?: string | null;
  status: DataDeletionRequestStatus;
  requested_at: string;
  processed_at?: string | null;
  admin_notes?: string | null;
  account_creation_timeframe?: string | null;
  puppy_ids?: string | null;
  additional_details?: string | null;
}