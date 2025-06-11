import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';
import { randomUUID } from 'crypto';

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | string[] | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface AdminAuthResult { userId: string; roles: string[]; }
interface UserAuthResult { userId: string; /* ... other fields if needed */ }


// --- Chat Message Storage Utility (called by WebSocket handlers or HTTP endpoints) ---
export interface ChatMessageData {
  id?: string; // Optional: provide if already generated
  conversation_id: string;
  sender_id: string;
  sender_type: 'visitor' | 'user' | 'admin' | 'system';
  message_text: string;
  timestamp?: number; // Optional: defaults to now
  is_read_by_admin?: boolean; // Defaults based on sender_type
  // receiver_id can be added if direct admin-to-admin messaging is needed within a convo context
}

export async function saveChatMessage(env: Env, msgData: ChatMessageData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const db = env.PUPPIES_DB;
  const messageId = msgData.id || randomUUID();
  const timestamp = msgData.timestamp || Math.floor(Date.now() / 1000);
  // If admin sends, it's implicitly "read" by admin context. If visitor/user, it's initially unread by admin.
  const isReadByAdmin = msgData.sender_type === 'admin' ? true : (msgData.is_read_by_admin || false);

  try {
    // 1. Insert the chat message
    await db.prepare(
      `INSERT INTO chat_messages (id, conversation_id, sender_id, sender_type, message_text, timestamp, is_read_by_admin, is_read_by_visitor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      messageId,
      msgData.conversation_id,
      msgData.sender_id,
      msgData.sender_type,
      msgData.message_text,
      timestamp,
      isReadByAdmin,
      msgData.sender_type !== 'admin' ? true : false // Visitor/user messages are "read" by them as they sent it
    ).run();

    // 2. Update or Create chat_session: last_message_at, status
    // Assuming conversation_id is the session_id and also the visitor_id for anonymous chats
    // This needs more context if user_id is also involved for logged-in user chats.
    // For now, using conversation_id as the key for chat_sessions.
    const sessionUpsertStmt = db.prepare(
      `INSERT INTO chat_sessions (id, visitor_id, last_message_at, status, created_at, visitor_page_url)
       VALUES (?, ?, ?, 'active', ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         last_message_at = excluded.last_message_at,
         status = CASE WHEN status = 'closed_by_visitor' OR status = 'closed_by_admin' THEN 'active' ELSE 'active' END`
         // If an admin or visitor sends a message to a closed chat, it re-opens it.
    ).bind(
        msgData.conversation_id, // session id
        (msgData.sender_type === 'visitor' || msgData.sender_type === 'user') ? msgData.sender_id : msgData.conversation_id, // visitor_id (assuming convo_id is visitor_id for visitor initiated)
        timestamp,
        timestamp, // created_at for new sessions
        null // TODO: visitor_page_url - needs to be passed into saveChatMessage if available
    );
    await sessionUpsertStmt.run();

    console.log(`Chat message ${messageId} saved to DB for conversation ${msgData.conversation_id}.`);
    return { success: true, messageId };

  } catch (error: any) {
    console.error(`Error saving chat message for conversation ${msgData.conversation_id}:`, error);
    return { success: false, error: error.message };
  }
}


// --- HTTP API Endpoint Handlers ---

/**
 * GET /api/admin/chat/sessions
 * Fetches a list of active or recent chat sessions for admins.
 */
export async function getChatSessions(request: Request, env: Env, authResult: AdminAuthResult): Promise<Response> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const statusFilter = url.searchParams.get('status'); // e.g., 'active', 'pending', 'closed'
  const offset = (page - 1) * limit;

  try {
    const db = env.PUPPIES_DB;
    let query = `
      SELECT cs.id, cs.visitor_id, cs.user_id, cs.admin_id, cs.status, cs.last_message_at, cs.visitor_page_url,
             u.name as user_name, u.email as user_email, admin.name as admin_name,
             (SELECT cm.message_text FROM chat_messages cm WHERE cm.conversation_id = cs.id ORDER BY cm.timestamp DESC LIMIT 1) as last_message_snippet,
             (SELECT COUNT(*) FROM chat_messages cm WHERE cm.conversation_id = cs.id AND cm.sender_type != 'admin' AND cm.is_read_by_admin = 0) as unread_admin_count
      FROM chat_sessions cs
      LEFT JOIN users u ON cs.user_id = u.id
      LEFT JOIN users admin ON cs.admin_id = admin.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (statusFilter) {
      conditions.push("cs.status = ?");
      params.push(statusFilter);
    }
    // Add more filters if needed (e.g., assigned_to_me)

    if (conditions.length > 0) query += ` WHERE ${conditions.join(' AND ')}`;
    query += " ORDER BY cs.last_message_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const { results: sessions } = await db.prepare(query).bind(...params).all();

    let countQueryStr = "SELECT COUNT(*) as total_sessions FROM chat_sessions";
    const countParams: any[] = [];
    if (statusFilter) {
        countQueryStr += " WHERE status = ?";
        countParams.push(statusFilter);
    }
    const countResult = await db.prepare(countQueryStr).bind(...countParams).first<{total_sessions: number}>();
    const totalItems = countResult?.total_sessions || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return new Response(JSON.stringify({
      data: sessions || [],
      pagination: { currentPage: page, totalPages, totalItems, limit }
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

  } catch (error: any) {
    console.error('Error fetching chat sessions:', error);
    return createErrorResponse('Failed to fetch chat sessions.', error.message, 500);
  }
}


/**
 * GET /api/admin/chat/sessions/:conversationId/history
 * Fetches message history for a specific chat session.
 */
export async function getChatSessionHistory(request: Request, env: Env, authResult: AdminAuthResult, conversationId: string): Promise<Response> {
  if (!conversationId) {
    return createErrorResponse('Missing conversationId parameter.', null, 400);
  }
  try {
    const db = env.PUPPIES_DB;
    const messagesQuery = db.prepare(
      "SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY timestamp ASC"
    ).bind(conversationId);
    const { results: messages } = await messagesQuery.all();

    // Mark messages as read by admin
    await db.prepare(
      "UPDATE chat_messages SET is_read_by_admin = 1 WHERE conversation_id = ? AND sender_type != 'admin' AND is_read_by_admin = 0"
    ).bind(conversationId).run();

    // Also update unread count on parent admin WebSocket notification (or trigger client to refetch list)
    // This might be better handled by the WebSocket message that confirms an admin joined/read.
    // For now, the client will refetch conversation list which will update unread count.

    return new Response(JSON.stringify({ data: messages || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`Error fetching history for chat session ${conversationId}:`, error);
    return createErrorResponse('Failed to fetch chat history.', error.message, 500);
  }
}


/**
 * POST /api/admin/chat/sessions/:conversationId/claim
 * Allows an admin to "claim" or "join" a chat session.
 */
export async function claimChatSession(request: Request, env: Env, authResult: AdminAuthResult, conversationId: string): Promise<Response> {
  const adminUserId = authResult.userId;
  if (!conversationId) {
    return createErrorResponse('Missing conversationId parameter.', null, 400);
  }

  try {
    const db = env.PUPPIES_DB;
    const now = Math.floor(Date.now() / 1000);

    // Check if session exists
    const session = await db.prepare("SELECT id, admin_id, visitor_id FROM chat_sessions WHERE id = ?").bind(conversationId).first<{id: string, admin_id: string | null, visitor_id: string}>();
    if (!session) {
      return createErrorResponse('Chat session not found.', null, 404);
    }
    if (session.admin_id && session.admin_id !== adminUserId) {
      return createErrorResponse('Chat session already claimed by another admin.', null, 409); // Conflict
    }

    await db.prepare(
      "UPDATE chat_sessions SET admin_id = ?, status = 'active', last_message_at = ? WHERE id = ?"
    ).bind(adminUserId, now, conversationId).run();

    // Create a system message in the chat
    const systemMessageText = `Admin ${adminUserId.substring(0,8)}... has joined the chat.`;
    await saveChatMessage(env, {
        conversation_id: conversationId,
        sender_id: 'system', // Or adminUserId
        sender_type: 'system',
        message_text: systemMessageText,
    });

    // Notify visitor that admin joined via WebSocket (if `sendToVisitor` is available in env)
    if (env.sendToVisitor && session.visitor_id) {
        env.sendToVisitor(session.visitor_id, {
            type: 'admin_joined_chat',
            payload: { conversation_id: conversationId, admin_id: adminUserId, message: systemMessageText }
        });
    }

    // Notify other admins (optional, could be a new type of notification)
    if (env.broadcastAdminNotification) {
        env.broadcastAdminNotification({
            type: 'chat_claimed',
            payload: { conversation_id: conversationId, admin_id: adminUserId }
        }, /* exclude current admin's WS? */ );
    }


    return new Response(JSON.stringify({ success: true, message: 'Chat session claimed.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`Error claiming chat session ${conversationId} by admin ${adminUserId}:`, error);
    return createErrorResponse('Failed to claim chat session.', error.message, 500);
  }
}


/**
 * POST /api/chat/initiate (Public)
 * Initiates a chat session or sends the first message.
 */
interface InitiateChatBody {
    visitor_id: string;
    initial_message_text: string;
    page_url: string; // Current page URL of the visitor
    user_id?: string; // Optional, if visitor is a logged-in user
}
export async function initiateChatSession(request: Request, env: Env): Promise<Response> {
  let body: InitiateChatBody;
  try {
    body = await request.json();
  } catch (e:any) {
    return createErrorResponse('Invalid JSON request body.', e.message, 400);
  }

  const { visitor_id, initial_message_text, page_url, user_id } = body;

  if (!visitor_id || !initial_message_text || !page_url) {
    return createErrorResponse('Missing required fields: visitor_id, initial_message_text, page_url.', null, 400);
  }

  const conversationId = visitor_id; // For anonymous chats, visitor_id is the conversation_id
  const now = Math.floor(Date.now() / 1000);

  try {
    const db = env.PUPPIES_DB;

    // Upsert chat session (create if not exists, or update if it does)
    // Note: We set user_id here if provided by a logged-in user initiating chat.
    await db.prepare(
      `INSERT INTO chat_sessions (id, visitor_id, user_id, status, created_at, last_message_at, visitor_page_url)
       VALUES (?, ?, ?, 'pending', ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         last_message_at = excluded.last_message_at,
         status = CASE WHEN status = 'closed_by_visitor' OR status = 'closed_by_admin' THEN 'pending' ELSE 'pending' END,
         user_id = COALESCE(excluded.user_id, chat_sessions.user_id), -- Keep existing user_id if new one is null
         visitor_page_url = excluded.visitor_page_url`
    ).bind(conversationId, visitor_id, user_id || null, now, now, page_url).run();

    // Save the initial message
    const messageSaveResult = await saveChatMessage(env, {
      conversation_id: conversationId,
      sender_id: user_id || visitor_id, // If logged-in user, use their user_id as sender
      sender_type: user_id ? 'user' : 'visitor',
      message_text: initial_message_text,
      timestamp: now,
      is_read_by_admin: false,
    });

    if (!messageSaveResult.success) {
        throw new Error(messageSaveResult.error || "Failed to save initial chat message.");
    }

    // Notify admins of new chat session/message via WebSocket
    if (env.broadcastAdminNotification) {
        env.broadcastAdminNotification({
            type: 'new_chat_session', // Or 'new_chat_message' if session might exist
            payload: {
                conversation_id: conversationId,
                visitor_id: visitor_id,
                user_id: user_id,
                initial_message_text: initial_message_text,
                page_url: page_url,
                timestamp: now,
            }
        });
    }

    return new Response(JSON.stringify({
        success: true,
        message: 'Chat initiated successfully.',
        conversation_id: conversationId,
        message_id: messageSaveResult.messageId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error initiating chat for visitor ${visitor_id}:`, error);
    return createErrorResponse('Failed to initiate chat.', error.message, 500);
  }
}
