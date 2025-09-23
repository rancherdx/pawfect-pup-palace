import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * @constant corsHeaders
 * @description Defines the CORS headers for the function, allowing cross-origin requests.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * @interface GoogleReview
 * @description Defines the structure of a single review object as returned by the Google My Business API.
 */
interface GoogleReview {
  reviewId: string;
  reviewer: {
    profilePhotoUrl?: string;
    displayName: string;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

/**
 * @interface GoogleBusinessLocation
 * @description Defines the structure for the Google Business location data, which is used to identify the business location for fetching reviews.
 */
interface GoogleBusinessLocation {
  accounts: Array<{
    name: string;
    locations: Array<{
      name: string;
      locationName: string;
    }>;
  }>;
}

/**
 * Converts a Google star rating string (e.g., 'FIVE') to a number.
 * @param starRating The star rating string from the Google API.
 * @returns The numeric representation of the rating.
 */
function convertStarRating(starRating: string): number {
  const ratingMap = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5
  };
  return ratingMap[starRating as keyof typeof ratingMap] || 5;
}

/**
 * Fetches reviews for a specific business location from the Google My Business API.
 * @param accessToken The OAuth2 access token for authentication.
 * @param locationName The name of the business location.
 * @returns A promise that resolves to an array of GoogleReview objects.
 */
async function fetchGoogleReviews(accessToken: string, locationName: string): Promise<GoogleReview[]> {
  const response = await fetch(
    `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.reviews || [];
}

/**
 * Syncs an array of Google reviews to the Supabase database.
 * It upserts reviews into a cache table and the main testimonials table.
 * @param reviews An array of GoogleReview objects to sync.
 * @param supabase The Supabase client instance.
 */
async function syncReviewsToSupabase(reviews: GoogleReview[], supabase: any) {
  const promises = reviews.map(async (review) => {
    const reviewData = {
      google_review_id: review.reviewId,
      reviewer_name: review.reviewer.displayName,
      reviewer_photo_url: review.reviewer.profilePhotoUrl || null,
      rating: convertStarRating(review.starRating),
      text: review.comment,
      time_created: review.createTime,
      reply_text: review.reviewReply?.comment || null,
      reply_time_created: review.reviewReply?.updateTime || null,
      last_synced: new Date().toISOString(),
    };

    // Upsert to google_reviews_cache
    const { error: cacheError } = await supabase
      .from('google_reviews_cache')
      .upsert(reviewData, { 
        onConflict: 'google_review_id',
        ignoreDuplicates: false 
      });

    if (cacheError) {
      console.error('Error caching Google review:', cacheError);
    }

    // Also add to testimonials table if not exists
    const testimonialData = {
      name: review.reviewer.displayName,
      testimonial_text: review.comment,
      content: review.comment,
      rating: convertStarRating(review.starRating),
      source: 'google',
      google_review_id: review.reviewId,
      review_date: review.createTime,
      reviewer_avatar: review.reviewer.profilePhotoUrl || null,
      admin_approved: true, // Auto-approve Google reviews
      is_featured: false,
      response_text: review.reviewReply?.comment || null,
      response_date: review.reviewReply?.updateTime || null,
    };

    const { error: testimonialError } = await supabase
      .from('testimonials')
      .upsert(testimonialData, { 
        onConflict: 'google_review_id',
        ignoreDuplicates: false 
      });

    if (testimonialError) {
      console.error('Error syncing testimonial:', testimonialError);
    }
  });

  await Promise.all(promises);
}

/**
 * The main handler for the Google Reviews sync serverless function.
 * This function can be triggered in two ways:
 * 1. POST request: Manually triggers a sync for a specific location using a provided access token.
 * 2. GET request: Can be called by a cron job to automatically check and sync reviews for all
 *    configured and enabled business locations based on their sync frequency.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<Response>} A response indicating the result of the sync operation.
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      // Manual sync trigger or OAuth callback
      const { access_token, location_name } = await req.json();

      if (!access_token || !location_name) {
        return new Response(
          JSON.stringify({ error: 'Access token and location name are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Starting Google Reviews sync...');
      
      const reviews = await fetchGoogleReviews(access_token, location_name);
      console.log(`Fetched ${reviews.length} reviews from Google`);
      
      await syncReviewsToSupabase(reviews, supabase);
      console.log('Reviews synced successfully');

      // Update last sync time in config
      await supabase
        .from('google_business_config')
        .update({ last_sync: new Date().toISOString() })
        .eq('location_id', location_name);

      return new Response(
        JSON.stringify({ 
          message: 'Reviews synced successfully', 
          count: reviews.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      // Automatic sync check
      const { data: configs } = await supabase
        .from('google_business_config')
        .select('*')
        .eq('sync_enabled', true);

      if (!configs || configs.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No active Google Business configurations found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let totalSynced = 0;

      for (const config of configs) {
        try {
          // Check if sync is due
          const lastSync = config.last_sync ? new Date(config.last_sync) : new Date(0);
          const syncInterval = config.sync_frequency_hours * 60 * 60 * 1000;
          
          if (Date.now() - lastSync.getTime() < syncInterval) {
            continue; // Skip if not due yet
          }

          // TODO: Implement token refresh logic here if needed
          const accessToken = config.access_token_encrypted; // Would need decryption
          
          if (accessToken && config.location_id) {
            const reviews = await fetchGoogleReviews(accessToken, config.location_id);
            await syncReviewsToSupabase(reviews, supabase);
            totalSynced += reviews.length;

            // Update last sync time
            await supabase
              .from('google_business_config')
              .update({ last_sync: new Date().toISOString() })
              .eq('id', config.id);
          }
        } catch (error) {
          console.error(`Error syncing reviews for config ${config.id}:`, error);
        }
      }

      return new Response(
        JSON.stringify({ 
          message: 'Automatic sync completed', 
          total_synced: totalSynced 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Google Reviews sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});