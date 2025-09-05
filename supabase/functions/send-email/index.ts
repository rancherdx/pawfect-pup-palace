import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { WelcomeEmail } from "./_templates/welcome.tsx";
import { PuppyAvailableEmail } from "./_templates/puppy-available.tsx";
import { PaymentConfirmationEmail } from "./_templates/payment-confirmation.tsx";
import { ContactFormEmail } from "./_templates/contact-form.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  template: 'welcome' | 'puppy-available' | 'payment-confirmation' | 'contact-form';
  to: string | string[];
  data: Record<string, any>;
  from?: string;
  subject?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template, to, data, from, subject }: EmailRequest = await req.json();

    if (!template || !to) {
      throw new Error("Template and recipient are required");
    }

    let emailComponent: React.ReactElement;
    let emailSubject = subject;
    let emailFrom = from || "Pawfect Pup Palace <noreply@pawfect-pup-palace.com>";

    // Select the appropriate email template
    switch (template) {
      case 'welcome':
        emailComponent = React.createElement(WelcomeEmail, {
          customerName: data.customerName || 'Valued Customer',
          loginUrl: data.loginUrl || '',
        });
        emailSubject = emailSubject || `Welcome to Pawfect Pup Palace, ${data.customerName}!`;
        break;

      case 'puppy-available':
        emailComponent = React.createElement(PuppyAvailableEmail, {
          customerName: data.customerName || 'Dog Lover',
          puppyName: data.puppyName || 'Adorable Puppy',
          puppyBreed: data.puppyBreed || '',
          puppyPrice: data.puppyPrice || 0,
          puppyImage: data.puppyImage || '',
          puppyUrl: data.puppyUrl || '',
        });
        emailSubject = emailSubject || `${data.puppyName} is now available!`;
        break;

      case 'payment-confirmation':
        emailComponent = React.createElement(PaymentConfirmationEmail, {
          customerName: data.customerName || 'Valued Customer',
          puppyName: data.puppyName || 'Your Puppy',
          amount: data.amount || 0,
          transactionId: data.transactionId || '',
          nextSteps: data.nextSteps || [],
        });
        emailSubject = emailSubject || `Payment Confirmation - ${data.puppyName}`;
        break;

      case 'contact-form':
        emailComponent = React.createElement(ContactFormEmail, {
          name: data.name || '',
          email: data.email || '',
          subject: data.subject || '',
          message: data.message || '',
          submittedAt: data.submittedAt || new Date().toISOString(),
        });
        emailSubject = emailSubject || `New Contact Form: ${data.subject}`;
        emailFrom = "Contact Form <contact@pawfect-pup-palace.com>";
        break;

      default:
        throw new Error(`Unknown email template: ${template}`);
    }

    // Render the React email template to HTML
    const html = await renderAsync(emailComponent);

    // Send the email using Resend
    const emailResponse = await resend.emails.send({
      from: emailFrom,
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject,
      html,
    });

    if (emailResponse.error) {
      throw new Error(emailResponse.error.message);
    }

    console.log("Email sent successfully:", {
      template,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: emailSubject,
      id: emailResponse.data?.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        id: emailResponse.data?.id,
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-email function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);