
import { Router } from 'itty-router';
import { verifyAuth } from './auth';
import * as puppiesController from './controllers/puppies';
import * as usersController from './controllers/users';
import * as littersController from './controllers/litters';
import { corsHeaders } from './utils/cors';
import { handleApiError } from './utils/errors';

// Create a new router
const router = Router();

// Authentication middleware
const authMiddleware = async (request: Request, env: any) => {
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
router.options('*', (request) => {
  return new Response(null, {
    headers: corsHeaders
  });
});

// Public routes
router.get('/api/puppies', puppiesController.getAllPuppies);
router.get('/api/puppies/:id', puppiesController.getPuppyById);
router.get('/api/litters', littersController.getAllLitters);
router.get('/api/litters/:id', littersController.getLitterById);

// Protected routes
router.post('/api/puppies', authMiddleware, puppiesController.createPuppy);
router.put('/api/puppies/:id', authMiddleware, puppiesController.updatePuppy);
router.delete('/api/puppies/:id', authMiddleware, puppiesController.deletePuppy);

router.post('/api/litters', authMiddleware, littersController.createLitter);
router.put('/api/litters/:id', authMiddleware, littersController.updateLitter);
router.delete('/api/litters/:id', authMiddleware, littersController.deleteLitter);

// User routes
router.post('/api/login', usersController.login);
router.post('/api/register', usersController.register);
router.get('/api/user', authMiddleware, usersController.getCurrentUser);
router.post('/api/logout', authMiddleware, usersController.logout);

// Serve static assets via Pages
router.get('*', async (request) => {
  // This will be handled by Cloudflare Pages for the frontend
  return fetch(request);
});

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    try {
      // Handle the request with the router
      const response = await router.handle(request, env, ctx);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Register Durable Object class
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
