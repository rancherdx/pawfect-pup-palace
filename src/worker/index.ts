
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
import { listEmailTemplates, getEmailTemplateById, updateEmailTemplate as createEmailTemplate, updateEmailTemplate, updateEmailTemplate as deleteEmailTemplate } from './controllers/emailTemplates';
import { listIntegrations, updateIntegration } from './controllers/integrations';
import { listDataDeletionRequests, getDataDeletionRequestById, updateDataDeletionRequestStatus } from './controllers/adminPrivacyController';

// NEW: Admin Test and System Status Controllers
import { createAdminTestSession, createImpersonationSession, getTestSessionLogs } from './controllers/adminTestController';
import { getSystemStatus, getSystemUptime } from './controllers/systemStatusController';

// Create a new router instance
const router = Router();

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
  return getPuppyHealthRecords(request as unknown as Request, env, { puppyId: params.puppyId }, authResult.decodedToken);
});

router.post('/api/puppies/:puppyId/health-records', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  const params = request.params || {};
  return addPuppyHealthRecord(request as unknown as Request, env, authResult.decodedToken, { puppyId: params.puppyId });
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
router.get('/api/admin/puppies', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return getAllPuppies(request as unknown as Request, env);
});
router.post('/api/admin/puppies', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.decodedToken) {
    return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return createPuppy(request as unknown as Request, env, authResult.decodedToken);
});
router.put('/api/admin/puppies/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.decodedToken) {
    return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return updatePuppy(request as unknown as Request, env, authResult.decodedToken);
});
router.delete('/api/admin/puppies/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  const params = request.params || {};
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.decodedToken) {
    return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return deletePuppy(request as unknown as Request, env, authResult.decodedToken);
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
  if (!authResult.decodedToken) {
    return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return createAdminTestSession(request as unknown as Request, env, authResult.decodedToken);
});
router.post('/api/admin/test-session/impersonate', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  // Get admin token from request
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.decodedToken) {
    return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return createImpersonationSession(request as unknown as Request, env, authResult.decodedToken);
});
router.get('/api/admin/test-logs', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  // Get admin token from request
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.decodedToken) {
    return new Response(JSON.stringify({ error: 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
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
router.all('/api/*', () => new Response(JSON.stringify({ error: 'API endpoint not found' }), {
  status: 404,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
}));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return router.handle(request, env, ctx)
        .catch((error) => {
          console.error('Router Error:', error);
          return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        });
    }

    // --- Existing Static Asset Serving Logic (Fallback) ---
    // Handle CORS preflight requests for non-API routes if necessary,
    // though typically OPTIONS * from router should cover most cases if frontend and worker are same origin.
    // For direct static asset access, browser usually handles this.
    // If worker is on different domain than assets and direct fetch is needed, this might be required.
    // For now, assuming frontend (which makes API calls) handles its own OPTIONS for static assets if needed,
    // or they are served from same origin. The router's OPTIONS * is for API calls.

    try {
      if (url.pathname === '/') {
        const object = await env.STATIC_ASSETS.get('index.html');
        if (object) {
          const headers = new Headers(corsHeaders);
          headers.set('Content-Type', 'text/html');
          headers.set('Cache-Control', 'public, max-age=3600');
          return new Response(object.body, { headers });
        }
      }

      let assetPath = url.pathname;
      
      if (assetPath.startsWith('/')) {
        assetPath = assetPath.substring(1);
      }
      
      let object = await env.STATIC_ASSETS.get(assetPath);
      
      if (!object && !assetPath.includes('.')) {
        object = await env.STATIC_ASSETS.get('index.html');
        assetPath = 'index.html';
      }
      
      if (object) {
        const headers = new Headers(corsHeaders);
        
        if (assetPath.endsWith('.html')) {
          headers.set('Content-Type', 'text/html');
        } else if (assetPath.endsWith('.js')) {
          headers.set('Content-Type', 'application/javascript');
        } else if (assetPath.endsWith('.css')) {
          headers.set('Content-Type', 'text/css');
        } else if (assetPath.endsWith('.png')) {
          headers.set('Content-Type', 'image/png');
        } else if (assetPath.endsWith('.jpg') || assetPath.endsWith('.jpeg')) {
          headers.set('Content-Type', 'image/jpeg');
        } else if (assetPath.endsWith('.svg')) {
          headers.set('Content-Type', 'image/svg+xml');
        } else if (assetPath.endsWith('.ico')) {
          headers.set('Content-Type', 'image/x-icon');
        } else if (assetPath.endsWith('.json')) {
          headers.set('Content-Type', 'application/json');
        }
        
        if (assetPath.includes('/assets/') || assetPath.endsWith('.js') || assetPath.endsWith('.css')) {
          headers.set('Cache-Control', 'public, max-age=31536000');
        } else {
          headers.set('Cache-Control', 'public, max-age=3600');
        }
        
        return new Response(object.body, { headers });
      }
      
      if (url.pathname.startsWith('/api/') || assetPath.includes('.')) {
        return new Response('Not Found', { 
          status: 404, 
          headers: corsHeaders 
        });
      } else {
        const indexObject = await env.STATIC_ASSETS.get('index.html');
        if (indexObject) {
          const headers = new Headers(corsHeaders);
          headers.set('Content-Type', 'text/html');
          return new Response(indexObject.body, { headers });
        }
      }
      
    } catch (error) {
      console.error('Static serving error:', error);
    }

    return new Response('Not Found', { 
      status: 404, 
      headers: corsHeaders 
    });
  },
};
