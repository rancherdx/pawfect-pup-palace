
import { Router } from 'itty-router';
// Updated to import specific auth functions and new admin middleware
import { verifySessionAuth, adminAuthMiddleware } from './auth'; // Corrected: authMiddleware is local to index.ts
import * as puppiesController from './controllers/puppies';
import * as usersController from './controllers/users';
import * as chatController from './controllers/chat'; // Import chatController
// Import admin user management functions
import { listUsers, getUserByIdAdmin, updateUserAdmin, deleteUserAdmin } from './controllers/users';
import * as littersController from './controllers/litters';
// Import processPayment and handleSquareWebhook from payment controller
import { processPayment, handleSquareWebhook } from './controllers/payment';
// Import admin settings functions
import { getSiteSettings, updateSiteSettings } from './controllers/settings';
// Import admin integrations functions
import {
  listIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration
} from './controllers/integrations';
// Import admin email templates functions
import {
  listEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate
} from './controllers/emailTemplates';
// Import admin and user transactions functions
import { listTransactions, listUserTransactions } from './controllers/transactions';
// Import stud dogs controller functions
import {
  createStudDog,
  listPublicStudDogs,
  getStudDogDetails,
  updateStudDog,
  deleteStudDog,
  listAdminStudDogs // Added listAdminStudDogs
} from './controllers/studDogs';
import { corsHeaders } from './utils/cors';
import { handleApiError } from './utils/errors';
import type { Env } from './env';
import { initializeDatabase } from './init-db';

// Define the DurableObjectState interface to fix the TypeScript error
interface DurableObjectState {
  storage: {
    get(key: string): Promise<any>;
    put(key: string, value: any): Promise<void>;
  };
}

// Define a SessionDO class to fix the Cloudflare deployment error
export class SessionDO {
  constructor(private state: DurableObjectState, private env: Env) {}

  async fetch(request: Request) {
    // Basic implementation - in a real app, this would have more functionality
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/get") {
      const sessionData = await this.state.storage.get("session");
      return new Response(JSON.stringify(sessionData || {}), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (path === "/set" && request.method === "POST") {
      const data = await request.json();
      await this.state.storage.put("session", data);
      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
}

// Define ExecutionContext interface to fix the TypeScript error
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

const router = Router();

// Static asset serving helper
async function serveStaticAsset(pathname: string): Promise<Response> {
  const filePath = pathname === '/' ? '/index.html' : pathname;
  try {
    const asset = await fetch(`dist${filePath}`);
    if (asset.status === 200) return asset;
    return new Response('Not found', { status: 404 });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}

// Auth middleware (using verifySessionAuth for existing protected routes)
const authMiddleware = async (request: Request, env: Env, ): Promise<Response | any> => {
  const authResult = await verifySessionAuth(request, env); // Using session auth for existing routes
  if (!authResult.authenticated) {
    return new Response(JSON.stringify({ error: authResult.error || 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  // itty-router middlewares pass control if they don't return a Response.
  // To pass data to the next handler, we can augment the request object.
  (request as any).auth = authResult; // Make authResult available to handlers
  // No explicit return here means itty-router will proceed to the next handler.
  // This authMiddleware is primarily for session token based auth.
  // For JWT based (like admin routes), adminAuthMiddleware is used.
};


router.options('*', () => new Response(null, { headers: corsHeaders }));

// Database initialization route
router.get('/api/init-db', async (req, env) => {
  const result = await initializeDatabase(env);
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});

// System status endpoint
router.get('/api/status', async (req, env) => {
  try {
    // Check database connection
    const dbCheck = await env.PUPPIES_DB.prepare("SELECT 1").first();
    
    // Check KV connection
    const kvCheck = await env.AUTH_STORE.get("test-key");
    
    // Return status information
    return new Response(JSON.stringify({
      status: "healthy",
      services: {
        database: dbCheck ? "connected" : "error",
        kv: kvCheck !== null ? "connected" : "error",
        worker: "running"
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: "degraded",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Test endpoints for admin panel
router.get('/api/test/database', async (req, env) => {
  const auth = await authMiddleware(req, env);
  if (auth instanceof Response) return auth;
  
  try {
    const tables = await env.PUPPIES_DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    ).all();
    
    return new Response(JSON.stringify({
      success: true,
      tables: tables.results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

router.get('/api/test/kv', async (req, env) => {
  const auth = await authMiddleware(req, env);
  if (auth instanceof Response) return auth;
  
  try {
    const testValue = `test-${Date.now()}`;
    await env.AUTH_STORE.put("test-key", testValue);
    const retrieved = await env.AUTH_STORE.get("test-key");
    
    return new Response(JSON.stringify({
      success: true,
      match: testValue === retrieved,
      value: retrieved
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Public routes
router.get('/api/puppies', puppiesController.getAllPuppies);
router.get('/api/puppies/:id', puppiesController.getPuppyById);
router.get('/api/litters', littersController.getAllLitters);
router.get('/api/litters/:id', littersController.getLitterById);
// Public Stud Dog routes
router.get('/api/stud-dogs', listPublicStudDogs);
router.get('/api/stud-dogs/:studDogId', (request, env) => {
  const studDogId = request.params?.studDogId;
  if (!studDogId) {
    return new Response(JSON.stringify({ error: 'Stud Dog ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return getStudDogDetails(request, env, studDogId);
});

// Protected routes
router.post('/api/puppies', async (req, env) => {
  const auth = await authMiddleware(req, env);
  if (auth instanceof Response) return auth;
  return puppiesController.createPuppy(req, env, auth);
});

router.put('/api/puppies/:id', async (req, env) => {
  const auth = await authMiddleware(req, env);
  if (auth instanceof Response) return auth;
  return puppiesController.updatePuppy(req, env, auth);
});

router.delete('/api/puppies/:id', async (req, env) => {
  const auth = await authMiddleware(req, env);
  if (auth instanceof Response) return auth;
  return puppiesController.deletePuppy(req, env, auth);
});

router.post('/api/litters', async (req, env) => {
  const auth = await authMiddleware(req, env);
  if (auth instanceof Response) return auth;
  return littersController.createLitter(req, env, auth);
});

router.put('/api/litters/:id', async (req, env) => {
  const auth = await authMiddleware(req, env);
  if (auth instanceof Response) return auth;
  return littersController.updateLitter(req, env, auth);
});

router.delete('/api/litters/:id', async (req, env) => {
  const auth = await authMiddleware(req, env);
  if (auth instanceof Response) return auth;
  return littersController.deleteLitter(req, env, auth);
});

// User routes
router.post('/api/login', usersController.login);
router.post('/api/register', usersController.register);

// User Profile Routes
// getCurrentUser is already session-based, so authMiddleware (which calls verifySessionAuth) is appropriate.
router.get('/api/user', authMiddleware, (req, env) => usersController.getCurrentUser(req, env, (req as any).auth));
router.put('/api/user/profile', authMiddleware, (req, env) => usersController.updateUserProfile(req, env, (req as any).auth));


// My Puppies and Health Records (Protected by standard authMiddleware - session/JWT based)
router.get('/api/my-puppies', authMiddleware, (req, env) => puppiesController.getMyPuppies(req, env, (req as any).auth));

// For puppy health records, authMiddleware provides user context. The controller then checks ownership/admin.
router.get('/api/puppies/:puppyId/health-records', authMiddleware, (req, env) => {
  const puppyId = req.params?.puppyId;
  if (!puppyId) {
    return new Response(JSON.stringify({ error: 'Puppy ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return puppiesController.getPuppyHealthRecords(req, env, { puppyId }, (req as any).auth);
});

router.post('/api/puppies/:puppyId/health-records', authMiddleware, (req, env) => {
  const puppyId = req.params?.puppyId;
  if (!puppyId) {
    return new Response(JSON.stringify({ error: 'Puppy ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return puppiesController.addPuppyHealthRecord(req, env, (req as any).auth, { puppyId });
});


// Chat Routes (Protected by standard authMiddleware - session/JWT based)
router.get('/api/my-conversations', authMiddleware, (req, env) => chatController.getMyConversations(req, env, (req as any).auth));
router.post('/api/conversations', authMiddleware, (req, env) => chatController.startConversation(req, env, (req as any).auth));

router.get('/api/conversations/:conversationId/messages', authMiddleware, (req, env) => {
  const conversationId = req.params?.conversationId;
  if (!conversationId) {
    return new Response(JSON.stringify({ error: 'Conversation ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return chatController.getMessagesForConversation(req, env, (req as any).auth, conversationId);
});

router.post('/api/conversations/:conversationId/messages', authMiddleware, (req, env) => {
  const conversationId = req.params?.conversationId;
  if (!conversationId) {
    return new Response(JSON.stringify({ error: 'Conversation ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return chatController.sendMessage(req, env, (req as any).auth, conversationId);
});


// Checkout route
// Updated to call processPayment
async function handleCheckout(request: Request, env: Env): Promise<Response> {
  console.log('handleCheckout called, delegating to processPayment...');
  return processPayment(request, env);
}

router.post('/api/checkout', handleCheckout);

// Square Webhook route
router.post('/api/webhooks/square', handleSquareWebhook);

router.post('/api/logout', async (req, env) => { // authMiddleware could be used here too if desired
  const authResult = await verifySessionAuth(request, env); // Keep session based logout for now
  if (!authResult.authenticated) {
     return new Response(JSON.stringify({ error: authResult.error || 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  // Pass the whole request, as logout in usersController might need header token
  return usersController.logout(req, env);
});


// Admin User Management Routes (Protected by adminAuthMiddleware - JWT based)
// listUsers, getUserByIdAdmin, etc. are already correctly using adminAuthMiddleware
router.get('/api/admin/users', adminAuthMiddleware, listUsers);

router.get('/api/admin/users/:userId', adminAuthMiddleware, (request, env) => {
  const userId = request.params?.userId;
  if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return getUserByIdAdmin(request, env, userId);
});

router.put('/api/admin/users/:userId', adminAuthMiddleware, (request, env) => {
  const userId = request.params?.userId;
   if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return updateUserAdmin(request, env, userId);
});

router.delete('/api/admin/users/:userId', adminAuthMiddleware, (request, env) => {
  const userId = request.params?.userId;
   if (!userId) {
    return new Response(JSON.stringify({ error: 'User ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return deleteUserAdmin(request, env, userId);
});

// Admin Site Settings Routes (Protected by adminAuthMiddleware - JWT based)
router.get('/api/admin/settings', adminAuthMiddleware, getSiteSettings);
router.post('/api/admin/settings', adminAuthMiddleware, updateSiteSettings);

// Admin Third-Party Integrations Routes (Protected by adminAuthMiddleware - JWT based)
router.get('/api/admin/integrations', adminAuthMiddleware, listIntegrations);
router.post('/api/admin/integrations', adminAuthMiddleware, createIntegration);

router.put('/api/admin/integrations/:integrationId', adminAuthMiddleware, (request, env) => {
  const integrationId = request.params?.integrationId;
  if (!integrationId) {
    return new Response(JSON.stringify({ error: 'Integration ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return updateIntegration(request, env, integrationId);
});

router.delete('/api/admin/integrations/:integrationId', adminAuthMiddleware, (request, env) => {
  const integrationId = request.params?.integrationId;
  if (!integrationId) {
    return new Response(JSON.stringify({ error: 'Integration ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return deleteIntegration(request, env, integrationId);
});

// Admin Email Templates Routes (Protected by adminAuthMiddleware - JWT based)
router.get('/api/admin/email-templates', adminAuthMiddleware, listEmailTemplates);

router.get('/api/admin/email-templates/:templateId', adminAuthMiddleware, (request, env) => {
  const templateId = request.params?.templateId;
  if (!templateId) {
    return new Response(JSON.stringify({ error: 'Template ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return getEmailTemplateById(request, env, templateId);
});

router.put('/api/admin/email-templates/:templateId', adminAuthMiddleware, (request, env) => {
  const templateId = request.params?.templateId;
  if (!templateId) {
    return new Response(JSON.stringify({ error: 'Template ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return updateEmailTemplate(request, env, templateId);
});

// Admin Transactions Route (Protected by adminAuthMiddleware - JWT based)
router.get('/api/admin/transactions', adminAuthMiddleware, listTransactions);

// User's own transactions (Protected by standard authMiddleware - session/JWT based)
router.get('/api/my-transactions', authMiddleware, listUserTransactions);

// Admin Stud Dog Routes (Protected by adminAuthMiddleware - JWT based)
router.get('/api/admin/stud-dogs', adminAuthMiddleware, listAdminStudDogs); // New GET route for admin
router.post('/api/admin/stud-dogs', adminAuthMiddleware, createStudDog);

router.put('/api/admin/stud-dogs/:studDogId', adminAuthMiddleware, (request, env) => {
  const studDogId = request.params?.studDogId;
  if (!studDogId) {
    return new Response(JSON.stringify({ error: 'Stud Dog ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return updateStudDog(request, env, studDogId);
});

router.delete('/api/admin/stud-dogs/:studDogId', adminAuthMiddleware, (request, env) => {
  const studDogId = request.params?.studDogId;
   if (!studDogId) {
    return new Response(JSON.stringify({ error: 'Stud Dog ID parameter is missing' }), { status: 400, headers: corsHeaders });
  }
  return deleteStudDog(request, env, studDogId);
});


// Static asset catch-all
router.get('*', async (req) => {
  const url = new URL(req.url);
  return serveStaticAsset(url.pathname);
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      return await router.handle(request, env);
    } catch (err) {
      return handleApiError(err);
    }
  }
};
