import { Router, IRequest } from 'itty-router';
import { corsHeaders } from './utils/cors';
import type { Env } from './env';
import { authRoutes } from './routes/authRoutes';
import { publicRoutes } from './routes/publicRoutes';
import { protectedRoutes } from './routes/protectedRoutes';
import adminRoutes from './routes/adminRoutes';

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

// Register all route modules
authRoutes(router);
publicRoutes(router);
protectedRoutes(router);

// Register admin routes with withAuth wrapper
adminRoutes.forEach(route => {
  const wrappedRoute = {
    ...route,
    handler: async (request: Request, env: any) => {
      const authResult = await import('./utils/auth').then(auth => auth.authenticate(request, env));
      if (!authResult?.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return route.handler(request, env, authResult);
    },
  };
  
  (router as any)[route.method.toLowerCase()](route.path, wrappedRoute.handler);
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

    // Static Asset Serving Logic
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
