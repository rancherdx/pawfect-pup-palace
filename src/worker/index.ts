
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
import { getCurrentUser, updateUserProfile } from './controllers/users'; // Already imported but good to group mentally
import { getMyPuppies, getPuppyHealthRecords, addPuppyHealthRecord } from './controllers/puppies'; // Already imported
import { getMyConversations, getMessagesForConversation, sendMessage, startConversation } from './controllers/chat'; // Already imported

// Public Resource Controllers
import { getAllPuppies, getPuppyById } from './controllers/puppies'; // Already imported
import { getAllLitters, getLitterById, createLitter, updateLitter, deleteLitter } from './controllers/litters'; // Added admin functions
// Breeds and Blog controllers are not available, so routes will be skipped.
import { getAllStudDogs, getStudDogById, createStudDog, updateStudDog, deleteStudDog } from './controllers/studDogs'; // Added admin functions
import { getPublicSiteSettings, getAllSiteSettings, updateSiteSetting } from './controllers/settings'; // Added admin functions

// Admin Controllers
import { listUsers, getUserByIdAdmin, updateUserAdmin, deleteUserAdmin } from './controllers/users'; // Specific admin user functions
import { createPuppy, updatePuppy, deletePuppy } from './controllers/puppies'; // Specific admin puppy functions
import { listEmailTemplates, getEmailTemplateById, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from './controllers/emailTemplates';
import { listIntegrations, getIntegrationById, updateIntegration } from './controllers/integrations';
import { listDataDeletionRequests, getDataDeletionRequestById, updateDataDeletionRequestStatus } from './controllers/adminPrivacyController';


// Create a new router instance
const router = Router();

// Global OPTIONS handler for CORS preflight requests
router.options('*', () => {
  return new Response(null, {
    status: 204, // No Content
    headers: {
      ...corsHeaders, // Ensure these include Allow-Origin, Allow-Methods, Allow-Headers
      'Access-Control-Max-Age': '86400', // Cache preflight for 1 day
    }
  });
});

//
// IMPORTANT: ROUTING AND AUTH MIDDLEWARE APPLICATION (Updated for itty-router)
//
// This basic `fetch` function in `index.ts` is suitable for serving static assets
// and very simple API endpoints. For a more complex application, you'll need a
// proper router (like itty-router, Hono, or Cloudflare's built-in router for Workers)
// to handle different API routes, methods, and parameters.
//
// Authentication middleware (`verifyJwtAuth` and `adminAuthMiddleware` from
// `./auth.ts`) should be applied at the router level *before* calling protected
// controller functions.
//
// Example (actual route definitions will be added in subsequent subtasks):
//
// // Public routes
// router.post('/api/login', login);
// router.post('/api/register', register);
// router.post('/api/privacy/deletion-request', requestDataDeletion);
//
// // Admin routes (example - assuming adminAuthMiddleware is correctly set up)
// router.get('/api/admin/data-deletion-requests', adminAuthMiddleware, listDataDeletionRequests);
// router.get('/api/admin/data-deletion-requests/:id', adminAuthMiddleware, (req, env, ctx) => {
//    const params = (req as IRequest).params;
//    return getDataDeletionRequestById(req, env, params);
// });
// router.put('/api/admin/data-deletion-requests/:id/status', adminAuthMiddleware, (req, env, ctx) => {
//    const params = (req as IRequest).params;
//    return updateDataDeletionRequestStatus(req, env, params);
// });
//
// // Catch-all for /api/* routes not matched above
// router.all('/api/*', () => new Response(JSON.stringify({ error: 'API endpoint not found' }), {
//   status: 404,
//   headers: { ...corsHeaders, 'Content-Type': 'application/json' }
// }));

// Recommendation: Implement rate limiting for sensitive endpoints, especially
// authentication routes like /api/login and /api/register, as part of
// production readiness. This can be done using Cloudflare's Rate Limiting
// product or custom logic (e.g., with Durable Objects).


// --- Public API Routes ---

// Auth routes
router.post('/api/auth/login', (request: IRequest, env: Env, ctx: ExecutionContext) => login(request as unknown as Request, env));
router.post('/api/auth/register', (request: IRequest, env: Env, ctx: ExecutionContext) => register(request as unknown as Request, env));
router.post('/api/auth/logout', (request: IRequest, env: Env, ctx: ExecutionContext) => logout(request as unknown as Request, env)); // Logout might need auth later if it invalidates server-side tokens

// Privacy routes
router.post('/api/privacy/deletion-request', (request: IRequest, env: Env, ctx: ExecutionContext) => requestDataDeletion(request as unknown as Request, env));

// Public Resource Routes
// Puppies
router.get('/api/puppies', (request: IRequest, env: Env, ctx: ExecutionContext) => getAllPuppies(request as unknown as Request, env));
router.get('/api/puppies/:id', (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const params = request.params || {};
    // Itty-router passes params to the request object itself, not as a separate arg to handler
    // The controller getPuppyById expects request, env, and then id directly or via request.params
    // For consistency with how other controllers might be structured if they don't use itty-router's request directly:
    return getPuppyById(request as unknown as Request, env);
});

// Litters
router.get('/api/litters', (request: IRequest, env: Env, ctx: ExecutionContext) => getAllLitters(request as unknown as Request, env));
router.get('/api/litters/:id', (request: IRequest, env: Env, ctx: ExecutionContext) => {
    return getLitterById(request as unknown as Request, env);
});

// Stud Dogs
router.get('/api/stud-dogs', (request: IRequest, env: Env, ctx: ExecutionContext) => getAllStudDogs(request as unknown as Request, env));
router.get('/api/stud-dogs/:id', (request: IRequest, env: Env, ctx: ExecutionContext) => {
    return getStudDogById(request as unknown as Request, env);
});

// Public Settings
router.get('/api/settings/public', (request: IRequest, env: Env, ctx: ExecutionContext) => getPublicSiteSettings(request as unknown as Request, env));


// --- Protected User Routes (require verifyJwtAuth) ---

// User Profile
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

// User's Puppies
router.get('/api/my-puppies', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  return getMyPuppies(request as unknown as Request, env, authResult.decodedToken);
});

// Puppy Health Records (for owned puppies)
router.get('/api/puppies/:puppyId/health-records', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  const params = request.params || {}; // Ensure params exist
  return getPuppyHealthRecords(request as unknown as Request, env, params as { puppyId: string }, authResult.decodedToken);
});

router.post('/api/puppies/:puppyId/health-records', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  const params = request.params || {}; // Ensure params exist
  return addPuppyHealthRecord(request as unknown as Request, env, authResult.decodedToken, params as { puppyId: string });
});

// Chat/Conversation Routes
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
  return getMessagesForConversation(request as unknown as Request, env, params as { conversationId: string }, authResult.decodedToken);
});

router.post('/api/conversations/:conversationId/messages', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResult = await verifyJwtAuth(request as unknown as Request, env);
  if (!authResult.authenticated || !authResult.decodedToken) {
    return new Response(JSON.stringify({ error: authResult.error || 'Authentication failed' }), { status: 401, headers: corsHeaders });
  }
  const params = request.params || {};
  return sendMessage(request as unknown as Request, env, params as { conversationId: string }, authResult.decodedToken);
});

// --- Admin Only Routes (require adminAuthMiddleware) ---

// User Management (Admin)
router.get('/api/admin/users', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse; // Auth failed or forbidden
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
  // Assuming createPuppy expects authResult.decodedToken as its third argument if it needs user info
  // If adminAuthMiddleware attaches user to request: (request as any).auth
  return createPuppy(request as unknown as Request, env, (request as any).auth);
});
router.put('/api/admin/puppies/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  // Similar to createPuppy, pass auth if needed
  return updatePuppy(request as unknown as Request, env, (request as any).auth);
});
router.delete('/api/admin/puppies/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
    // Similar to createPuppy, pass auth if needed
  return deletePuppy(request as unknown as Request, env, (request as any).auth);
});

// Litter Management (Admin) - Assuming functions exist in littersController
router.post('/api/admin/litters', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return createLitter(request as unknown as Request, env, (request as any).auth); // Pass auth if needed
});
router.put('/api/admin/litters/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return updateLitter(request as unknown as Request, env, (request as any).auth); // Pass auth if needed
});
router.delete('/api/admin/litters/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return deleteLitter(request as unknown as Request, env, (request as any).auth); // Pass auth if needed
});

// Stud Dog Management (Admin) - Assuming functions exist in studDogsController
router.post('/api/admin/stud-dogs', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return createStudDog(request as unknown as Request, env, (request as any).auth); // Pass auth if needed
});
router.put('/api/admin/stud-dogs/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return updateStudDog(request as unknown as Request, env, (request as any).auth); // Pass auth if needed
});
router.delete('/api/admin/stud-dogs/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return deleteStudDog(request as unknown as Request, env, (request as any).auth); // Pass auth if needed
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
  // const params = request.params || {}; // key is part of the path
  return updateSiteSetting(request as unknown as Request, env); // updateSiteSetting should get key from params
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
  // const params = request.params || {};
  return getEmailTemplateById(request as unknown as Request, env); // Controller gets ID from params
});
router.post('/api/admin/email-templates', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return createEmailTemplate(request as unknown as Request, env);
});
router.put('/api/admin/email-templates/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return updateEmailTemplate(request as unknown as Request, env); // Controller gets ID from params
});
router.delete('/api/admin/email-templates/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return deleteEmailTemplate(request as unknown as Request, env); // Controller gets ID from params
});

// Integrations (Admin)
router.get('/api/admin/integrations', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return listIntegrations(request as unknown as Request, env);
});
router.get('/api/admin/integrations/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return getIntegrationById(request as unknown as Request, env); // Controller gets ID from params
});
router.put('/api/admin/integrations/:id', async (request: IRequest, env: Env, ctx: ExecutionContext) => {
  const authResponse = await adminAuthMiddleware(request as unknown as Request, env);
  if (authResponse) return authResponse;
  return updateIntegration(request as unknown as Request, env); // Controller gets ID from params
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

// --- End of Admin Routes ---


// Catch-all for /api/* routes not matched above - This should be the LAST API route.
router.all('/api/*', () => new Response(JSON.stringify({ error: 'API endpoint not found' }), {
  status: 404,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
}));


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // If the request is for an API route, let the router handle it.
    if (url.pathname.startsWith('/api/')) {
      return router.handle(request, env, ctx)
        .catch((error) => {
          // General error handler for router issues
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
      // Handle root path - serve index.html
      if (url.pathname === '/') {
        const object = await env.STATIC_ASSETS.get('index.html');
        if (object) {
          const headers = new Headers(corsHeaders);
          headers.set('Content-Type', 'text/html');
          headers.set('Cache-Control', 'public, max-age=3600');
          return new Response(object.body, { headers });
        }
      }

      // Handle static assets
      let assetPath = url.pathname;
      
      // Remove leading slash for R2 storage
      if (assetPath.startsWith('/')) {
        assetPath = assetPath.substring(1);
      }
      
      // Try to get the exact file
      let object = await env.STATIC_ASSETS.get(assetPath);
      
      // If not found and it looks like a route, try index.html for SPA routing
      if (!object && !assetPath.includes('.')) {
        object = await env.STATIC_ASSETS.get('index.html');
        assetPath = 'index.html';
      }
      
      if (object) {
        const headers = new Headers(corsHeaders);
        
        // Set content type based on file extension
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
        
        // Set cache headers for static assets
        if (assetPath.includes('/assets/') || assetPath.endsWith('.js') || assetPath.endsWith('.css')) {
          headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year for hashed assets
        } else {
          headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour for other files
        }
        
        return new Response(object.body, { headers });
      }
      
      // File not found - return 404 for API-like requests, index.html for frontend routes
      if (url.pathname.startsWith('/api/') || assetPath.includes('.')) {
        return new Response('Not Found', { 
          status: 404, 
          headers: corsHeaders 
        });
      } else {
        // SPA fallback - serve index.html for frontend routes
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

    // Ultimate fallback
    return new Response('Not Found', { 
      status: 404, 
      headers: corsHeaders 
    });
  },
};
