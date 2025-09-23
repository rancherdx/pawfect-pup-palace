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
 * The main handler for the Square webhook serverless function.
 * This function listens for incoming webhook events from Square, such as payment and order updates.
 * It processes these events to update the application's database, for example, by marking
 * a puppy as 'Sold' upon successful payment.
 *
 * @param {Request} req - The incoming HTTP request from Square, containing the webhook payload.
 * @returns {Promise<Response>} A response to acknowledge receipt of the webhook.
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

    const body = await req.text();
    const webhookData = JSON.parse(body);
    
    console.log('Square webhook received:', JSON.stringify(webhookData, null, 2));

    // TODO: Verify webhook signature when webhook_signature_key is available
    const signature = req.headers.get('x-square-signature');
    console.log('Webhook signature:', signature);

    // Handle different webhook event types
    const eventType = webhookData.type;
    const eventData = webhookData.data;

    switch (eventType) {
      case 'payment.created':
      case 'payment.updated':
        await handlePaymentEvent(supabase, eventData);
        break;
      
      case 'order.created':
      case 'order.updated':
        await handleOrderEvent(supabase, eventData);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Handles payment-related webhook events from Square.
 * @param {any} supabase - The Supabase client instance.
 * @param {any} paymentData - The payment data from the webhook event.
 */
async function handlePaymentEvent(supabase: any, paymentData: any) {
  console.log('Processing payment event:', paymentData);
  
  const payment = paymentData.object?.payment;
  if (!payment) return;

  // Update payment session status
  const { error: updateError } = await supabase
    .from('payment_sessions')
    .update({
      status: payment.status?.toLowerCase(),
      payment_id: payment.id,
      updated_at: new Date().toISOString(),
      metadata: {
        ...payment,
        updated_via_webhook: true
      }
    })
    .eq('session_id', payment.order_id);

  if (updateError) {
    console.error('Failed to update payment session:', updateError);
  }

  // If payment is completed, update puppy status
  if (payment.status === 'COMPLETED') {
    await completePuppyAdoption(supabase, payment);
  }
}

/**
 * Handles order-related webhook events from Square.
 * @param {any} supabase - The Supabase client instance.
 * @param {any} orderData - The order data from the webhook event.
 */
async function handleOrderEvent(supabase: any, orderData: any) {
  console.log('Processing order event:', orderData);
  
  const order = orderData.object?.order;
  if (!order) return;

  // Update order information if needed
  const { error } = await supabase
    .from('payment_sessions')
    .update({
      metadata: {
        order_data: order,
        updated_via_webhook: true
      }
    })
    .eq('session_id', order.id);

  if (error) {
    console.error('Failed to update order:', error);
  }
}

/**
 * Completes the puppy adoption process after a successful payment.
 * This includes updating the puppy's status to 'Sold' and associating it with the new owner.
 * @param {any} supabase - The Supabase client instance.
 * @param {any} payment - The completed payment object from Square.
 */
async function completePuppyAdoption(supabase: any, payment: any) {
  try {
    // Get the payment session to find the puppy
    const { data: session, error: sessionError } = await supabase
      .from('payment_sessions')
      .select('puppy_id, user_id, customer_email')
      .eq('payment_id', payment.id)
      .single();

    if (sessionError || !session) {
      console.error('Could not find payment session:', sessionError);
      return;
    }

    // Update puppy status to adopted
    const { error: puppyError } = await supabase
      .from('puppies')
      .update({
        status: 'Sold',
        adopted_by: session.user_id,
        adopted_at: new Date().toISOString()
      })
      .eq('id', session.puppy_id);

    if (puppyError) {
      console.error('Failed to update puppy status:', puppyError);
    }

    console.log(`Puppy ${session.puppy_id} successfully adopted by user ${session.user_id}`);
    
    // TODO: Send confirmation email to customer
    
  } catch (error) {
    console.error('Error completing adoption:', error);
  }
}