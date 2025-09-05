import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  template: 'welcome' | 'puppy-available' | 'payment-confirmation' | 'contact-form';
  to: string;
  data: Record<string, any>;
  subject?: string;
}

const generateEmailHTML = (template: string, data: Record<string, any>): string => {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
      .header { text-align: center; margin-bottom: 30px; }
      .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
      .content { line-height: 1.6; color: #374151; }
      .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
  `;

  switch (template) {
    case 'welcome':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GDS Puppies Deluxe</div>
            </div>
            <div class="content">
              <h1>Welcome, ${data.customerName}!</h1>
              <p>Thank you for joining GDS Puppies Deluxe. We're excited to help you find your perfect furry companion.</p>
              <p>Your account has been created successfully. You can now browse our available puppies and manage your profile.</p>
              ${data.loginUrl ? `<a href="${data.loginUrl}" class="button">Access Your Account</a>` : ''}
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 GDS Puppies Deluxe. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'puppy-available':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GDS Puppies Deluxe</div>
            </div>
            <div class="content">
              <h1>${data.puppyName} is Available!</h1>
              <p>Dear ${data.customerName},</p>
              <p>Great news! The ${data.puppyBreed} puppy you've been waiting for is now available.</p>
              ${data.puppyImage ? `<img src="${data.puppyImage}" alt="${data.puppyName}" style="max-width: 100%; border-radius: 8px; margin: 20px 0;">` : ''}
              <p><strong>Puppy:</strong> ${data.puppyName}<br>
              <strong>Breed:</strong> ${data.puppyBreed}<br>
              <strong>Price:</strong> $${data.puppyPrice}</p>
              ${data.puppyUrl ? `<a href="${data.puppyUrl}" class="button">View Puppy Details</a>` : ''}
              <p>Don't wait too long - our puppies find loving homes quickly!</p>
            </div>
            <div class="footer">
              <p>© 2024 GDS Puppies Deluxe. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'payment-confirmation':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GDS Puppies Deluxe</div>
            </div>
            <div class="content">
              <h1>Payment Confirmation</h1>
              <p>Dear ${data.customerName},</p>
              <p>Thank you for your payment! Your transaction has been processed successfully.</p>
              <p><strong>Puppy:</strong> ${data.puppyName}<br>
              <strong>Amount:</strong> $${data.amount}<br>
              <strong>Transaction ID:</strong> ${data.transactionId}</p>
              ${data.nextSteps && data.nextSteps.length > 0 ? `
                <h3>Next Steps:</h3>
                <ul>
                  ${data.nextSteps.map((step: string) => `<li>${step}</li>`).join('')}
                </ul>
              ` : ''}
              <p>We'll be in touch soon with more details about your new puppy!</p>
            </div>
            <div class="footer">
              <p>© 2024 GDS Puppies Deluxe. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case 'contact-form':
      return `
        <!DOCTYPE html>
        <html>
        <head>${baseStyles}</head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GDS Puppies Deluxe</div>
            </div>
            <div class="content">
              <h1>New Contact Form Submission</h1>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0;">
                ${data.message}
              </div>
              <p><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
            </div>
            <div class="footer">
              <p>© 2024 GDS Puppies Deluxe. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      throw new Error(`Unknown email template: ${template}`);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template, to, data, subject }: EmailRequest = await req.json();

    if (!template || !to) {
      throw new Error("Template and recipient are required");
    }

    const apiKey = Deno.env.get("MAILCHANNELS_API_KEY");
    if (!apiKey) {
      throw new Error("MAILCHANNELS_API_KEY not configured");
    }

    let emailSubject = subject;
    if (!emailSubject) {
      switch (template) {
        case 'welcome':
          emailSubject = `Welcome to GDS Puppies Deluxe, ${data.customerName}!`;
          break;
        case 'puppy-available':
          emailSubject = `${data.puppyName} is now available!`;
          break;
        case 'payment-confirmation':
          emailSubject = `Payment Confirmation - ${data.puppyName}`;
          break;
        case 'contact-form':
          emailSubject = `New Contact Form: ${data.subject}`;
          break;
      }
    }

    const htmlContent = generateEmailHTML(template, data);

    const mailChannelsPayload = {
      personalizations: [{
        to: [{ email: to }],
        dkim_domain: Deno.env.get("DKIM_DOMAIN"),
        dkim_selector: "mailchannels",
        dkim_private_key: Deno.env.get("DKIM_PRIVATE_KEY"),
      }],
      from: {
        email: "noreply@gdspuppiesdeluxe.com",
        name: "GDS Puppies Deluxe",
      },
      reply_to: {
        email: "support@gdspuppiesdeluxe.com",
        name: "GDS Puppies Support",
      },
      subject: emailSubject,
      content: [{
        type: "text/html",
        value: htmlContent,
      }],
    };

    const response = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(mailChannelsPayload),
    });

    if (response.status === 202) {
      console.log("Email sent successfully:", { template, to, subject: emailSubject });
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email sent successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      const errorText = await response.text();
      throw new Error(`MailChannels API error: ${response.status} - ${errorText}`);
    }
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);