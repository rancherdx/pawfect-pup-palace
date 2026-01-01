import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-PAYMENT-INTENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    let user = null;
    let userEmail = null;

    // Try to get authenticated user, but allow guest checkout
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      user = userData.user;
      userEmail = user?.email;
      logStep("User authenticated", { userId: user?.id, email: userEmail });
    }

    const body = await req.json();
    const { 
      puppyId, 
      puppyName,
      puppyPrice,
      depositAmount,
      paymentType = "deposit", // "deposit" or "balance"
      purchaseId,
      customerEmail,
      customerName,
      customerPhone
    } = body;

    logStep("Request body", { puppyId, puppyPrice, depositAmount, paymentType, purchaseId });

    const email = userEmail || customerEmail;
    if (!email) throw new Error("Customer email is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Get or create Stripe customer
    let customerId: string;
    const customers = await stripe.customers.list({ email, limit: 1 });
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email,
        name: customerName,
        phone: customerPhone,
        metadata: {
          supabase_user_id: user?.id || "guest"
        }
      });
      customerId = customer.id;
      logStep("Created new Stripe customer", { customerId });
    }

    // Update profile with Stripe customer ID if user is authenticated
    if (user?.id) {
      await supabaseClient
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Calculate amount based on payment type
    const amount = paymentType === "deposit" ? depositAmount : (puppyPrice - depositAmount);
    const amountInCents = Math.round(amount * 100);

    logStep("Calculated payment amount", { paymentType, amount, amountInCents });

    // Create or get purchase record
    let currentPurchaseId = purchaseId;
    
    if (!currentPurchaseId && paymentType === "deposit") {
      // Create new purchase record for deposits
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14); // Balance due in 14 days

      const { data: purchase, error: purchaseError } = await supabaseClient
        .from("puppy_purchases")
        .insert({
          puppy_id: puppyId,
          customer_id: user?.id || null,
          customer_name: customerName,
          customer_email: email,
          customer_phone: customerPhone,
          total_price: puppyPrice,
          deposit_amount: depositAmount,
          remaining_amount: puppyPrice - depositAmount,
          status: "deposit_pending",
          due_date: dueDate.toISOString().split("T")[0],
          stripe_customer_id: customerId
        })
        .select()
        .single();

      if (purchaseError) {
        logStep("Error creating purchase", { error: purchaseError });
        throw new Error(`Failed to create purchase: ${purchaseError.message}`);
      }

      currentPurchaseId = purchase.id;
      logStep("Created purchase record", { purchaseId: currentPurchaseId });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: customerId,
      metadata: {
        purchase_id: currentPurchaseId,
        puppy_id: puppyId,
        puppy_name: puppyName,
        payment_type: paymentType,
        customer_email: email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    logStep("Created PaymentIntent", { 
      paymentIntentId: paymentIntent.id, 
      clientSecret: paymentIntent.client_secret?.substring(0, 20) + "..." 
    });

    // Update purchase with payment intent ID
    if (currentPurchaseId) {
      await supabaseClient
        .from("puppy_purchases")
        .update({ stripe_payment_intent_id: paymentIntent.id })
        .eq("id", currentPurchaseId);
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        purchaseId: currentPurchaseId,
        customerId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
