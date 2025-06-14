// src/types/blogPost.ts
import { PaginationInfo } from './common'; // Import common PaginationInfo

// Local BlogPaginationInfo is removed in favor of common.ts PaginationInfo

export type BlogPostStatus = 'draft' | 'published' | 'archived';

export interface BlogPostAuthor {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string; // Can be HTML, Markdown, or plain text
  excerpt?: string;
  featuredImageUrl?: string; // Changed from 'image' for clarity

  author?: BlogPostAuthor | string; // Could be a full author object or just an ID/name

  status: BlogPostStatus;
  tags?: string[];
  category?: string; // Or categories?: string[]

  createdAt: string; // ISO Date string - assuming API provides this
  updatedAt?: string; // ISO Date string
  publishedAt?: string | null; // ISO Date string, null if not published
  relatedPosts?: string[]; // Kept from original
}

// For creating a new blog post
export type BlogPostCreateData = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'author' | 'relatedPosts'> & {
  title: string;
  content: string;
  status: BlogPostStatus;
  slug: string;
  authorId?: string;
  featuredImageUrl?: string; // Ensure this is part of creation data if user sets it
  excerpt?: string;
  tags?: string[];
  category?: string;
};

// For updating an existing blog post
export type BlogPostUpdateData = Partial<BlogPostCreateData>;

// Response for fetching multiple blog posts
export interface BlogPostsResponse {
  posts: BlogPost[];
  pagination?: PaginationInfo; // Standardized to use common PaginationInfo
}

// --- Other interfaces previously in this file ---
// These might be better in separate files (e.g., category.ts, affiliate.ts) but are kept for now.

export interface BlogCategory {
  id: string;
  name: string;
}

export interface AffiliatePartner {
  id: string;
  name: string;
  email: string;
  code: string;
  commission: string;
  visits: number;
  conversions: number;
  totalSales: string;
  active: boolean;
  dateCreated: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: string;
  uses: number;
  maxUses: number | null;
  startDate: string;
  endDate: string | null;
  active: boolean;
}
