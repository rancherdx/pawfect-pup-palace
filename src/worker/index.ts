import { Router } from 'itty-router';
import { verifyAuth } from './auth';
import * as puppiesController from './controllers/puppies';
import * as usersController from './controllers/users';
import * as littersController from './controllers/litters';
import { corsHeaders } from './utils/cors';
import { handleApiError } from './utils/errors';
import type { Env } from './env';

// Define the context interface
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

// Create a new router
const router = Router();

// Authentication middleware
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

// CORS preflight
router.options('*', () => new Response(null, { headers: corsHeaders }));

// Public routes
router.get('/api/puppies', puppiesController.getAllPuppies);
router.get('/api/puppies/:id', puppiesController.getPuppyById);
router.get('/api/litters', littersController.getAllLitters);
router.get('/api/litters/:id', littersController.getLitterById);

// Protected routes
router.post('/api/puppies', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return puppiesController.createPuppy(request, env, authResult);
});

router.put('/api/puppies/:id', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return puppiesController.updatePuppy(request, env, authResult);
});

router.delete('/api/puppies/:id', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return puppiesController.deletePuppy(request, env, authResult);
});

router.post('/api/litters', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return littersController.createLitter(request, env, authResult);
});

router.put('/api/litters/:id', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return littersController.updateLitter(request, env, authResult);
});

router.delete('/api/litters/:id', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return littersController.deleteLitter(request, env, authResult);
});

// User routes
router.post('/api/login', usersController.login);
router.post('/api/register', usersController.register);

router.get('/api/user', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return usersController.getCurrentUser(request, env, authResult);
});

router.post('/api/logout', async (request, env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return usersController.logout(request, env, authResult);
});

// Static asset fallback
router.get('*', async (request) => fetch(request));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const response = await router.handle(request, env);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Durable Object definition
interface DurableObjectState {
  storage: {
    get(key: string): Promise<any>;
    put(key: string, value: any): Promise<void>;
    delete(key: string): Promise<boolean>;
  };
}

export class SessionDO {
  private state: DurableObjectState;
  
  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === "/get") {
      const sessionId = url.searchParams.get('sessionId');
      if (!sessionId) return new Response("Session ID required", { status: 400 });
      const session = await this.state.storage.get(sessionId);
      return new Response(JSON.stringify({ session }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === "/set" && request.method === "POST") {
      const { sessionId, data } = await request.json();
      if (!sessionId || !data) return new Response("Session ID and data required", { status: 400 });
      await this.state.storage.put(sessionId, data);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response("Not found", { status: 404 });
  }
}