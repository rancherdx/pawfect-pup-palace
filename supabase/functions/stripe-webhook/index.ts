import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // For now, we'll process without signature verification
    // In production, add STRIPE_WEBHOOK_SECRET and verify
    let event: Stripe.Event;
    
    try {
      event = JSON.parse(body) as Stripe.Event;
      logStep("Parsed event", { type: event.type, id: event.id });
    } catch (err) {
      logStep("Failed to parse webhook body", { error: String(err) });
      return new Response("Invalid payload", { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment succeeded", { 
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          metadata: paymentIntent.metadata
        });

        const { purchase_id, puppy_id, payment_type, customer_email } = paymentIntent.metadata;

        if (!purchase_id) {
          logStep("No purchase_id in metadata, skipping database update");
          break;
        }

        // Create payment record
        const { error: paymentError } = await supabaseClient
          .from("payments")
          .insert({
            purchase_id,
            amount: paymentIntent.amount / 100, // Convert from cents
            payment_method: paymentIntent.payment_method_types?.[0] || "card",
            stripe_payment_intent_id: paymentIntent.id,
            notes: `${payment_type === "deposit" ? "Deposit" : "Balance"} payment via Stripe`
          });

        if (paymentError) {
          logStep("Error creating payment record", { error: paymentError });
        } else {
          logStep("Created payment record");
        }

        // Update purchase status
        const newStatus = payment_type === "deposit" ? "deposit_paid" : "fully_paid";
        
        const { error: purchaseError } = await supabaseClient
          .from("puppy_purchases")
          .update({ 
            status: newStatus,
            stripe_payment_intent_id: paymentIntent.id
          })
          .eq("id", purchase_id);

        if (purchaseError) {
          logStep("Error updating purchase status", { error: purchaseError });
        } else {
          logStep("Updated purchase status", { newStatus });
        }

        // Update puppy status
        if (puppy_id) {
          const puppyStatus = payment_type === "deposit" ? "Reserved" : "Sold";
          const { error: puppyError } = await supabaseClient
            .from("puppies")
            .update({ status: puppyStatus })
            .eq("id", puppy_id);

          if (puppyError) {
            logStep("Error updating puppy status", { error: puppyError });
          } else {
            logStep("Updated puppy status", { puppyStatus });
          }
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Payment failed", { 
          paymentIntentId: paymentIntent.id,
          error: paymentIntent.last_payment_error?.message
        });

        const { purchase_id } = paymentIntent.metadata;
        
        if (purchase_id) {
          await supabaseClient
            .from("puppy_purchases")
            .update({ status: "payment_failed" })
            .eq("id", purchase_id);
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
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
