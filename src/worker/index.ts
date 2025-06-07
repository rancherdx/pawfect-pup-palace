import { handleAuth } from './controllers/auth';
import { handlePuppies, handleMyPuppies } from './controllers/puppies';
import { handleLitters } from './controllers/litters';
import { handleAdmin } from './controllers/admin';
import { handleUpload } from './controllers/upload';
import { handleBlog } from './controllers/blog';
import { handleStudDogs } from './controllers/stud-dogs';
import { handleUser } from './controllers/user';
import { handleSettings } from './controllers/settings';
import { corsHeaders } from './utils/cors';

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // API Routes - handle these first
    if (url.pathname.startsWith('/api/')) {
      const apiPath = url.pathname.replace('/api', '');
      
      try {
        // Authentication routes
        if (apiPath.startsWith('/auth/')) {
          return await handleAuth(request, env, apiPath);
        }
        
        // Puppies routes
        if (apiPath.startsWith('/puppies')) {
          return await handlePuppies(request, env, apiPath);
        }
        
        if (apiPath.startsWith('/my-puppies')) {
          return await handleMyPuppies(request, env);
        }
        
        // Litters routes
        if (apiPath.startsWith('/litters')) {
          return await handleLitters(request, env, apiPath);
        }
        
        // Blog routes
        if (apiPath.startsWith('/blog')) {
          return await handleBlog(request, env, apiPath);
        }
        
        // Stud dogs routes
        if (apiPath.startsWith('/stud-dogs')) {
          return await handleStudDogs(request, env, apiPath);
        }
        
        // User routes
        if (apiPath.startsWith('/user')) {
          return await handleUser(request, env, apiPath);
        }
        
        // Upload routes
        if (apiPath.startsWith('/upload')) {
          return await handleUpload(request, env);
        }
        
        // Settings routes
        if (apiPath.startsWith('/settings')) {
          return await handleSettings(request, env, apiPath);
        }
        
        // Admin routes
        if (apiPath.startsWith('/admin/')) {
          return await handleAdmin(request, env, apiPath);
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
