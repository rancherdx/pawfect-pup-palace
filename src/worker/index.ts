import { Router, IRequest } from 'itty-router';
import { corsHeaders } from './utils/cors';
import type { Env } from './env';

// Auth middleware
import { verifyJwtAuth, adminAuthMiddleware } from './auth';

// Controller Functions
// Public User/Auth Controllers
import { login, register, logout } from './controllers/users';
import { requestDataDeletion } from './controllers/privacyController';

// Protected User Controllers
import { getCurrentUser, updateUserProfile } from './controllers/users';
import { getMyPuppies, getPuppyHealthRecords, addPuppyHealthRecord } from './controllers/puppies';
import { getMyConversations, getMessagesForConversation, sendMessage, startConversation } from './controllers/chat';

// Public Resource Controllers
import { getAllPuppies, getPuppyById } from './controllers/puppies';
import { getAllLitters, getLitterById, createLitter, updateLitter, deleteLitter } from './controllers/litters';
import { getSiteSettings as getPublicSiteSettings, getSiteSettings as getAllSiteSettings, updateSiteSettings as updateSiteSetting } from './controllers/settings';

// Admin Controllers
import { listUsers, getUserByIdAdmin, updateUserAdmin, deleteUserAdmin } from './controllers/users';
import { createPuppy, updatePuppy, deletePuppy } from './controllers/puppies';
// Payment Controller (NEW)
import { processPayment, handleSquareWebhook, captureAuthorizedPayment, refundPaymentHandler } from './controllers/payment';
// Puppy Credits Controller (NEW)
import { getUserPuppyCreditBalance, getPuppyCreditHistory, issuePuppyCredits } from './controllers/puppyCredits';
// Email & Unified Inbox Controllers (NEW)
import { handleInboundEmailWebhook } from './controllers/emailWebhookController';
import { getConversations, getConversationMessages, replyToConversation } from './controllers/unifiedInboxController';
// Site Tracking Controller (NEW)
import { trackVisitHandler } from './controllers/trackingController';
// Chat Controller (NEW)
import {
    saveChatMessage, // Utility, might be used by WebSocket handlers directly
    getChatSessions,
    getChatSessionHistory,
    claimChatSession,
    initiateChatSession
} from './controllers/chatController';
import { listEmailTemplates, getEmailTemplateById, updateEmailTemplate as createEmailTemplate, updateEmailTemplate, updateEmailTemplate as deleteEmailTemplate } from './controllers/emailTemplates';
import { listIntegrations, updateIntegration } from './controllers/integrations';
import { listDataDeletionRequests, getDataDeletionRequestById, updateDataDeletionRequestStatus } from './controllers/adminPrivacyController';

// NEW: Admin Test and System Status Controllers
import { createAdminTestSession, createImpersonationSession, getTestSessionLogs } from './controllers/adminTestController';
import { getSystemStatus, getSystemUptime } from './controllers/systemStatusController';

// Create a new router instance
const router = Router();

// Global Set for Admin WebSocket connections (Simple in-memory store)
// TODO: For durable/scalable WebSocket connections, use Cloudflare Durable Objects.
const adminWebSockets = new Set<WebSocket>();
// Global Map for Visitor WebSocket connections (visitorId -> WebSocket)
// TODO: Similarly, consider Durable Objects for scalability.
const visitorWebSockets = new Map<string, WebSocket>();

// Function to broadcast messages to all connected admin WebSockets
export function broadcastAdminNotification(payload: any, specificAdminWs?: WebSocket) {
  const message = JSON.stringify(payload);
  if (specificAdminWs) {
    try {
      console.log(`Sending targeted message to one admin: ${message.substring(0,100)}...`);
      specificAdminWs.send(message);
    } catch (err) {
      console.error("Error sending targeted message to admin WebSocket:", err);
    }
  } else {
    console.log(`Broadcasting to ${adminWebSockets.size} admin clients: ${message.substring(0,100)}...`);
    adminWebSockets.forEach(ws => {
      try {
        ws.send(message);
      } catch (err) {
        console.error("Error sending message to admin WebSocket:", err);
      }
    });
  }
}

// Helper to send message to a specific visitor WebSocket
function sendToVisitor(visitorId: string, payload: any) {
  const visitorWs = visitorWebSockets.get(visitorId);
  if (visitorWs) {
    try {
      console.log(`Sending message to visitor ${visitorId}: ${JSON.stringify(payload).substring(0,100)}...`);
      visitorWs.send(JSON.stringify(payload));
    } catch (err) {
      console.error(`Error sending message to visitor ${visitorId}:`, err);
    }
  } else {
    console.log(`Visitor ${visitorId} not connected via WebSocket.`);
  }
// Global OPTIONS handler for CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    }
  });
});

// --- Public API Routes ---

// Auth routes
router.post('/api/auth/login', (request: IRequest, env: Env, ctx: ExecutionContext) => login(request as unknown as Request, env));
router.post('/api/auth/register', (request: IRequest, env: Env, ctx: ExecutionContext) => register(request as unknown as Request, env));
router.post('/api/auth/logout', (request: IRequest, env: Env, ctx: ExecutionContext) => logout(request as unknown as Request, env));

// Privacy routes
router.post('/api/privacy/deletion-request', (request: IRequest, env: Env, ctx: ExecutionContext) => requestDataDeletion(request as unknown as Request, env));

// Public Resource Routes
router.get('/api/puppies', (request: IRequest, env: Env, ctx: ExecutionContext) => getAllPuppies(request as unknown as Request, env));
router.get('/api/puppies/:id', (request: IRequest, env: Env, ctx: ExecutionContext) => getPuppyById(request as unknown as Request, env));

router.get('/api/litters', (request: IRequest, env: Env, ctx: ExecutionContext) => getAllLitters(request as unknown as Request, env));
router.get('/api/litters/:id', (request: IRequest, env: Env, ctx: ExecutionContext) => getLitterById(request as unknown as Request, env));

router.get('/api/settings/public', (request: IRequest, env: Env, ctx: ExecutionContext) => getPublicSiteSettings(request as unknown as Request, env));

// NEW: Public System Status Routes
router.get('/api/system/status', (request: IRequest, env: Env, ctx: ExecutionContext) => getSystemStatus(request as unknown as Request, env));
router.get('/api/system/uptime', (request: IRequest, env: Env, ctx: ExecutionContext) => getSystemUptime(request as unknown as Request, env));

// --- Payment and Webhook Routes ---

// Checkout (user might be authenticated or guest, handle auth inside controller or make public and check for JWT)
// For now, placing it as a public route. processPayment should ideally handle extracting user info if a JWT is present.
router.post('/api/checkout', (request: IRequest, env: Env, ctx: ExecutionContext) => {
  return processPayment(request as unknown as Request, env);
});

// Square Webhook (must be public)
router.post('/api/webhooks/square', (request: IRequest, env: Env, ctx: ExecutionContext) => handleSquareWebhook(request as unknown as Request, env));

// Email Inbound Webhook (public - security should be handled by provider signature or secret key in URL)
router.post('/api/webhooks/email/inbound', (request: IRequest, env: Env, ctx: ExecutionContext) => handleInboundEmailWebhook(request as unknown as Request, env));

// Site Visit Tracking (public, or light session-based)
router.post('/api/track-visit', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  return trackVisitHandler(request as unknown as Request, env); // env already augmented in fetch()
});

// Chat Initiation (public)
router.post('/api/chat/initiate', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  return initiateChatSession(request as unknown as Request, env); // env already augmented
});


// --- Protected User Routes (require verifyJwtAuth) ---

router.get('/api/users/me', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return getCurrentUser(request as unknown as Request, env, authResult.decodedToken);
});

router.put('/api/users/me/profile', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return updateUserProfile(request as unknown as Request, env, authResult.decodedToken);
});

router.get('/api/my-puppies', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return getMyPuppies(request as unknown as Request, env, authResult.decodedToken);
});

router.get('/api/puppies/:puppyId/health-records', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  const params = request.params || {};
  return getPuppyHealthRecords(request as unknown as Request, env, params as { puppyId: string }, authResult.decodedToken);
});

router.post('/api/puppies/:puppyId/health-records', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  const params = request.params || {};
  return addPuppyHealthRecord(request as unknown as Request, env, authResult.decodedToken, params as { puppyId: string });
});

router.get('/api/my-conversations', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return getMyConversations(request as unknown as Request, env, authResult.decodedToken);
});

router.post('/api/conversations', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return startConversation(request as unknown as Request, env, authResult.decodedToken);
});

router.get('/api/conversations/:conversationId/messages', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  const params = request.params || {};
  return getMessagesForConversation(request as unknown as Request, env, authResult.decodedToken, params.conversationId);
});

router.post('/api/conversations/:conversationId/messages', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  const params = request.params || {};
  return sendMessage(request as unknown as Request, env, authResult.decodedToken, params.conversationId);
});

// --- Puppy Credits (User) ---
router.get('/api/puppy-credits', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return getUserPuppyCreditBalance(request as unknown as Request, env, authResult.decodedToken);
});

router.get('/api/puppy-credits/history', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return getPuppyCreditHistory(request as unknown as Request, env, authResult.decodedToken);
});


// --- Admin Only Routes (require adminAuthMiddleware) ---

// User Management (Admin)
router.get('/api/admin/users', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return listUsers(request as unknown as Request, env);
});
router.get('/api/admin/users/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return getUserByIdAdmin(request as unknown as Request, env, params.id);
});
router.put('/api/admin/users/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return updateUserAdmin(request as unknown as Request, env, params.id);
});
router.delete('/api/admin/users/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return deleteUserAdmin(request as unknown as Request, env, params.id);
});

// Puppy Management (Admin)
router.post('/api/admin/puppies', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return createPuppy(request as unknown as Request, env);
});
router.put('/api/admin/puppies/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return updatePuppy(request as unknown as Request, env, params.id);
});
router.delete('/api/admin/puppies/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return deletePuppy(request as unknown as Request, env, params.id);
});

// Litter Management (Admin)
router.post('/api/admin/litters', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return createLitter(request as unknown as Request, env);
});
router.put('/api/admin/litters/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return updateLitter(request as unknown as Request, env, params.id);
});
router.delete('/api/admin/litters/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return deleteLitter(request as unknown as Request, env, params.id);
});

// --- Admin Payment Routes ---
router.post('/api/admin/payments/:paymentId/capture', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  if (!params.paymentId) {
    return new Response(JSON.stringify({ error: 'paymentId parameter is required' }), { status: 400, headers: corsHeaders });
  }
  return captureAuthorizedPayment(request as unknown as Request, env, params.paymentId);
});

router.post('/api/admin/refunds', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return refundPaymentHandler(request as unknown as Request, env);
});

// Puppy Credits Management (Admin)
router.post('/api/admin/puppy-credits/issue', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env); // Ensures admin
  if (authResponse) return authResponse;
  // We need the admin's own authResult (decoded token) to pass to issuePuppyCredits for logging who issued it.
  const adminAuthResult = await verifyJwtAuth(request as unknown as Request, env); // This will re-verify JWT but gives us the token
  if (!adminAuthResult.authenticated || !adminAuthResult.decodedToken) {
     // This should ideally not happen if adminAuthMiddleware passed, but as a safeguard:
    return new Response(JSON.stringify({ error: 'Admin authentication token issue.' }), { status: 401, headers: corsHeaders });
  }
  return issuePuppyCredits(request as unknown as Request, env, adminAuthResult.decodedToken);
});

// Unified Inbox / Email Communication (Admin)
router.get('/api/admin/inbox/conversations', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  // We need admin's authResult for potential future use (e.g. filtering by assigned admin)
  const adminAuthResult = await verifyJwtAuth(request as unknown as Request, env);
   if (!adminAuthResult.authenticated || !adminAuthResult.decodedToken) {
    return new Response(JSON.stringify({ error: 'Admin authentication token issue.' }), { status: 401, headers: corsHeaders });
  }
  return getConversations(request as unknown as Request, env, adminAuthResult.decodedToken);
});

router.get('/api/admin/inbox/conversations/:conversationId', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  if (!params.conversationId) {
    return new Response(JSON.stringify({ error: 'conversationId parameter is required' }), { status: 400, headers: corsHeaders });
  }
  const adminAuthResult = await verifyJwtAuth(request as unknown as Request, env);
   if (!adminAuthResult.authenticated || !adminAuthResult.decodedToken) {
    return new Response(JSON.stringify({ error: 'Admin authentication token issue.' }), { status: 401, headers: corsHeaders });
  }
  return getConversationMessages(request as unknown as Request, env, adminAuthResult.decodedToken, params.conversationId);
});

router.post('/api/admin/inbox/conversations/:conversationId/reply', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  if (!params.conversationId) {
    return new Response(JSON.stringify({ error: 'conversationId parameter is required' }), { status: 400, headers: corsHeaders });
  }
  const adminAuthResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!adminAuthResult.authenticated || !adminAuthResult.decodedToken) {
    return new Response(JSON.stringify({ error: 'Admin authentication token issue.' }), { status: 401, headers: corsHeaders });
  }
  return replyToConversation(request as unknown as Request, env, adminAuthResult.decodedToken, params.conversationId);
});


// Site Settings (Admin)
router.get('/api/admin/settings', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return getAllSiteSettings(request as unknown as Request, env);
});
router.put('/api/admin/settings/:key', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return updateSiteSetting(request as unknown as Request, env, params.key);
});

// Email Templates (Admin)
router.get('/api/admin/email-templates', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return listEmailTemplates(request as unknown as Request, env);
});
router.get('/api/admin/email-templates/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return getEmailTemplateById(request as unknown as Request, env, params.id);
});
router.post('/api/admin/email-templates', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return createEmailTemplate(request as unknown as Request, env);
});
router.put('/api/admin/email-templates/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return updateEmailTemplate(request as unknown as Request, env, params.id);
});
router.delete('/api/admin/email-templates/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return deleteEmailTemplate(request as unknown as Request, env, params.id);
});

// Integrations (Admin)
router.get('/api/admin/integrations', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return listIntegrations(request as unknown as Request, env);
});
router.put('/api/admin/integrations/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return updateIntegration(request as unknown as Request, env, params.id);
});

// Data Deletion Requests (Admin)
router.get('/api/admin/data-deletion-requests', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return listDataDeletionRequests(request as unknown as Request, env);
});
router.get('/api/admin/data-deletion-requests/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return getDataDeletionRequestById(request as unknown as Request, env, params as { id: string });
});
router.put('/api/admin/data-deletion-requests/:id/status', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  return updateDataDeletionRequestStatus(request as unknown as Request, env, params as { id: string });
});

// NEW: Admin Test Routes
router.post('/api/admin/test-session', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  // Get admin token from request
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  return createAdminTestSession(request as unknown as Request, env, authResult.decodedToken);
});
router.post('/api/admin/test-session/impersonate', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  // Get admin token from request
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  return createImpersonationSession(request as unknown as Request, env, authResult.decodedToken);
});
router.get('/api/admin/test-logs', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  // Get admin token from request
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  return getTestSessionLogs(request as unknown as Request, env, authResult.decodedToken);
});

// NEW: Transaction History Route (Fixed from AdminTest page)
router.get('/api/admin/transactions', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const searchQuery = url.searchParams.get('searchQuery');
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM transactions`;
    let countQuery = `SELECT COUNT(*) as total FROM transactions`;
    const params: any[] = [];
    const countParams: any[] = [];

    const conditions: string[] = [];

    if (status && status !== 'All') {
      conditions.push('status = ?');
      params.push(status);
      countParams.push(status);
    }

    if (searchQuery) {
      conditions.push('(id LIKE ? OR square_payment_id LIKE ?)');
      params.push(`%${searchQuery}%`, `%${searchQuery}%`);
      countParams.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      query += whereClause;
      countQuery += whereClause;
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [transactionsResult, countResult] = await Promise.all([
      env.PUPPIES_DB.prepare(query).bind(...params).all(),
      env.PUPPIES_DB.prepare(countQuery).bind(...countParams).first()
    ]);

    const total = (countResult as any)?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return new Response(JSON.stringify({
      transactions: transactionsResult.results,
      currentPage: page,
      totalPages,
      totalTransactions: total,
      limit
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Catch-all for /api/* routes not matched above
// IMPORTANT: This catch-all should be AFTER all specific API routes are defined.
router.all('/api/*', () => new Response(JSON.stringify({ error: 'API endpoint not found' }), {
  status: 404,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
}));

// Default export for the Worker
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket endpoint for Admin Notifications & Chat
    if (url.pathname === '/ws/admin-notifications') {
      const token = url.searchParams.get('token');
      if (!token) return new Response('Missing auth token for WebSocket.', { status: 401 });

      const tempRequestForAuth = new Request(request.url, { headers: new Headers({ 'Authorization': `Bearer ${token}` }) });
      const authResult = await verifyJwtAuth(tempRequestForAuth, env);

      if (!authResult.authenticated || !authResult.decodedToken || !authResult.decodedToken.roles?.includes('admin')) {
        return new Response('WebSocket auth failed or not admin.', { status: 403 });
      }

      const adminId = authResult.decodedToken.userId;
      console.log(`Admin ${adminId} attempting WebSocket connection.`);
      const pair = new WebSocketPair();
      const [clientWs, serverWs] = Object.values(pair);

      serverWs.accept();
      adminWebSockets.add(serverWs);
      // Store adminId with WebSocket if needed for targeted messaging from other admins, e.g., using a Map
      // For now, adminWebSockets is a Set, so broadcast goes to all.
      console.log(`Admin WebSocket for ${adminId} accepted. Total admin clients: ${adminWebSockets.size}`);

      serverWs.addEventListener('message', async (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data as string);
          console.log(`Message from admin ${adminId}:`, message);

          if (message.type === 'chat_message_send' && message.payload) {
            const { conversation_id: visitorId, message_text } = message.payload;
            if (!visitorId || !message_text) {
              serverWs.send(JSON.stringify({ type: 'error', message: 'Missing conversation_id or message_text.' }));
              return;
            }

            const chatMessageData = {
              conversation_id: visitorId,
              sender_id: adminId,
              sender_type: 'admin' as const,
              message_text: message_text,
            };
            const saveResult = await saveChatMessage(env, chatMessageData);
            if (!saveResult.success) {
                serverWs.send(JSON.stringify({ type: 'error', message: 'Failed to save message: ' + saveResult.error }));
                return;
            }
            const fullChatMessage = { ...chatMessageData, id: saveResult.messageId, timestamp: Math.floor(Date.now()/1000) };


            // Relay to specific visitor
            sendToVisitor(visitorId, { type: 'chat_message_receive', payload: fullChatMessage });
            // serverWs.send(JSON.stringify({ type: 'chat_message_sent_confirmation', payload: fullChatMessage }));
          }
          // Handle other message types from admin (e.g., admin_join_chat, admin_typing)
        } catch (err: any) {
          console.error(`Error processing message from admin ${adminId}:`, err);
          serverWs.send(JSON.stringify({ type: 'error', message: 'Error processing message: ' + err.message }));
        }
      });

      const closeOrErrorHandler = (evt: Event) => {
        adminWebSockets.delete(serverWs);
        console.log(`Admin WebSocket for ${adminId} closed or errored. Total admin clients: ${adminWebSockets.size}.`);
      };
      serverWs.addEventListener('close', closeOrErrorHandler);
      serverWs.addEventListener('error', closeOrErrorHandler);

      return new Response(null, { status: 101, webSocket: clientWs });
    }

    // WebSocket endpoint for Visitor Chat
    if (url.pathname === '/ws/chat-visitor') {
      const visitorId = url.searchParams.get('visitorId');
      if (!visitorId) {
        return new Response('Missing visitorId for WebSocket.', { status: 400 });
      }

      console.log(`Visitor ${visitorId} attempting WebSocket connection.`);
      const pair = new WebSocketPair();
      const [clientWs, serverWs] = Object.values(pair);

      serverWs.accept();
      visitorWebSockets.set(visitorId, serverWs);
      console.log(`Visitor WebSocket for ${visitorId} accepted. Total visitor clients: ${visitorWebSockets.size}`);

      // Notify admins that a visitor has connected for chat
      // TODO: Check if a chat session already exists and if it's currently 'active' with an admin.
      // If so, maybe send a different type of notification or directly to the assigned admin.
      broadcastAdminNotification({ type: 'visitor_chat_connect', data: { visitorId } });


      serverWs.addEventListener('message', async (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data as string);
          console.log(`Message from visitor ${visitorId}:`, message);

          if (message.type === 'chat_message_send' && message.payload) {
            const { message_text } = message.payload;
             if (!message_text) {
              serverWs.send(JSON.stringify({ type: 'error', message: 'Missing message_text.' }));
              return;
            }
            const chatMessageData = {
              conversation_id: visitorId,
              sender_id: visitorId,
              sender_type: 'visitor' as const,
              message_text: message_text,
            };
            const saveResult = await saveChatMessage(env, chatMessageData);
             if (!saveResult.success) {
                serverWs.send(JSON.stringify({ type: 'error', message: 'Failed to save message: ' + saveResult.error }));
                return;
            }
            const fullChatMessage = { ...chatMessageData, id: saveResult.messageId, timestamp: Math.floor(Date.now()/1000) };

            // Relay to all admins
            broadcastAdminNotification({ type: 'chat_message_receive', payload: fullChatMessage });
            // serverWs.send(JSON.stringify({ type: 'chat_message_sent_confirmation', payload: fullChatMessage }));
          }
          // Handle other message types from visitor (e.g., visitor_typing)
        } catch (err: any) {
          console.error(`Error processing message from visitor ${visitorId}:`, err);
          serverWs.send(JSON.stringify({ type: 'error', message: 'Error processing message: ' + err.message}));
        }
      });

      const closeOrErrorHandler = (evt: Event) => {
        visitorWebSockets.delete(visitorId);
        console.log(`Visitor WebSocket for ${visitorId} closed or errored. Total visitor clients: ${visitorWebSockets.size}.`);
        // Notify admins that visitor has disconnected from chat
        broadcastAdminNotification({ type: 'visitor_chat_disconnect', data: { visitorId } });
      };
      serverWs.addEventListener('close', closeOrErrorHandler);
      serverWs.addEventListener('error', closeOrErrorHandler);

      return new Response(null, { status: 101, webSocket: clientWs });
    }


    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      const augmentedEnv = { ...env, broadcastAdminNotification, visitorWebSockets, adminWebSockets, sendToVisitor };
      return router.handle(request, augmentedEnv, ctx)
        .then(response => {
          // Ensure CORS headers are applied to all API responses
          const newHeaders = new Headers(response.headers);
          Object.entries(corsHeaders).forEach(([key, value]) => {
            if (!newHeaders.has(key)) { // Don't overwrite if already set by the route handler
              newHeaders.set(key, value);
            }
          });
          // Special case for 204 No Content, body should be null
          if (response.status === 204) {
            return new Response(null, { headers: newHeaders, status: response.status, statusText: response.statusText });
          }
          return new Response(response.body, { headers: newHeaders, status: response.status, statusText: response.statusText });
        })
        .catch((error) => {
          console.error('Router Error:', error);
          // Ensure CORS headers for error responses too
          return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        });
    }

    // --- Static Asset Serving Logic (Fallback for non-API routes) ---
    try {
      let assetPath = url.pathname;
      if (assetPath === '/' || assetPath === '') {
        assetPath = 'index.html';
      } else if (assetPath.startsWith('/')) {
        assetPath = assetPath.substring(1);
      }

      // If the path doesn't have an extension, and is not explicitly 'index.html',
      // assume it's a client-side route and serve index.html for SPA fallback.
      if (!assetPath.includes('.') && assetPath !== 'index.html') {
        const spaFallbackObject = await env.STATIC_ASSETS.get('index.html');
        if (spaFallbackObject) {
          const headers = new Headers(corsHeaders); // Apply CORS to SPA fallback too
          headers.set('Content-Type', 'text/html');
          headers.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // Prevent caching of index.html for SPA routes
          return new Response(spaFallbackObject.body, { headers });
        }
      }
      
      const object = await env.STATIC_ASSETS.get(assetPath);

      if (object) {
        const headers = new Headers(corsHeaders); // Apply CORS to static assets
        let contentType = 'application/octet-stream'; // Default content type
        
        if (assetPath.endsWith('.html')) contentType = 'text/html';
        else if (assetPath.endsWith('.js')) contentType = 'application/javascript';
        else if (assetPath.endsWith('.css')) contentType = 'text/css';
        else if (assetPath.endsWith('.png')) contentType = 'image/png';
        else if (assetPath.endsWith('.jpg') || assetPath.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (assetPath.endsWith('.svg')) contentType = 'image/svg+xml';
        else if (assetPath.endsWith('.ico')) contentType = 'image/x-icon';
        else if (assetPath.endsWith('.json')) contentType = 'application/json';

        headers.set('Content-Type', contentType);
        
        // Cache policy: long for versioned assets, short for others
        if (assetPath.match(/(\.[\da-f]{8,}\.(css|js|png|jpg|svg)$)/i) || assetPath.includes('/assets/')) { // Heuristic for versioned assets
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour for other assets
        }
        
        return new Response(object.body, { headers });
      }
    } catch (error) {
      console.error('Static serving error:', error);
      // Fall through to 404 if asset not found or error during fetch
    }

    // Fallback 404 for any other unhandled paths
    return new Response('Not Found', { 
      status: 404, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' } // Plain text for generic 404
    });
  },
};
