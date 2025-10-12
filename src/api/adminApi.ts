import { supabase } from "@/integrations/supabase/client";
import { requireAdmin } from "./client";
import {
  Puppy,
  Litter,
  Profile,
  StudDog,
  SeoMeta,
  Transaction,
  SiteSettings,
  ThirdPartyIntegration,
  PuppyStatus,
  IntegrationService,
  IntegrationEnvironment,
  BlogPost,
  BlogPostStatus,
  ApplePayConfig,
  AppRole,
  DashboardStats,
  DataDeletionRequest,
  DataDeletionRequestStatus
} from "@/types/api";

// Placeholder interfaces for types not defined in the backend guide

export interface Testimonial {
  id: string;
  name: string;
  content: string; // Database uses 'content', not 'text'
  rating?: number | null;
  source?: string | null; // Database uses string, not enum
  admin_approved?: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Parent {
    id: string;
    name: string;
    breed: string;
    gender: 'Male' | 'Female'; // Match types/api.ts
    description?: string | null;
    image_urls?: string[] | null; // Match types/api.ts - optional
    certifications?: string[] | null;
    bloodline_info?: string | null;
    health_clearances?: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string; // Database uses 'html_body', not 'body'
  created_at: string;
  updated_at: string;
  is_system_template: boolean;
}

// Interfaces for function arguments - re-export from api.ts for backward compatibility
export type PuppyCreationData = Omit<Puppy, 'id' | 'created_at' | 'updated_at'>;
export type PuppyUpdateData = Partial<PuppyCreationData>;
export type LitterCreationData = Omit<Litter, 'id' | 'created_at' | 'updated_at'>;
export type LitterUpdateData = Partial<LitterCreationData>;
export type ParentCreationData = Omit<Parent, 'id' | 'created_at' | 'updated_at'>;
export type ParentUpdateData = Partial<ParentCreationData>;
export type StudDogCreationData = Omit<StudDog, 'id' | 'created_at' | 'updated_at'>;
export type StudDogUpdateData = Partial<StudDogCreationData>;
export type BlogPostCreationData = Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;
export type BlogPostUpdateData = Partial<BlogPostCreationData>;
export type TestimonialCreationData = Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>;
export type TestimonialUpdateData = Partial<TestimonialCreationData>;
export type SeoMetaCreationData = Omit<SeoMeta, 'id' | 'created_at' | 'updated_at'>;
export type SeoMetaDataUpdate = Partial<SeoMetaCreationData>;

interface SupabaseFile {
  name: string;
  bucket_id: string;
  owner: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
  buckets: {
    name: string;
  };
  publicUrl?: string;
}

/**
 * @namespace adminApi
 * @description A collection of API functions for administrative tasks. All functions in this namespace require admin privileges.
 */
export const adminApi = {
  // Users
  getAllUsers: async (params: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: Profile[] }> => {
    await requireAdmin();
    let query = supabase.from('profiles').select('*');
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { data: data || [] };
  },

  updateUser: async (id: string, userData: Partial<Profile>): Promise<Profile> => {
    await requireAdmin();
    const { data, error } = await supabase.from('profiles').update(userData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean }> => {
    await requireAdmin();
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  updateUserRoles: async (userId: string, roles: AppRole[]): Promise<{ success: boolean }> => {
    await requireAdmin();
    // This is a placeholder. A real implementation would require a Supabase Edge Function
    // to atomically update roles in the 'user_roles' table.
    console.warn('[adminApi.updateUserRoles] This function is a placeholder and does not persist role changes.');
    // For now, we simulate a successful response to allow UI development.
    return { success: true };
  },

  // Puppies
  getAllPuppies: async (): Promise<{ puppies: Puppy[], pagination: object }> => {
    await requireAdmin();
    const { data, error } = await supabase.from('puppies').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { puppies: data || [], pagination: {} };
  },

  createPuppy: async (puppyData: PuppyCreationData): Promise<Puppy> => {
    await requireAdmin();
    const { data, error } = await supabase.from('puppies').insert(puppyData).select().single();
    if (error) throw error;
    return data;
  },

  updatePuppy: async (id: string, puppyData: PuppyUpdateData): Promise<Puppy> => {
    await requireAdmin();
    const { data, error } = await supabase.from('puppies').update(puppyData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  deletePuppy: async (id: string): Promise<{ success: boolean }> => {
    await requireAdmin();
    const { error } = await supabase.from('puppies').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  bulkUpdatePuppiesStatus: async (puppyIds: string[], status: PuppyStatus): Promise<{ success: boolean, updatedCount: number }> => {
    await requireAdmin();
    const { data, error } = await supabase.from('puppies').update({ status }).in('id', puppyIds).select();
    if (error) throw error;
    return { success: true, updatedCount: data.length };
  },

  bulkCreatePuppies: async (puppiesData: PuppyCreationData[]): Promise<{ success: boolean, createdCount: number, puppies: Puppy[] }> => {
    await requireAdmin();
    const { data, error } = await supabase.from('puppies').insert(puppiesData).select();
    if (error) throw error;
    return { success: true, createdCount: data.length, puppies: data };
  },

  // Storage
  getStorageBucketFiles: async (bucketName: string): Promise<SupabaseFile[]> => {
    await requireAdmin();
    const { data, error } = await supabase.storage.from(bucketName).list('', { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;
    const filesWithUrls = data.map(file => {
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(file.name);
      return { ...file, publicUrl };
    });
    return filesWithUrls;
  },

  // Litters
  getAllLitters: async (filters = {}): Promise<{ litters: Litter[] }> => {
    await requireAdmin();
    const { data, error } = await supabase.from('litters').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { litters: data || [] };
  },

  getLitterById: async (id: string): Promise<Litter> => {
    await requireAdmin();
    const { data, error } = await supabase.from('litters').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  createLitter: async (litterData: LitterCreationData): Promise<Litter> => {
    await requireAdmin();
    const { data, error } = await supabase.from('litters').insert(litterData).select().single();
    if (error) throw error;
    return data;
  },

  updateLitter: async (id: string, litterData: LitterUpdateData): Promise<Litter> => {
    await requireAdmin();
    const { data, error } = await supabase.from('litters').update(litterData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  deleteLitter: async (id: string): Promise<{ success: boolean }> => {
    await requireAdmin();
    const { error } = await supabase.from('litters').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Parents
  getAllParents: async (): Promise<{ parents: Parent[] }> => {
    await requireAdmin();
    const { data, error } = await supabase.from('parents').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { parents: (data || []) as Parent[] };
  },

  createParent: async (parentData: ParentCreationData): Promise<Parent> => {
    await requireAdmin();
    const { data, error } = await supabase.from('parents').insert(parentData).select().single();
    if (error) throw error;
    return data as Parent;
  },

  updateParent: async (id: string, parentData: ParentUpdateData): Promise<Parent> => {
    await requireAdmin();
    const { data, error } = await supabase.from('parents').update(parentData).eq('id', id).select().single();
    if (error) throw error;
    return data as Parent;
  },

  deleteParent: async (id: string): Promise<{ success: boolean }> => {
    await requireAdmin();
    const { error } = await supabase.from('parents').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Blog Posts
  getAllPosts: async (params: { status?: BlogPostStatus; page?: number; limit?: number } = {}): Promise<{ posts: BlogPost[], pagination: object }> => {
    await requireAdmin();
    let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (params.status) {
      query = query.eq('status', params.status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { posts: data || [], pagination: { total: data?.length || 0 } };
  },

  createPost: async (postData: BlogPostCreationData): Promise<BlogPost> => {
    await requireAdmin();
    const { data, error } = await supabase.from('blog_posts').insert(postData).select().single();
    if (error) throw error;
    return data;
  },

  updatePost: async (id: string, postData: BlogPostUpdateData): Promise<BlogPost> => {
    await requireAdmin();
    const { data, error } = await supabase.from('blog_posts').update(postData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  deletePost: async (id: string): Promise<{ success: boolean }> => {
    await requireAdmin();
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Testimonials
  getTestimonials: async (): Promise<{ data: Testimonial[] }> => {
    await requireAdmin();
    const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  createTestimonial: async (testimonialData: TestimonialCreationData): Promise<Testimonial> => {
    await requireAdmin();
    const { data, error } = await supabase.from('testimonials').insert(testimonialData).select().single();
    if (error) throw error;
    return data;
  },

  updateTestimonial: async (id: string, testimonialData: TestimonialUpdateData): Promise<Testimonial> => {
    await requireAdmin();
    const { data, error } = await supabase.from('testimonials').update(testimonialData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  deleteTestimonial: async (id: string): Promise<{ success: boolean }> => {
    await requireAdmin();
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Stud Dogs
  getStudDogs: async (params: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: StudDog[] }> => {
    await requireAdmin();
    const { data, error } = await supabase.from('stud_dogs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  createStudDog: async (studDogData: StudDogCreationData): Promise<StudDog> => {
    await requireAdmin();
    const { data, error } = await supabase.from('stud_dogs').insert(studDogData).select().single();
    if (error) throw error;
    return data;
  },

  updateStudDog: async (id: string, studDogData: StudDogUpdateData): Promise<StudDog> => {
    await requireAdmin();
    const { data, error } = await supabase.from('stud_dogs').update(studDogData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  deleteStudDog: async (id: string): Promise<{ success: boolean }> => {
    await requireAdmin();
    const { error } = await supabase.from('stud_dogs').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Site Settings
  getSiteSettings: async (): Promise<{ data: SiteSettings[] }> => {
    await requireAdmin();
    const { data, error } = await supabase.from('site_settings').select('*');
    if (error) throw error;
    return { data: data || [] };
  },

  updateSiteSettings: async (key: string, value: any): Promise<SiteSettings> => {
    await requireAdmin();
    const { data, error } = await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() }).select().single();
    if (error) throw error;
    return data;
  },

  // Data Deletion Requests
  getDataDeletionRequests: async (params: { status?: DataDeletionRequestStatus; page?: number; limit?: number } = {}): Promise<{ data: DataDeletionRequest[]; total: number; totalPages: number; currentPage: number; }> => {
    await requireAdmin();
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase.from('data_deletion_requests').select('*', { count: 'exact' }).order('requested_at', { ascending: false });

    if (params.status) {
      query = query.eq('status', params.status);
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);
    
    if (error) throw error;
    return {
      data: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    };
  },

  updateDataDeletionRequestStatus: async (id: string, status: DataDeletionRequestStatus, updates?: Partial<DataDeletionRequest>): Promise<DataDeletionRequest> => {
    await requireAdmin();
    const updateData: any = { status, processed_at: new Date().toISOString(), ...updates };
    const { data, error } = await supabase.from('data_deletion_requests').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // Email Templates
  getEmailTemplates: async (): Promise<{ data: EmailTemplate[] }> => {
    await requireAdmin();
    const { data, error } = await supabase.from('email_templates').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { data: data || [] };
  },

  getEmailTemplateById: async (id: string): Promise<EmailTemplate> => {
    await requireAdmin();
    const { data, error } = await supabase.from('email_templates').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  updateEmailTemplate: async (id: string, templateData: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    await requireAdmin();
    const { data, error } = await supabase.from('email_templates').update(templateData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  // Third-party integrations
  getIntegrations: async (): Promise<{ integrations: ThirdPartyIntegration[] }> => {
    await requireAdmin();
    const { data, error } = await supabase.functions.invoke('integrations-list');
    if (error) throw error;
    return data;
  },

  upsertIntegration: async (integrationData: { service_name: IntegrationService; environment?: IntegrationEnvironment; [key: string]: any }): Promise<any> => {
    await requireAdmin();
    const payload = {
      service: integrationData.service_name,
      environment: integrationData.environment || 'production',
      data: { ...integrationData },
    };
    delete payload.data.service_name;
    delete payload.data.environment;

    const { data, error } = await supabase.functions.invoke('integrations-upsert', { body: payload });
    if (error) throw error;
    return data;
  },

  deleteIntegration: async (identifiers: { service_name: IntegrationService; environment: IntegrationEnvironment }): Promise<any> => {
    await requireAdmin();
    const { data, error } = await supabase.functions.invoke('integrations-delete', { body: identifiers });
    if (error) throw error;
    return data;
  },

  // SEO Management
  getSeoMeta: async (params: any = {}): Promise<{ metadata: SeoMeta[] }> => {
    await requireAdmin();
    const { data, error } = await supabase.from('seo_meta').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return { metadata: data || [] };
  },

  createSeoMeta: async (seoData: SeoMetaCreationData): Promise<SeoMeta> => {
    await requireAdmin();
    const { data, error } = await supabase.from('seo_meta').insert(seoData).select().single();
    if (error) throw error;
    return data;
  },

  updateSeoMeta: async (id: string, seoData: SeoMetaDataUpdate): Promise<SeoMeta> => {
    await requireAdmin();
    const { data, error } = await supabase.from('seo_meta').update(seoData).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  deleteSeoMeta: async (id: string): Promise<{ success: boolean }> => {
    await requireAdmin();
    const { error } = await supabase.from('seo_meta').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  // Apple Pay Configuration
  getApplePayConfig: async (): Promise<ApplePayConfig> => {
    await requireAdmin();
    // Placeholder implementation
    return {
      merchant_id: 'merchant.com.example.gdspuppies',
      domain_verified: false,
      certificate_uploaded: false,
      last_verified: null,
      domains: [window.location.hostname],
    };
  },

  updateApplePayConfig: async (config: Partial<ApplePayConfig>): Promise<ApplePayConfig> => {
    await requireAdmin();
    // Placeholder implementation
    console.warn('[adminApi.updateApplePayConfig] This function is a placeholder.');
    return {
      merchant_id: config.merchant_id || 'merchant.com.example.gdspuppies',
      domain_verified: false,
      certificate_uploaded: false,
      ...config,
    };
  },

  uploadApplePayCertificate: async (formData: FormData): Promise<{ success: boolean }> => {
    await requireAdmin();
    // Placeholder implementation
    console.warn('[adminApi.uploadApplePayCertificate] This function is a placeholder.');
    return { success: true };
  },

  verifyApplePayDomain: async (domain: string): Promise<{ success: boolean; message: string }> => {
    await requireAdmin();
    // Placeholder implementation
    console.warn('[adminApi.verifyApplePayDomain] This function is a placeholder.');
    return { success: true, message: `Domain ${domain} verification simulation successful.` };
  },

  // Transactions
  getTransactions: async (params: { page?: number, limit?: number } = {}): Promise<{ data: Transaction[], total: number, totalPages: number, currentPage: number }> => {
    await requireAdmin();
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;
    
    const { data, error, count } = await supabase.from('transactions').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page,
    };
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    await requireAdmin();
    
    const [puppiesResult, littersResult, transactionsResult, usersResult, testimonialsResult, blogPostsResult] = await Promise.all([
      supabase.from('puppies').select('status', { count: 'exact' }),
      supabase.from('litters').select('status', { count: 'exact' }),
      supabase.from('transactions').select('amount', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('testimonials').select('id', { count: 'exact' }),
      supabase.from('blog_posts').select('id', { count: 'exact' })
    ]);
    
    const puppiesCount = puppiesResult.count || 0;
    const littersCount = littersResult.count || 0;
    const transactionsCount = transactionsResult.count || 0;
    const usersCount = usersResult.count || 0;
    const testimonialsCount = testimonialsResult.count || 0;
    const blogPostsCount = blogPostsResult.count || 0;
    
    const totalRevenue = transactionsResult.data?.reduce((sum, t: any) => sum + (t.amount || 0), 0) || 0;
    
    return {
      puppies: {
        total: puppiesCount,
        available: puppiesResult.data?.filter((p: any) => p.status === 'Available').length || 0
      },
      litters: {
        total: littersCount,
        active: littersResult.data?.filter((l: any) => l.status === 'Active').length || 0
      },
      transactions: {
        total: transactionsCount
      },
      users: {
        total: usersCount
      },
      revenue: {
        total: totalRevenue
      },
      testimonials: {
        total: testimonialsCount
      },
      blogPosts: {
        total: blogPostsCount
      }
    };
  }
};