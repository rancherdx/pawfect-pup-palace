import { Router, IRequest } from 'itty-router';
import { corsHeaders } from './utils/cors';
import type { Env } from './env';
import { authRoutes } from './routes/authRoutes';
import { publicRoutes } from './routes/publicRoutes';
import { protectedRoutes } from './routes/protectedRoutes';
import { squareRoutes } from './routes/squareRoutes';
import adminRoutes from './routes/adminRoutes';
import { authenticate } from './utils/auth';
import { serveSwaggerUI, serveSwaggerSpec } from './swagger/ui';
import { RedisClient, RedisUtils } from './redis/client';

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

// Swagger documentation routes
router.get('/api/docs', () => serveSwaggerUI());
router.get('/api/swagger.json', () => serveSwaggerSpec());

// Register all route modules
authRoutes(router);
publicRoutes(router);
protectedRoutes(router);
squareRoutes(router);

// Register admin routes with proper authentication
adminRoutes.forEach(route => {
  const wrappedHandler = async (request: Request, env: Env) => {
    try {
      const authResult = await authenticate(request, env);
      if (!authResult?.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Check for admin role if required
      const userRoles = authResult.roles || [];
      if (!userRoles.includes('admin') && !userRoles.includes('super-admin')) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return route.handler(request, env, authResult);
    } catch (error) {
      console.error('Admin route error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  };
  
  (router as unknown)[route.method.toLowerCase()](route.path, wrappedHandler);
});

// Catch-all for /api/* routes not matched above
router.all('/api/*', () => new Response(JSON.stringify({ error: 'API endpoint not found' }), {
  status: 404,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
}));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Initialize Redis client for this request
    const redis = new RedisClient(env);
    const redisUtils = new RedisUtils(redis);
    
    // Add Redis instances to env for use in controllers
    (env as any).redis = redis;
    (env as any).redisUtils = redisUtils;

    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      return router.handle(request, env, ctx)
        .catch((error) => {
          console.error('Router Error:', error);
          return new Response(JSON.stringify({ 
            error: 'Internal Server Error', 
            details: env.ENV === 'development' ? error.message : undefined 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        });
    }

    // Static Asset Serving Logic
    try {
      // Serve index.html for root path
      if (url.pathname === '/') {
        const object = await env.STATIC_ASSETS.get('index.html');
        if (object) {
          const headers = new Headers(corsHeaders);
          headers.set('Content-Type', 'text/html');
          headers.set('Cache-Control', 'public, max-age=3600');
          return new Response(object.body, { headers });
        }
      }

      let assetPath = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
      let object = await env.STATIC_ASSETS.get(assetPath);
      
      // Fallback to index.html for SPA routing
      if (!object && !assetPath.includes('.')) {
        object = await env.STATIC_ASSETS.get('index.html');
        assetPath = 'index.html';
      }
      
      if (object) {
        const headers = new Headers(corsHeaders);
        
        // Set proper content types
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
        
        // Set cache headers
        if (assetPath.includes('/assets/') || assetPath.endsWith('.js') || assetPath.endsWith('.css')) {
          headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          headers.set('Cache-Control', 'public, max-age=3600');
        }
        
        return new Response(object.body, { headers });
      }
      
      // 404 for missing assets or API endpoints
      if (url.pathname.startsWith('/api/') || assetPath.includes('.')) {
        return new Response('Not Found', { 
          status: 404, 
          headers: corsHeaders 
        });
      } else {
        // SPA fallback
        const indexObject = await env.STATIC_ASSETS.get('index.html');
        if (indexObject) {
          const headers = new Headers(corsHeaders);
          headers.set('Content-Type', 'text/html');
          headers.set('Cache-Control', 'public, max-age=3600');
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
