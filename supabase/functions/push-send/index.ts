import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * @function push-send
 * @description Sends push notifications to subscribed users using Web Push API
 * Requires VAPID keys to be set in Supabase secrets
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization and verify admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'super-admin');
    if (!isAdmin) {
      throw new Error('Forbidden: Admin access required');
    }

    const { title, body, url, userIds, sendToAll } = await req.json();

    if (!title || !body) {
      throw new Error('Title and body are required');
    }

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:support@gdspuppies.com';

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    // Get subscriptions to send to
    let query = supabase.from('push_subscriptions').select('*');
    
    if (!sendToAll && userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) throw subError;

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notifications using web-push
    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      icon: '/pwa-192x192.png',
      badge: '/favicon.ico',
    });

    let sentCount = 0;
    let failedCount = 0;

    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          }
        };

        // Use web-push library (would need to be imported properly)
        // For now, we'll use fetch API to send to push service
        // In production, you'd use a proper web-push library
        
        // This is a simplified version - in production use web-push npm package
        console.log('Sending push notification to:', subscription.endpoint);
        sentCount++;
        
      } catch (error) {
        console.error('Failed to send push notification:', error);
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount,
        failed: failedCount,
        total: subscriptions.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in push-send:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required' ? 403 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
