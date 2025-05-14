
import { Router } from 'itty-router';
import { verifyAuth } from './auth';
import * as puppiesController from './controllers/puppies';
import * as usersController from './controllers/users';
import * as littersController from './controllers/litters';
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

// Auth middleware
const authMiddleware = async (request: Request, env: Env): Promise<Response | any> => {
  const authResult = await verifyAuth(request, env);
  if (!authResult.authenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  return authResult;
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

router.get('/api/user', async (req, env) => {
  const auth = await authMiddleware(req, env);
  if (auth instanceof Response) return auth;
  return usersController.getCurrentUser(req, env, auth);
});

router.post('/api/logout', async (req, env) => {
  const auth = await authMiddleware(req, env);
  if (auth instanceof Response) return auth;
  return usersController.logout(req, env);
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
