import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * @constant corsHeaders
 * @description Defines the CORS headers for the function, allowing cross-origin requests.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * @interface CheckoutRequest
 * @description Defines the structure for the JSON body of a checkout request.
 */
interface CheckoutRequest {
  amount: number;
  puppyName: string;
  puppyId: string;
  userId?: string;
  customerEmail: string;
  billingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

/**
 * The main handler for the square-checkout serverless function.
 * This function creates a Square online checkout payment link for a puppy adoption.
 * It retrieves Square credentials from the database, constructs a request to the
 * Square API, and returns the generated checkout URL to the client. It also logs
 * the payment session for tracking purposes.
 *
 * @param {Request} req - The incoming HTTP request, containing the checkout data.
 * @returns {Promise<Response>} A response containing the Square checkout URL or an error.
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Square configuration
    const { data: squareConfig, error: configError } = await supabase
      .from('secure_integrations')
      .select('*')
      .eq('service_name', 'square')
      .eq('is_active', true)
      .single();

    if (configError || !squareConfig) {
      console.error('Square not configured:', configError);
      return new Response(
        JSON.stringify({ error: 'Square payment not configured' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const checkoutData: CheckoutRequest = await req.json();
    
    // Get decrypted credentials (would be implemented with proper decryption)
    const applicationId = squareConfig.credentials?.application_id;
    const accessToken = squareConfig.credentials?.access_token;
    const locationId = squareConfig.credentials?.location_id;
    const environment = squareConfig.environment || 'sandbox';

    if (!applicationId || !accessToken) {
      return new Response(
        JSON.stringify({ error: 'Square credentials not found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Square API base URL
    const baseUrl = environment === 'production' 
      ? 'https://connect.squareup.com' 
      : 'https://connect.squareupsandbox.com';

    // Create Square checkout session
    const checkoutRequest = {
      idempotency_key: `${checkoutData.puppyId}-${Date.now()}`,
      order: {
        location_id: locationId,
        line_items: [
          {
            name: `Puppy Adoption - ${checkoutData.puppyName}`,
            quantity: '1',
            base_price_money: {
              amount: Math.round(checkoutData.amount * 100), // Convert to cents
              currency: 'USD'
            }
          }
        ]
      },
      payment_options: {
        accept_partial_authorization: false
      },
      checkout_options: {
        redirect_url: `${req.headers.get('origin')}/checkout/success`,
        merchant_support_email: checkoutData.customerEmail
      },
      pre_populate_buyer_email: checkoutData.billingInfo.email,
      pre_populate_shipping_address: {
        first_name: checkoutData.billingInfo.firstName,
        last_name: checkoutData.billingInfo.lastName,
        address_line_1: checkoutData.billingInfo.address,
        locality: checkoutData.billingInfo.city,
        administrative_district_level_1: checkoutData.billingInfo.state,
        postal_code: checkoutData.billingInfo.zipCode,
        country: 'US'
      }
    };

    console.log('Creating Square checkout with:', JSON.stringify(checkoutRequest, null, 2));

    const response = await fetch(`${baseUrl}/v2/online-checkout/payment-links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18'
      },
      body: JSON.stringify(checkoutRequest)
    });

    const result = await response.json();
    console.log('Square API response:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error('Square API error:', result);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create checkout session',
          details: result.errors || result
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Store checkout session for tracking
    const { error: insertError } = await supabase
      .from('payment_sessions')
      .insert({
        puppy_id: checkoutData.puppyId,
        user_id: checkoutData.userId,
        amount: checkoutData.amount,
        status: 'pending',
        payment_provider: 'square',
        session_id: result.payment_link?.id,
        customer_email: checkoutData.billingInfo.email,
        metadata: {
          checkout_url: result.payment_link?.url,
          billing_info: checkoutData.billingInfo
        }
      });

    if (insertError) {
      console.error('Failed to store payment session:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: result.payment_link?.url,
        sessionId: result.payment_link?.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Square checkout error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});