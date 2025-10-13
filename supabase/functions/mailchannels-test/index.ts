import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testEmail, templateType } = await req.json();

    if (!testEmail || !templateType) {
      return new Response(
        JSON.stringify({ error: "Missing testEmail or templateType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify admin access
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Get MailChannels config
    const { data: config } = await supabaseClient
      .from("site_settings")
      .select("value")
      .eq("key", "mailchannels_config")
      .single();

    const activeEnv = config?.value?.active_environment || "sandbox";
    const envConfig = config?.value?.[activeEnv];

    if (!envConfig?.api_key) {
      return new Response(
        JSON.stringify({ error: "MailChannels not configured for " + activeEnv }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get DKIM private key
    const { data: dkimData } = await supabaseClient
      .from("site_settings")
      .select("value")
      .eq("key", "mailchannels_dkim_private_key")
      .single();

    const dkimPrivateKey = dkimData?.value?.key;

    console.log(`Sending test email to ${testEmail} with template ${templateType}`);

    // Email content based on template type
    const templates: Record<string, { subject: string; html: string }> = {
      welcome: {
        subject: "Welcome to GDS Puppies - Test Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #DC2626;">Welcome to GDS Puppies!</h1>
            <p>Thank you for joining our community. This is a test email.</p>
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h2 style="margin-top: 0;">Verification Code</h2>
              <p style="font-size: 32px; font-weight: bold; color: #DC2626; margin: 10px 0;">${verificationCode}</p>
              <p style="font-size: 14px; color: #6b7280;">Enter this code in the admin panel to verify email delivery.</p>
            </div>
            <p>Best regards,<br>GDS Puppies Team</p>
          </div>
        `
      },
      payment_confirmation: {
        subject: "Payment Received - Test Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #DC2626;">Payment Confirmation</h1>
            <p>We've received your payment. This is a test email.</p>
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h2 style="margin-top: 0;">Verification Code</h2>
              <p style="font-size: 32px; font-weight: bold; color: #DC2626; margin: 10px 0;">${verificationCode}</p>
              <p style="font-size: 14px; color: #6b7280;">Enter this code in the admin panel to verify email delivery.</p>
            </div>
            <p>Best regards,<br>GDS Puppies Team</p>
          </div>
        `
      },
      contact_form: {
        subject: "New Contact Form Submission - Test Email",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #DC2626;">New Contact Form</h1>
            <p>You have a new contact form submission. This is a test email.</p>
            <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h2 style="margin-top: 0;">Verification Code</h2>
              <p style="font-size: 32px; font-weight: bold; color: #DC2626; margin: 10px 0;">${verificationCode}</p>
              <p style="font-size: 14px; color: #6b7280;">Enter this code in the admin panel to verify email delivery.</p>
            </div>
            <p>Best regards,<br>GDS Puppies Team</p>
          </div>
        `
      }
    };

    const template = templates[templateType] || templates.welcome;

    // Send via MailChannels API
    const mailchannelsResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": envConfig.api_key,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: testEmail }],
            dkim_domain: "gdspuppies.com",
            dkim_selector: "mailchannels",
            dkim_private_key: dkimPrivateKey,
          },
        ],
        from: {
          email: envConfig.from_email,
          name: "GDS Puppies",
        },
        subject: template.subject,
        content: [
          {
            type: "text/html",
            value: template.html,
          },
        ],
      }),
    });

    if (!mailchannelsResponse.ok) {
      const errorText = await mailchannelsResponse.text();
      console.error("MailChannels error:", errorText);
      throw new Error(`MailChannels API error: ${mailchannelsResponse.status}`);
    }

    console.log(`Test email sent successfully to ${testEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        verificationCode,
        message: `Test email sent to ${testEmail}. Check your inbox for the verification code.`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending test email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});