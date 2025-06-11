import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';
import { sendTemplatedEmail } from '../utils/emailService'; // For sending replies
import { randomUUID } from 'crypto';

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | string[] | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Assumed types (should ideally be shared in a types file)
interface EmailConversation {
  id: string;
  user_id: string | null;
  contact_email: string;
  last_message_at: number;
  subject: string;
  status: string;
  assigned_to_admin_id: string | null;
  // Joined fields (conceptual for getConversations)
  last_message_snippet?: string;
  unread_count?: number;
}

interface EmailMessage {
  id: string;
  conversation_id: string;
  user_id: string | null;
  contact_email: string;
  direction: 'inbound' | 'outbound';
  subject: string;
  body_html: string;
  body_text: string | null;
  status: string;
  message_provider_id: string | null;
  received_at: number | null; // Unix timestamp - for inbound
  sent_at: number | null; // Unix timestamp - for outbound
  created_at: number; // Unix timestamp
}

interface AdminAuthResult { // Assuming admin middleware provides this
    userId: string; // Admin's user ID
    roles: string[];
}


/**
 * Fetches a paginated list of email conversations for the admin inbox.
 */
export async function getConversations(request: Request, env: Env, authResult: AdminAuthResult): Promise<Response> {
  // Router ensures admin access
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '15', 10);
  const statusFilter = url.searchParams.get('status'); // e.g., 'open', 'closed'
  const offset = (page - 1) * limit;

  try {
    const db = env.PUPPIES_DB;
    let query = `
      SELECT
        ec.id, ec.user_id, ec.contact_email, ec.last_message_at, ec.subject, ec.status, ec.assigned_to_admin_id,
        (SELECT body_html FROM email_messages em WHERE em.conversation_id = ec.id ORDER BY em.created_at DESC LIMIT 1) as last_message_snippet,
        (SELECT COUNT(*) FROM email_messages em WHERE em.conversation_id = ec.id AND em.direction = 'inbound' AND em.status = 'unread') as unread_count
      FROM email_conversations ec
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (statusFilter) {
      conditions.push("ec.status = ?");
      params.push(statusFilter);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += " ORDER BY ec.last_message_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const conversationsQuery = db.prepare(query).bind(...params);
    const { results: conversations } = await conversationsQuery.all<EmailConversation>();

    // Clean up snippet (truncate, remove HTML)
    conversations.forEach(c => {
        if (c.last_message_snippet) {
            c.last_message_snippet = c.last_message_snippet.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...';
        }
    });

    // Count total for pagination
    let countQueryStr = "SELECT COUNT(*) as total_conversations FROM email_conversations";
    const countParams: any[] = [];
    if (statusFilter) {
        countQueryStr += " WHERE status = ?";
        countParams.push(statusFilter);
    }
    const countResult = await db.prepare(countQueryStr).bind(...countParams).first<{total_conversations: number}>();
    const totalItems = countResult?.total_conversations || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return new Response(JSON.stringify({
      data: conversations || [],
      pagination: { currentPage: page, totalPages, totalItems, limit }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return createErrorResponse('Failed to fetch conversations.', error.message, 500);
  }
}

/**
 * Fetches all messages within a specific conversation.
 */
export async function getConversationMessages(request: Request, env: Env, authResult: AdminAuthResult, conversationId: string): Promise<Response> {
  // Router ensures admin access and provides conversationId from path param
  if (!conversationId) {
    return createErrorResponse('Missing conversationId parameter.', null, 400);
  }

  try {
    const db = env.PUPPIES_DB;
    // Optional: Check if conversation exists or if admin has access if more granular control is needed
    // const conversationExists = await db.prepare("SELECT id FROM email_conversations WHERE id = ?").bind(conversationId).first();
    // if (!conversationExists) {
    //   return createErrorResponse('Conversation not found.', null, 404);
    // }

    const messagesQuery = db.prepare(
      "SELECT * FROM email_messages WHERE conversation_id = ? ORDER BY created_at ASC"
    ).bind(conversationId);
    const { results: messages } = await messagesQuery.all<EmailMessage>();

    // Mark messages as read (if they were unread and inbound)
    // This should ideally be more robust, e.g., only mark messages older than the last one read by this admin, or specific messages.
    // For simplicity, marking all inbound messages in this conversation as read by this action.
    await db.prepare(
        "UPDATE email_messages SET status = 'read' WHERE conversation_id = ? AND direction = 'inbound' AND status = 'unread'"
    ).bind(conversationId).run();

    return new Response(JSON.stringify({ data: messages || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error fetching messages for conversation ${conversationId}:`, error);
    return createErrorResponse('Failed to fetch conversation messages.', error.message, 500);
  }
}

interface ReplyRequestBody {
  body_html: string;
  body_text?: string; // Optional plain text version
}

/**
 * Sends a reply to an email conversation.
 */
export async function replyToConversation(request: Request, env: Env, authResult: AdminAuthResult, conversationId: string): Promise<Response> {
  // Router ensures admin access and provides conversationId
  const adminUserId = authResult.userId;

  if (!conversationId) {
    return createErrorResponse('Missing conversationId parameter.', null, 400);
  }

  let body: ReplyRequestBody;
  try {
    body = await request.json();
  } catch (e: any) {
    return createErrorResponse('Invalid JSON request body.', e.message, 400);
  }

  if (!body.body_html || typeof body.body_html !== 'string' || body.body_html.trim() === '') {
    return createErrorResponse('Reply body_html is required and cannot be empty.', null, 400);
  }

  try {
    const db = env.PUPPIES_DB;
    const conversation = await db.prepare(
      "SELECT contact_email, subject, user_id FROM email_conversations WHERE id = ?"
    ).bind(conversationId).first<EmailConversation>();

    if (!conversation) {
      return createErrorResponse('Conversation not found.', null, 404);
    }
    if (!conversation.contact_email) {
        return createErrorResponse('Contact email not found for this conversation.', null, 500);
    }

    const replySubject = conversation.subject?.toLowerCase().startsWith("re:")
      ? conversation.subject
      : `Re: ${conversation.subject || 'Previous Conversation'}`;

    // The sendTemplatedEmail function (modified in previous step) will handle logging this outbound email.
    // We pass the conversationId so it's part of the same thread.
    const emailResult = await sendTemplatedEmail(
      env,
      conversation.contact_email,
      replySubject, // Using subject directly
      body.body_html, // Using HTML body directly
      {
        userId: conversation.user_id, // Associate with the original user of the conversation if known
        conversationId: conversationId,
        textBody: body.body_text,
        isTemplate: false, // We are sending a direct body, not using a DB template
      }
    );

    if (!emailResult.success) {
      return createErrorResponse('Failed to send reply.', emailResult.message, 500);
    }
    if (emailResult.dbLogResult?.error) {
        console.warn(`Reply sent for convo ${conversationId}, but DB logging failed: ${emailResult.dbLogResult.error}`);
        // Proceed to return success to client as email was sent, but log issue.
    }

    // No need to explicitly update conversation's last_message_at here,
    // as the modified sendTemplatedEmail should have handled that via its upsert.

    return new Response(JSON.stringify({
        success: true,
        message: 'Reply sent successfully.',
        emailMessageId: emailResult.dbLogResult?.emailMessageId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error sending reply to conversation ${conversationId}:`, error);
    return createErrorResponse('Failed to send reply.', error.message, 500);
  }
}
