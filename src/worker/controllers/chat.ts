import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';
import { D1Database } from '@cloudflare/workers-types';

interface AuthResult {
    userId: string;
    roles: string[];
}

// Helper to get D1 binding
const getDB = (env: Env): D1Database => env.DB;

export async function getMyConversations(request: Request, env: Env, authResult: AuthResult) {
    const { userId } = authResult;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    try {
        const db = getDB(env);
        const stmt = db.prepare(`
            SELECT id, user_id, title, related_entity_id, related_entity_type, last_message_preview, last_message_at, is_archived, created_at, updated_at
            FROM conversations
            WHERE user_id = ?
            ORDER BY last_message_at DESC
            LIMIT ? OFFSET ?
        `).bind(userId, limit, offset);
        const { results } = await stmt.all();

        const countStmt = db.prepare(`SELECT COUNT(*) as total FROM conversations WHERE user_id = ?`).bind(userId);
        const { results: countResult } = await countStmt.all();
        const totalConversations = countResult[0]?.total || 0;

        return new Response(JSON.stringify({
            data: results,
            page,
            limit,
            totalPages: Math.ceil(totalConversations / limit),
            totalConversations,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch conversations', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
}

export async function getMessagesForConversation(request: Request, env: Env, authResult: AuthResult, conversationId: string) {
    const { userId } = authResult;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    try {
        const db = getDB(env);
        // First, verify user is part of the conversation
        const convCheckStmt = db.prepare(`SELECT id FROM conversations WHERE id = ? AND user_id = ?`).bind(conversationId, userId);
        const convCheck = await convCheckStmt.first();

        if (!convCheck) {
            // Allow admins to fetch any conversation's messages
            if (!authResult.roles || !authResult.roles.includes('admin')) {
                 return new Response(JSON.stringify({ error: 'Forbidden. You are not part of this conversation.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
        }

        const stmt = db.prepare(`
            SELECT id, conversation_id, sender_id, sender_type, content, attachments, sent_at, read_at
            FROM messages
            WHERE conversation_id = ?
            ORDER BY sent_at ASC
            LIMIT ? OFFSET ?
        `).bind(conversationId, limit, offset);
        const { results } = await stmt.all();

        const countStmt = db.prepare(`SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?`).bind(conversationId);
        const { results: countResult } = await countStmt.all();
        const totalMessages = countResult[0]?.total || 0;

        return new Response(JSON.stringify({
            data: results,
            page,
            limit,
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch messages', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
}

export async function sendMessage(request: Request, env: Env, authResult: AuthResult, conversationId: string) {
    const { userId } = authResult;
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const { content, attachments } = body as { content?: string, attachments?: string };

    if (!content || typeof content !== 'string' || content.trim() === '') {
        return new Response(JSON.stringify({ error: 'Message content is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (attachments && typeof attachments !== 'string') {
        return new Response(JSON.stringify({ error: 'Attachments must be a JSON string' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    try {
        const db = getDB(env);
        // Verify user is part of the conversation
        const convCheckStmt = db.prepare(`SELECT id FROM conversations WHERE id = ? AND user_id = ?`).bind(conversationId, userId);
        const convCheck = await convCheckStmt.first();

        if (!convCheck) {
             // Allow admins to send messages to any conversation (as admin sender_type)
            if (!authResult.roles || !authResult.roles.includes('admin')) {
                return new Response(JSON.stringify({ error: 'Forbidden. You are not part of this conversation.' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }
        }

        const messageId = crypto.randomUUID();
        const senderType = authResult.roles && authResult.roles.includes('admin') ? 'admin' : 'user'; // if admin sends, sender_type is admin
        const currentTimestamp = new Date().toISOString();
        const lastMessagePreview = content.substring(0, 50);

        const batchOperations: D1PreparedStatement[] = [];

        batchOperations.push(
            db.prepare(`
                INSERT INTO messages (id, conversation_id, sender_id, sender_type, content, attachments, sent_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(messageId, conversationId, userId, senderType, content, attachments || null, currentTimestamp)
        );

        batchOperations.push(
            db.prepare(`
                UPDATE conversations
                SET last_message_preview = ?, last_message_at = ?, updated_at = ?
                WHERE id = ?
            `).bind(lastMessagePreview, currentTimestamp, currentTimestamp, conversationId)
        );

        await db.batch(batchOperations);

        const newMessageStmt = db.prepare(`SELECT * FROM messages WHERE id = ?`).bind(messageId);
        const newMessage = await newMessageStmt.first();

        return new Response(JSON.stringify(newMessage), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error sending message:', error);
        return new Response(JSON.stringify({ error: 'Failed to send message', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
}

export async function startConversation(request: Request, env: Env, authResult: AuthResult) {
    const { userId } = authResult;
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    const { title, first_message_content, related_entity_id, related_entity_type } = body as { title?: string, first_message_content?: string, related_entity_id?: string, related_entity_type?: string };

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return new Response(JSON.stringify({ error: 'Conversation title is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!first_message_content || typeof first_message_content !== 'string' || first_message_content.trim() === '') {
        return new Response(JSON.stringify({ error: 'Initial message content is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (related_entity_id && typeof related_entity_id !== 'string') {
        return new Response(JSON.stringify({ error: 'related_entity_id must be a string' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (related_entity_type && typeof related_entity_type !== 'string') {
        return new Response(JSON.stringify({ error: 'related_entity_type must be a string' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }


    try {
        const db = getDB(env);
        const conversationId = crypto.randomUUID();
        const messageId = crypto.randomUUID();
        const currentTimestamp = new Date().toISOString();
        const lastMessagePreview = first_message_content.substring(0, 50);

        const batchOperations: D1PreparedStatement[] = [];

        batchOperations.push(
            db.prepare(`
                INSERT INTO conversations (id, user_id, title, related_entity_id, related_entity_type, last_message_preview, last_message_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(conversationId, userId, title, related_entity_id || null, related_entity_type || null, lastMessagePreview, currentTimestamp, currentTimestamp, currentTimestamp)
        );

        batchOperations.push(
            db.prepare(`
                INSERT INTO messages (id, conversation_id, sender_id, sender_type, content, sent_at)
                VALUES (?, ?, ?, 'user', ?, ?)
            `).bind(messageId, conversationId, userId, first_message_content, currentTimestamp)
        );

        await db.batch(batchOperations);

        const newConversationStmt = db.prepare(`SELECT * FROM conversations WHERE id = ?`).bind(conversationId);
        const newConversation = await newConversationStmt.first();

        const firstMessageStmt = db.prepare(`SELECT * FROM messages WHERE id = ?`).bind(messageId);
        const firstMessage = await firstMessageStmt.first();

        return new Response(JSON.stringify({ conversation: newConversation, message: firstMessage }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Error starting conversation:', error);
        // Check for unique constraint violation for related_entity_id and related_entity_type if needed.
        // For now, generic error.
        return new Response(JSON.stringify({ error: 'Failed to start conversation', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
}
