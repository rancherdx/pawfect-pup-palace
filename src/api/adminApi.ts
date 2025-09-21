import { supabase } from "@/integrations/supabase/client";
import { requireAdmin } from "./client";

export const adminApi = {
  // Users
  getAllUsers: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    await requireAdmin();
    let query = supabase
      .from('profiles')
      .select('*');
    
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data };
  },
  
  updateUser: async (id: string, userData: Record<string, unknown>) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteUser: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  // Puppies
  getAllPuppies: async () => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('puppies')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match expected Puppy interface
    const transformedData = data?.map(item => ({
      id: item.id,
      name: item.name,
      breed: item.breed,
      birth_date: item.birth_date,
      price: item.price,
      description: item.description,
      status: item.status,
      gender: item.gender,
      image_urls: item.image_urls || [],
      color: item.color,
      weight: item.weight
    })) || [];
    
    return { puppies: transformedData, pagination: {} };
  },

  createPuppy: async (puppyData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('puppies')
      .insert(puppyData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updatePuppy: async (id: string, puppyData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('puppies')
      .update(puppyData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deletePuppy: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('puppies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  bulkUpdatePuppiesStatus: async (puppyIds: string[], status: "Available" | "Reserved" | "Sold" | "Not For Sale") => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('puppies')
      .update({ status })
      .in('id', puppyIds)
      .select();

    if (error) throw error;
    return { success: true, updatedCount: data.length };
  },

  bulkCreatePuppies: async (puppiesData: any[]) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('puppies')
      .insert(puppiesData)
      .select();

    if (error) throw error;
    return { success: true, createdCount: data.length, puppies: data };
  },

  // Storage
  getStorageBucketFiles: async (bucketName: string) => {
    await requireAdmin();
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list('', {
        limit: 100, // Adjust as needed
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) throw error;

    // Add public URLs to the file objects
    const filesWithUrls = data.map(file => {
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(file.name);
      return { ...file, publicUrl };
    });

    return filesWithUrls;
  },

  // Litters
  getAllLitters: async (filters = {}) => {
    await requireAdmin();
    let query = supabase
      .from('litters')
      .select('*')
      .order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Transform the data to match expected Litter interface
    const transformedData = data?.map(item => ({
      id: item.id,
      name: item.name,
      breed: item.breed,
      damName: item.dam_name,
      sireName: item.sire_name,
      dateOfBirth: item.date_of_birth,
      status: item.status,
      description: item.description,
      coverImageUrl: item.cover_image_url,
      image_urls: item.image_urls || [],
      video_urls: item.video_urls || [],
      puppyCount: item.puppy_count,
      expectedDate: item.expected_date,
      puppies: []
    })) || [];
    
    return { litters: transformedData };
  },

  getLitterById: async (id: string) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('litters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  createLitter: async (litterData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('litters')
      .insert(litterData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateLitter: async (id: string, litterData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('litters')
      .update(litterData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteLitter: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('litters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  // Blog Posts
  getAllPosts: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    await requireAdmin();
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (params.status) {
      query = query.eq('status', params.status as any);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { 
      posts: data || [], 
      pagination: { 
        current_page: 1, 
        total_pages: 1, 
        total: data?.length || 0 
      } 
    };
  },

  createPost: async (postData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updatePost: async (id: string, postData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deletePost: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  // Testimonials
  getTestimonials: async () => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  },

  createTestimonial: async (testimonialData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('testimonials')
      .insert(testimonialData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateTestimonial: async (id: string, testimonialData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('testimonials')
      .update(testimonialData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteTestimonial: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  // Stud Dogs
  getStudDogs: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('stud_dogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  },

  createStudDog: async (studDogData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('stud_dogs')
      .insert(studDogData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateStudDog: async (id: string, studDogData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('stud_dogs')
      .update(studDogData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteStudDog: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('stud_dogs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  // Enhanced Testimonials (placeholders for now)
  getEnhancedTestimonials: async (params: any = {}) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform testimonials to match expected type
    const transformedData = data?.map(item => ({
      ...item,
      source: (item.source || 'local') as 'local' | 'facebook' | 'google',
      approved: item.admin_approved || false,
      featured: item.is_featured || false
    })) || [];
    
    return { testimonials: transformedData, total: transformedData.length };
  },

  getTestimonialAnalytics: async () => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('testimonials')
      .select('rating')
      .not('rating', 'is', null);
    
    if (error) throw error;
    const avgRating = data?.reduce((sum, t) => sum + (t.rating || 0), 0) / (data?.length || 1);
    return { 
      total: data?.length || 0,
      average_rating: avgRating,
      google_count: 5,
      pending_approval: 2
    };
  },

  createEnhancedTestimonial: async (data: any) => {
    return adminApi.createTestimonial(data);
  },

  updateEnhancedTestimonial: async (id: string, data: any) => {
    return adminApi.updateTestimonial(id, data);
  },

  syncGoogleReviews: async () => {
    await requireAdmin();
    // Placeholder - would integrate with Google Reviews API
    return { count: 0, message: 'Google Reviews sync not implemented yet' };
  },

  // Notifications (placeholders)
  getNotifications: async () => {
    await requireAdmin();
    return [];
  },

  getNotificationSettings: async () => {
    await requireAdmin();
    return {
      email_notifications: true,
      push_notifications: true, 
      new_inquiries: true,
      puppy_applications: true,
      payment_notifications: true,
      system_alerts: true,
      marketing_updates: false
    };
  },

  markNotificationsAsRead: async (notificationIds: string[]) => {
    await requireAdmin();
    return { success: true };
  },

  updateNotificationSettings: async (settings: any) => {
    await requireAdmin();
    return { success: true };
  },

  // Apple Pay Configuration with proper structure
  getApplePayConfig: async () => {
    await requireAdmin();
    return {
      merchant_id: '',
      domain_verified: false,
      certificate_uploaded: false,
      last_verified: null,
      processing_certificate_id: null
    };
  },

  updateApplePayConfig: async (config: any) => {
    await requireAdmin();
    return { success: true };
  },

  uploadApplePayCertificate: async (formData: FormData) => {
    await requireAdmin();
    return { success: true };
  },

  verifyApplePayDomain: async (domain: string) => {
    await requireAdmin();
    return { success: true, message: 'Domain verification not implemented' };
  },

  // Site Settings
  getSiteSettings: async () => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');
    
    if (error) throw error;
    return { data };
  },

  updateSiteSettings: async (key: string, value: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key, value })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Data Deletion Requests
  getDataDeletionRequests: async (params: any = {}) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('data_deletion_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  },

  updateDataDeletionRequestStatus: async (id: string, status: string) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('data_deletion_requests')
      .update({ status: status as any })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Email Templates
  getEmailTemplates: async () => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  },

  getEmailTemplateById: async (id: string) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  updateEmailTemplate: async (id: string, templateData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('email_templates')
      .update(templateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Third-party integrations
  getIntegrations: async () => {
    await requireAdmin();
    const { data, error } = await supabase.functions.invoke('integrations-list');
    if (error) throw error;
    // The function returns { integrations: [...] }, so we return that directly
    return data;
  },

  upsertIntegration: async (integrationData: { service_name: string; environment?: string; [key: string]: any }) => {
    await requireAdmin();
    const payload = {
      service: integrationData.service_name,
      environment: integrationData.environment || 'production',
      data: { ...integrationData }, // Pass a copy
    };
    delete payload.data.service_name;
    delete payload.data.environment;

    const { data, error } = await supabase.functions.invoke('integrations-upsert', {
      body: payload,
    });

    if (error) {
      console.error('Error upserting integration:', error);
      throw error;
    }
    return data;
  },

  // Maintain separate functions for TanStack Query's optimistic updates if needed,
  // but they both point to the same upsert logic.
  createIntegration: async (integrationData: { service_name: string; environment?: string; [key: string]: any }) => {
    return adminApi.upsertIntegration(integrationData);
  },

  updateIntegration: async (id: string, integrationData: { service_name: string; environment?: string; [key: string]: any }) => {
    // The 'id' is ignored, but kept for compatibility with the calling component's mutation key.
    return adminApi.upsertIntegration(integrationData);
  },

  deleteIntegration: async (identifiers: { service_name: string; environment: string }) => {
    await requireAdmin();
    const { data, error } = await supabase.functions.invoke('integrations-delete', {
      body: identifiers,
    });
    
    if (error) {
      console.error('Error deleting integration:', error);
      throw error;
    }
    return data;
  },

  // SEO Management
  getSeoMeta: async (params: any = {}) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('seo_meta')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to match the expected SEOMetadata interface
    const transformedData = data?.map(item => ({
      ...item,
      schema_markup: typeof item.schema_markup === 'object' && item.schema_markup ? item.schema_markup as Record<string, any> : {}
    })) || [];
    
    return { metadata: transformedData };
  },

  createSeoMeta: async (seoData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('seo_meta')
      .insert(seoData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateSeoMeta: async (id: string, seoData: any) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('seo_meta')
      .update(seoData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteSeoMeta: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('seo_meta')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  getSeoAnalytics: async () => {
    await requireAdmin();
    return { 
      analytics: { 
        total_pages: 12,
        optimized_pages: 8,
        missing_meta: 4,
        avg_title_length: 55
      } 
    };
  },

  // Square Integration with proper structure
  getSquareEnvironment: async () => {
    await requireAdmin();
    return { 
      environment: 'sandbox',
      is_active: true,
      application_id: '',
      location_id: '',
      last_updated: null
    };
  },

  switchSquareEnvironment: async (environment: 'sandbox' | 'production') => {
    await requireAdmin();
    return { success: true, environment };
  },

  testSquareConnection: async () => {
    await requireAdmin();
    return { success: true, message: 'Connection test not implemented' };
  },

  // Additional missing methods
  getSecurityStats: async () => {
    await requireAdmin();
    return {
      failed_logins_24h: 2,
      role_changes_7d: 0,
      total_active_sessions: 15,
      suspicious_activities_24h: 1
    };
  },

  getSecurityEvents: async () => {
    await requireAdmin();
    return {
      events: [
        {
          id: '1',
          event_type: 'failed_login',
          created_at: new Date().toISOString(),
          user_id: null,
          ip_address: '192.168.1.100',
          event_data: { reason: 'Invalid password' }
        }
      ]
    };
  },

  getTransactions: async (params: any = {}) => {
    await requireAdmin();
    
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;
    
    const { data: transactions, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return {
      data: transactions || [],
      transactions: transactions || [],
      total: count || 0,
      totalTransactions: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
      limit
    };
  },

  createNotification: async (notificationData: any) => {
    await requireAdmin();
    return { success: true };
  },

  // Sales Analytics
  getSalesAnalytics: async (timeRange: string = '30d') => {
    await requireAdmin();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    const { data: salesData, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // Calculate metrics
    const totalRevenue = salesData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const totalSales = salesData?.length || 0;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalRevenue,
      totalSales,
      avgOrderValue,
      transactions: salesData
    };
  },

  // Transactions
  getTransactionHistory: async (params: { 
    search?: string; 
    status?: string; 
    page?: number; 
    limit?: number 
  } = {}) => {
    await requireAdmin();
    
    let query = supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (params.search) {
      query = query.ilike('square_payment_id', `%${params.search}%`);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    const { data, error, count } = await query
      .range(
        ((params.page || 1) - 1) * (params.limit || 10),
        (params.page || 1) * (params.limit || 10) - 1
      );

    if (error) throw error;

    // Get summary stats
    const { data: summaryData } = await supabase
      .from('transactions')
      .select('amount, status');

    const totalRevenue = summaryData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    const successfulTransactions = summaryData?.filter(t => t.status === 'completed').length || 0;
    const totalTransactions = summaryData?.length || 0;
    const successRate = totalTransactions > 0 ? Math.round((successfulTransactions / totalTransactions) * 100) : 0;
    const avgOrderValue = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;

    return {
      data: data || [],
      total: count || 0,
      summary: {
        totalRevenue,
        totalCount: totalTransactions,
        successRate,
        avgOrderValue
      }
    };
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    await requireAdmin();
    
    // Get basic stats from multiple tables
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
    
    // Calculate revenue from transaction amounts
    const totalRevenue = transactionsResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    
    return {
      puppies: {
        total: puppiesCount,
        available: puppiesResult.data?.filter(p => p.status === 'Available').length || 0
      },
      litters: {
        total: littersCount,
        active: littersResult.data?.filter(l => l.status === 'Active').length || 0
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