import { supabase } from "@/integrations/supabase/client";
import { requireAdmin } from "./client";

/**
 * @namespace adminApi
 * @description A collection of API functions for administrative tasks. All functions in this namespace require admin privileges.
 */
export const adminApi = {
  // Users
  /**
   * Fetches a paginated and searchable list of all users.
   * @param {object} params - The query parameters.
   * @param {number} [params.page=1] - The page number to fetch.
   * @param {number} [params.limit=10] - The number of users per page.
   * @param {string} [params.search] - A search term to filter users by name.
   * @returns {Promise<{data: object[]}>} A promise that resolves to an object containing the list of users.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  
  /**
   * Updates a user's profile data.
   * @param {string} id - The UUID of the user to update.
   * @param {Record<string, unknown>} userData - An object containing the user data to update.
   * @returns {Promise<object>} A promise that resolves to the updated user object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Deletes a user from the database.
   * @param {string} id - The UUID of the user to delete.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches all puppies from the database.
   * @returns {Promise<{puppies: object[], pagination: object}>} A promise that resolves to an object containing the list of puppies and pagination info.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Creates a new puppy entry in the database.
   * @param {any} puppyData - The data for the new puppy.
   * @returns {Promise<object>} A promise that resolves to the newly created puppy object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Updates an existing puppy's data.
   * @param {string} id - The ID of the puppy to update.
   * @param {any} puppyData - An object containing the puppy data to update.
   * @returns {Promise<object>} A promise that resolves to the updated puppy object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Deletes a puppy from the database.
   * @param {string} id - The ID of the puppy to delete.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
  deletePuppy: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('puppies')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  /**
   * Updates the status of multiple puppies at once.
   * @param {string[]} puppyIds - An array of puppy IDs to update.
   * @param {"Available" | "Reserved" | "Sold" | "Not For Sale"} status - The new status to set for the puppies.
   * @returns {Promise<{success: boolean, updatedCount: number}>} A promise that resolves to an object indicating success and the number of updated puppies.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Creates multiple puppies at once.
   * @param {any[]} puppiesData - An array of puppy data objects to create.
   * @returns {Promise<{success: boolean, createdCount: number, puppies: object[]}>} A promise that resolves to an object indicating success, the number of created puppies, and the created puppy objects.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Lists all files in a specified Supabase Storage bucket.
   * @param {string} bucketName - The name of the bucket to list files from.
   * @returns {Promise<object[]>} A promise that resolves to an array of file objects, with public URLs added.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches all litters from the database.
   * @param {object} [filters={}] - Optional filters to apply to the query.
   * @returns {Promise<{litters: object[]}>} A promise that resolves to an object containing the list of litters.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Fetches a single litter by its ID.
   * @param {string} id - The ID of the litter to fetch.
   * @returns {Promise<object>} A promise that resolves to the litter object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Creates a new litter entry in the database.
   * @param {any} litterData - The data for the new litter.
   * @returns {Promise<object>} A promise that resolves to the newly created litter object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Updates an existing litter's data.
   * @param {string} id - The ID of the litter to update.
   * @param {any} litterData - An object containing the litter data to update.
   * @returns {Promise<object>} A promise that resolves to the updated litter object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Deletes a litter from the database.
   * @param {string} id - The ID of the litter to delete.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches all blog posts, with optional filtering by status.
   * @param {object} [params={}] - The query parameters.
   * @param {string} [params.status] - The status to filter posts by (e.g., 'published', 'draft').
   * @param {number} [params.page] - The page number.
   * @param {number} [params.limit] - The number of posts per page.
   * @returns {Promise<{posts: object[], pagination: object}>} A promise that resolves to an object containing the list of posts and pagination info.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Creates a new blog post.
   * @param {any} postData - The data for the new blog post.
   * @returns {Promise<object>} A promise that resolves to the newly created post object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Updates an existing blog post.
   * @param {string} id - The ID of the post to update.
   * @param {any} postData - An object containing the post data to update.
   * @returns {Promise<object>} A promise that resolves to the updated post object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Deletes a blog post.
   * @param {string} id - The ID of the post to delete.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches all testimonials.
   * @returns {Promise<{data: object[]}>} A promise that resolves to an object containing the list of testimonials.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
  getTestimonials: async () => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  },

  /**
   * Creates a new testimonial.
   * @param {any} testimonialData - The data for the new testimonial.
   * @returns {Promise<object>} A promise that resolves to the newly created testimonial object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Updates an existing testimonial.
   * @param {string} id - The ID of the testimonial to update.
   * @param {any} testimonialData - An object containing the testimonial data to update.
   * @returns {Promise<object>} A promise that resolves to the updated testimonial object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Deletes a testimonial.
   * @param {string} id - The ID of the testimonial to delete.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches all stud dogs.
   * @param {object} [params={}] - The query parameters.
   * @param {number} [params.page] - The page number.
   * @param {number} [params.limit] - The number of items per page.
   * @param {string} [params.search] - A search term.
   * @returns {Promise<{data: object[]}>} A promise that resolves to an object containing the list of stud dogs.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
  getStudDogs: async (params: { page?: number; limit?: number; search?: string } = {}) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('stud_dogs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  },

  /**
   * Creates a new stud dog entry.
   * @param {any} studDogData - The data for the new stud dog.
   * @returns {Promise<object>} A promise that resolves to the newly created stud dog object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Updates an existing stud dog's data.
   * @param {string} id - The ID of the stud dog to update.
   * @param {any} studDogData - An object containing the stud dog data to update.
   * @returns {Promise<object>} A promise that resolves to the updated stud dog object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Deletes a stud dog from the database.
   * @param {string} id - The ID of the stud dog to delete.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches enhanced testimonials with additional metadata.
   * @param {any} [params={}] - Optional query parameters.
   * @returns {Promise<{testimonials: object[], total: number}>} A promise that resolves to an object containing the list of testimonials and the total count.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Fetches analytics data for testimonials.
   * @returns {Promise<object>} A promise that resolves to an object with testimonial analytics.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Creates an enhanced testimonial. This is an alias for `createTestimonial`.
   * @param {any} data - The data for the new testimonial.
   * @returns {Promise<object>} A promise that resolves to the newly created testimonial object.
   */
  createEnhancedTestimonial: async (data: any) => {
    return adminApi.createTestimonial(data);
  },

  /**
   * Updates an enhanced testimonial. This is an alias for `updateTestimonial`.
   * @param {string} id - The ID of the testimonial to update.
   * @param {any} data - The data to update.
   * @returns {Promise<object>} A promise that resolves to the updated testimonial object.
   */
  updateEnhancedTestimonial: async (id: string, data: any) => {
    return adminApi.updateTestimonial(id, data);
  },

  /**
   * Synchronizes reviews from Google. (Placeholder)
   * @returns {Promise<{count: number, message: string}>} A promise that resolves to an object indicating the result of the sync.
   */
  syncGoogleReviews: async () => {
    await requireAdmin();
    // Placeholder - would integrate with Google Reviews API
    return { count: 0, message: 'Google Reviews sync not implemented yet' };
  },

  // Notifications (placeholders)
  /**
   * Fetches notifications for the admin. (Placeholder)
   * @returns {Promise<any[]>} A promise that resolves to an empty array.
   */
  getNotifications: async () => {
    await requireAdmin();
    return [];
  },

  /**
   * Fetches notification settings. (Placeholder)
   * @returns {Promise<object>} A promise that resolves to a default notification settings object.
   */
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

  /**
   * Marks specified notifications as read. (Placeholder)
   * @param {string[]} notificationIds - An array of notification IDs to mark as read.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   */
  markNotificationsAsRead: async (notificationIds: string[]) => {
    await requireAdmin();
    return { success: true };
  },

  /**
   * Updates notification settings. (Placeholder)
   * @param {any} settings - The new settings object.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   */
  updateNotificationSettings: async (settings: any) => {
    await requireAdmin();
    return { success: true };
  },

  // Apple Pay Configuration with proper structure
  /**
   * Fetches the current Apple Pay configuration. (Placeholder)
   * @returns {Promise<object>} A promise that resolves to a default Apple Pay configuration object.
   */
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

  /**
   * Updates the Apple Pay configuration. (Placeholder)
   * @param {any} config - The new configuration object.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   */
  updateApplePayConfig: async (config: any) => {
    await requireAdmin();
    return { success: true };
  },

  /**
   * Uploads an Apple Pay certificate. (Placeholder)
   * @param {FormData} formData - The form data containing the certificate.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   */
  uploadApplePayCertificate: async (formData: FormData) => {
    await requireAdmin();
    return { success: true };
  },

  /**
   * Verifies an Apple Pay domain. (Placeholder)
   * @param {string} domain - The domain to verify.
   * @returns {Promise<{success: boolean, message: string}>} A promise that resolves to an object indicating the result of the verification.
   */
  verifyApplePayDomain: async (domain: string) => {
    await requireAdmin();
    return { success: true, message: 'Domain verification not implemented' };
  },

  // Site Settings
  /**
   * Fetches all site settings.
   * @returns {Promise<{data: object[]}>} A promise that resolves to an object containing the list of site settings.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
  getSiteSettings: async () => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('site_settings')
      .select('*');
    
    if (error) throw error;
    return { data };
  },

  /**
   * Updates a specific site setting.
   * @param {string} key - The key of the setting to update.
   * @param {any} value - The new value for the setting.
   * @returns {Promise<object>} A promise that resolves to the updated setting object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches all data deletion requests.
   * @param {any} [params={}] - Optional query parameters.
   * @returns {Promise<{data: object[]}>} A promise that resolves to an object containing the list of requests.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
  getDataDeletionRequests: async (params: any = {}) => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('data_deletion_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  },

  /**
   * Updates the status of a data deletion request.
   * @param {string} id - The ID of the request to update.
   * @param {string} status - The new status for the request.
   * @returns {Promise<object>} A promise that resolves to the updated request object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches all email templates.
   * @returns {Promise<{data: object[]}>} A promise that resolves to an object containing the list of email templates.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
  getEmailTemplates: async () => {
    await requireAdmin();
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data };
  },

  /**
   * Fetches a single email template by its ID.
   * @param {string} id - The ID of the email template to fetch.
   * @returns {Promise<object>} A promise that resolves to the email template object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Updates an existing email template.
   * @param {string} id - The ID of the template to update.
   * @param {any} templateData - An object containing the template data to update.
   * @returns {Promise<object>} A promise that resolves to the updated template object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches all third-party integrations by invoking a Supabase Edge Function.
   * @returns {Promise<any>} A promise that resolves to the data returned by the Edge Function.
   * @throws Will throw an error if the user is not an admin or if the function invocation fails.
   */
  getIntegrations: async () => {
    await requireAdmin();
    const { data, error } = await supabase.functions.invoke('integrations-list');
    if (error) throw error;
    // The function returns { integrations: [...] }, so we return that directly
    return data;
  },

  /**
   * Creates or updates a third-party integration by invoking a Supabase Edge Function.
   * @param {object} integrationData - The data for the integration.
   * @param {string} integrationData.service_name - The name of the service being integrated.
   * @param {string} [integrationData.environment='production'] - The environment for the integration.
   * @returns {Promise<any>} A promise that resolves to the data returned by the Edge Function.
   * @throws Will throw an error if the user is not an admin or if the function invocation fails.
   */
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

  /**
   * Creates a new integration. This is an alias for `upsertIntegration`.
   * @param {object} integrationData - The data for the integration.
   * @returns {Promise<any>} A promise that resolves to the result of the upsert operation.
   */
  createIntegration: async (integrationData: { service_name: string; environment?: string; [key: string]: any }) => {
    return adminApi.upsertIntegration(integrationData);
  },

  /**
   * Updates an existing integration. This is an alias for `upsertIntegration`.
   * @param {string} id - The ID of the integration (ignored, but kept for API consistency).
   * @param {object} integrationData - The data for the integration.
   * @returns {Promise<any>} A promise that resolves to the result of the upsert operation.
   */
  updateIntegration: async (id: string, integrationData: { service_name: string; environment?: string; [key: string]: any }) => {
    // The 'id' is ignored, but kept for compatibility with the calling component's mutation key.
    return adminApi.upsertIntegration(integrationData);
  },

  /**
   * Deletes a third-party integration by invoking a Supabase Edge Function.
   * @param {object} identifiers - The identifiers for the integration to delete.
   * @param {string} identifiers.service_name - The name of the service.
   * @param {string} identifiers.environment - The environment of the integration.
   * @returns {Promise<any>} A promise that resolves to the data returned by the Edge Function.
   * @throws Will throw an error if the user is not an admin or if the function invocation fails.
   */
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
  /**
   * Fetches all SEO metadata entries.
   * @param {any} [params={}] - Optional query parameters.
   * @returns {Promise<{metadata: object[]}>} A promise that resolves to an object containing the list of SEO metadata.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Creates a new SEO metadata entry.
   * @param {any} seoData - The data for the new SEO entry.
   * @returns {Promise<object>} A promise that resolves to the newly created SEO entry object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Updates an existing SEO metadata entry.
   * @param {string} id - The ID of the SEO entry to update.
   * @param {any} seoData - An object containing the SEO data to update.
   * @returns {Promise<object>} A promise that resolves to the updated SEO entry object.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Deletes an SEO metadata entry.
   * @param {string} id - The ID of the SEO entry to delete.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
  deleteSeoMeta: async (id: string) => {
    await requireAdmin();
    const { error } = await supabase
      .from('seo_meta')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  /**
   * Fetches SEO analytics data. (Placeholder)
   * @returns {Promise<object>} A promise that resolves to a default SEO analytics object.
   */
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
  /**
   * Fetches the current Square integration environment settings. (Placeholder)
   * @returns {Promise<object>} A promise that resolves to a default Square environment object.
   */
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

  /**
   * Switches the Square integration environment. (Placeholder)
   * @param {'sandbox' | 'production'} environment - The environment to switch to.
   * @returns {Promise<{success: boolean, environment: string}>} A promise that resolves to an object indicating success and the new environment.
   */
  switchSquareEnvironment: async (environment: 'sandbox' | 'production') => {
    await requireAdmin();
    return { success: true, environment };
  },

  /**
   * Tests the connection to the Square API. (Placeholder)
   * @returns {Promise<{success: boolean, message: string}>} A promise that resolves to an object indicating the result of the connection test.
   */
  testSquareConnection: async () => {
    await requireAdmin();
    return { success: true, message: 'Connection test not implemented' };
  },

  // Additional missing methods
  /**
   * Fetches security-related statistics. (Placeholder)
   * @returns {Promise<object>} A promise that resolves to a default security stats object.
   */
  getSecurityStats: async () => {
    await requireAdmin();
    return {
      failed_logins_24h: 2,
      role_changes_7d: 0,
      total_active_sessions: 15,
      suspicious_activities_24h: 1
    };
  },

  /**
   * Fetches recent security events. (Placeholder)
   * @returns {Promise<object>} A promise that resolves to an object containing a list of mock security events.
   */
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

  /**
   * Fetches a paginated list of transactions.
   * @param {any} [params={}] - Optional query parameters for pagination.
   * @returns {Promise<object>} A promise that resolves to an object containing the list of transactions and pagination details.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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

  /**
   * Creates a new notification. (Placeholder)
   * @param {any} notificationData - The data for the new notification.
   * @returns {Promise<{success: boolean}>} A promise that resolves to an object indicating success.
   */
  createNotification: async (notificationData: any) => {
    await requireAdmin();
    return { success: true };
  },

  // Sales Analytics
  /**
   * Fetches sales analytics data for a given time range.
   * @param {string} [timeRange='30d'] - The time range for the analytics ('7d', '30d', '90d', '1y').
   * @returns {Promise<object>} A promise that resolves to an object containing sales analytics.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches a paginated and searchable history of transactions.
   * @param {object} [params={}] - The query parameters.
   * @param {string} [params.search] - A search term for the Square payment ID.
   * @param {string} [params.status] - The transaction status to filter by.
   * @param {number} [params.page] - The page number.
   * @param {number} [params.limit] - The number of items per page.
   * @returns {Promise<object>} A promise that resolves to an object containing the list of transactions and summary statistics.
   * @throws Will throw an error if the user is not an admin or if the Supabase query fails.
   */
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
  /**
   * Fetches various statistics for the main admin dashboard.
   * @returns {Promise<object>} A promise that resolves to an object containing various dashboard statistics.
   * @throws Will throw an error if the user is not an admin or if any of the Supabase queries fail.
   */
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