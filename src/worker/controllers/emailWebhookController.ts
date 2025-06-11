import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';
import { randomUUID } from 'crypto'; // For generating IDs

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | string[] | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface InboundEmailPayload {
  // Common fields, actual structure depends on the email provider (e.g., SendGrid, Mailgun)
  from: string; // Full from address, e.g., "Sender Name <sender@example.com>"
  to: string;   // Full to address, e.g., "Recipient <recipient@yourdomain.com>"
  subject: string;
  html: string; // HTML body
  text?: string; // Plain text body
  messageId?: string; // Provider's unique ID for the message
  // Attachments might also be part of the payload, handling them is more complex.
  // headers?: Record<string, string>; // Raw email headers
}

// Extracts email address from "Name <email@example.com>" format
function extractEmailAddress(fullEmail: string): string {
  const match = fullEmail.match(/<([^>]+)>/);
  return match ? match[1] : fullEmail;
}


export async function handleInboundEmailWebhook(request: Request, env: Env): Promise<Response> {
  console.log('Inbound email webhook received.');

  // TODO: Implement Webhook Security Verification
  // This is crucial and depends on the email provider.
  // Examples:
  // 1. SendGrid: Verify signature using `request.headers.get('X-Twilio-Email-Event-Webhook-Signature')` and timestamp.
  // 2. Generic Secret: Check for a secret in the URL `const secret = url.searchParams.get('secret'); if (secret !== env.EMAIL_WEBHOOK_SECRET) return createErrorResponse('Unauthorized', null, 403);`
  // For now, proceeding without specific security for demonstration.
  // if (!isSignatureValid(request, env)) {
  //   return createErrorResponse('Webhook signature validation failed', null, 403);
  // }

  let payload: InboundEmailPayload;
  try {
    // Providers might send data as JSON, multipart/form-data, or other formats.
    // Adjust parsing based on your provider's webhook format.
    // Assuming JSON for this example.
    payload = await request.json();
  } catch (e: any) {
    console.error('Failed to parse inbound email payload:', e.message);
    return createErrorResponse('Invalid webhook payload format.', e.message, 400);
  }

  const {
    from,
    to: recipientOnOurDomain, // E.g. support@yourdomain.com
    subject,
    html: body_html,
    text: body_text,
    messageId: providerMessageId
  } = payload;

  if (!from || !recipientOnOurDomain || !subject || !body_html) {
    return createErrorResponse('Missing required email fields in payload (from, to, subject, html).', null, 400);
  }

  const contactEmail = extractEmailAddress(from);
  const ourEmailAddress = extractEmailAddress(recipientOnOurDomain); // The address that received the email

  try {
    const db = env.PUPPIES_DB;
    const now = Math.floor(Date.now() / 1000);
    const newEmailMessageId = randomUUID();

    // TODO: Conversation ID detection logic:
    // 1. Check subject for a pattern like "[Convo-UUID]"
    // 2. Check for In-Reply-To or References headers (if available in payload.headers) to find existing conversation.
    // 3. Fallback: Create a new conversation ID.
    // For now, always creating a new conversation ID for simplicity.
    const conversationId = randomUUID();

    // Attempt to find an existing user by the contact's email
    let userId: string | null = null;
    const userLookup = await db.prepare("SELECT id FROM users WHERE email = ?").bind(contactEmail).first<{id: string}>();
    if (userLookup) {
      userId = userLookup.id;
    }

    // Log the inbound email message
    const emailMessageStmt = db.prepare(
      `INSERT INTO email_messages (id, conversation_id, user_id, contact_email, direction, subject, body_html, body_text, status, message_provider_id, received_at, created_at)
       VALUES (?, ?, ?, ?, 'inbound', ?, ?, ?, 'unread', ?, ?, ?)`
    ).bind(
      newEmailMessageId,
      conversationId,
      userId, // Can be null if sender is not a registered user
      contactEmail,
      subject,
      body_html,
      body_text || null, // Store text body if available
      providerMessageId || null, // Store provider's message ID
      now, // received_at (approximated by webhook processing time)
      now  // created_at
    );

    // Upsert conversation (create if new, or update last_message_at if existing - current simple logic always creates new)
    const conversationUpsertStmt = db.prepare(
      `INSERT INTO email_conversations (id, user_id, contact_email, last_message_at, subject, status)
       VALUES (?, ?, ?, ?, ?, 'open')
       ON CONFLICT(id) DO UPDATE SET
         last_message_at = excluded.last_message_at,
         status = CASE WHEN status = 'closed' THEN 'open' ELSE status END` // Re-open if it was closed
    ).bind(
      conversationId,
      userId,
      contactEmail,
      now,
      subject, // Use subject of this first inbound message for new conversation
    );

    await db.batch([emailMessageStmt, conversationUpsertStmt]);

    console.log(`Inbound email from ${contactEmail} logged to DB. Message ID: ${newEmailMessageId}, Conversation ID: ${conversationId}`);

    // Respond 200 OK to acknowledge receipt to the email provider
    return new Response(JSON.stringify({ success: true, message: 'Email received and processed.' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error processing inbound email:', error);
    // Do not return detailed errors to the webhook sender unless necessary for debugging specific provider issues.
    // Generic error for the provider, log details internally.
    return createErrorResponse('Failed to process inbound email internally.', null, 500);
  }
}
