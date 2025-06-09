
import { getMyConversations, getMessagesForConversation, sendMessage, startConversation } from './controllers/chat';
import { corsHeaders } from './utils/cors';
import type { Env } from './env';
// Import authentication functions if you're using them directly in the router
// import { verifyJwtAuth, adminAuthMiddleware } from './auth';
// Import controller functions
// import { login, register, getCurrentUser } from './controllers/users';

//
// IMPORTANT: ROUTING AND AUTH MIDDLEWARE APPLICATION
//
// This basic `fetch` function in `index.ts` is suitable for serving static assets
// and very simple API endpoints. For a more complex application, you'll need a
// proper router (like itty-router, Hono, or Cloudflare's built-in router for Workers)
// to handle different API routes, methods, and parameters.
//
// Authentication middleware (`verifyJwtAuth` and `adminAuthMiddleware` from
// `./auth.ts`) should be applied at the router level before calling protected
// controller functions.
//
// Conceptual Example with itty-router:
//
// import { Router } from 'itty-router';
// import { verifyJwtAuth, adminAuthMiddleware } from './auth';
// import { getCurrentUser, listUsers } from './controllers/users';
// import { createPuppy } from './controllers/puppies';
//
// const router = Router();
//
// // Public routes
// router.post('/api/login', login);
// router.post('/api/register', register);
//
// // Protected user routes (example)
// router.get('/api/users/me', async (request, env, ctx) => {
//   const authResult = await verifyJwtAuth(request, env);
//   if (!authResult.authenticated) {
//     return new Response(JSON.stringify({ error: authResult.error }), { status: 401, headers: corsHeaders });
//   }
//   // Pass authResult or specific parts (like userId) to the controller
//   return getCurrentUser(request, env, authResult.decodedToken);
// });
//
// router.post('/api/puppies', async (request, env, ctx) => {
//   const authResult = await verifyJwtAuth(request, env);
//   if (!authResult.authenticated) {
//     return new Response(JSON.stringify({ error: authResult.error }), { status: 401, headers: corsHeaders });
//   }
//   return createPuppy(request, env, authResult.decodedToken);
// });
//
// // Protected admin routes (example)
// router.get('/api/admin/users', async (request, env, ctx) => {
//   const adminAuthResponse = await adminAuthMiddleware(request, env);
//   if (adminAuthResponse) { // adminAuthMiddleware returns a Response if auth fails
//     return adminAuthResponse;
//   }
//   // If adminAuthMiddleware passes, (request as any).auth will have the decoded token.
//   // You can then call the controller function.
//   return listUsers(request, env); // listUsers might expect (request as any).auth
// });
//
// export default {
//   async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
//     if (url.pathname.startsWith('/api/')) { // Basic check
//        return router.handle(request, env, ctx)
//          .catch(error => { /* handle errors from router */ })
//          .then(response => { /* ensure CORS headers on router responses */ });
//     }
//     // ... rest of your static asset serving logic ...
//   }
// }
//
// Remember to adapt this conceptual example to the specific router and structure
// you choose for your application. The key is that `verifyJwtAuth` and
// `adminAuthMiddleware` are called *before* your actual controller logic for
// protected routes.
//

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // API Routes - handle these first
    // Recommendation: Implement rate limiting for sensitive endpoints, especially
    // authentication routes like /api/login and /api/register, as part of
    // production readiness. This can be done using Cloudflare's Rate Limiting
    // product or custom logic (e.g., with Durable Objects).
    if (url.pathname.startsWith('/api/')) {
      const apiPath = url.pathname.replace('/api', '');
      
      try {
        // Chat routes
        if (apiPath.startsWith('/chat/')) {
          // For now, return a simple message until we implement auth
          return new Response(JSON.stringify({ message: 'Chat API coming soon' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // API route not found
        return new Response(
          JSON.stringify({ error: 'API endpoint not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        console.error('API Error:', error);
        return new Response(
          JSON.stringify({ error: 'Internal server error' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Static file serving for frontend assets
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
