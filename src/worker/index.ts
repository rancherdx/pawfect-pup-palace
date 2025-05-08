import { Router } from 'itty-router';
import { verifyAuth } from './auth';
import * as puppiesController from './controllers/puppies';
import * as usersController from './controllers/users';
import * as littersController from './controllers/litters';
import { corsHeaders } from './utils/cors';
import { handleApiError } from './utils/errors';

// Add type definitions for Cloudflare Workers types
interface Env {
  PUPPIES_DB: D1Database;
  AUTH_STORE: KVNamespace;
  PUPPY_IMAGES: R2Bucket;
  SESSIONS: DurableObjectNamespace;
  ENV: string;
}

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
  // Return auth result so it can be used in the next handler
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

// Protected routes - we need to modify how we handle authentication and pass the auth result
router.post('/api/puppies', async (request: Request, env: Env) => {
  const authResult = await authMiddleware(request, env);
  // If authMiddleware returned a Response, it means authentication failed
  if (authResult instanceof Response) return authResult;
  // Otherwise, pass the request, env and authResult to the controller
  return puppiesController.createPuppy(request, env, authResult);
});

router.put('/api/puppies/:id', async (request: Request, env: Env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return puppiesController.updatePuppy(request, env, authResult);
});

router.delete('/api/puppies/:id', async (request: Request, env: Env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return puppiesController.deletePuppy(request, env, authResult);
});

router.post('/api/litters', async (request: Request, env: Env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return littersController.createLitter(request, env, authResult);
});

router.put('/api/litters/:id', async (request: Request, env: Env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return littersController.updateLitter(request, env, authResult);
});

router.delete('/api/litters/:id', async (request: Request, env: Env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return littersController.deleteLitter(request, env, authResult);
});

// User routes
router.post('/api/login', usersController.login);
router.post('/api/register', usersController.register);

router.get('/api/user', async (request: Request, env: Env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return usersController.getCurrentUser(request, env, authResult);
});

router.post('/api/logout', async (request: Request, env: Env) => {
  const authResult = await authMiddleware(request, env);
  if (authResult instanceof Response) return authResult;
  return usersController.logout(request, env, authResult);
});

// Serve static assets via Pages
router.get('*', async (request) => {
  // This will be handled by Cloudflare Pages for the frontend
  return fetch(request);
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Handle the request with the router
      const response = await router.handle(request, env, ctx);
      return response;
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Define interface for DurableObjectState
interface DurableObjectState {
  storage: {
    get(key: string): Promise<any>;
    put(key: string, value: any): Promise<void>;
    delete(key: string): Promise<boolean>;
  };
}

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

// Add D1Database, KVNamespace, R2Bucket, and DurableObjectNamespace interfaces
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = any>(): Promise<T | null>;
  run<T = any>(): Promise<D1Result<T>>;
  all<T = any>(): Promise<D1Result<T>>;
}

interface D1Result<T = any> {
  results: T[];
  success: boolean;
  meta: {
    last_row_id: number;
    changes: number;
    duration: number;
  };
}

interface KVNamespace {
  get(key: string, options?: any): Promise<string | null>;
  put(key: string, value: string, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
}

interface R2Bucket {
  put(key: string, value: ReadableStream | ArrayBuffer): Promise<R2Object>;
  get(key: string): Promise<R2Object | null>;
  delete(key: string): Promise<void>;
}

interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  checksums: {
    md5?: string;
    sha1?: string;
    sha256?: string;
    sha384?: string;
    sha512?: string;
  };
  uploaded: Date;
  httpMetadata: {
    contentType: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
    cacheExpiry?: Date;
  };
  customMetadata: Record<string, string>;
}

interface DurableObjectNamespace {
  idFromName(name: string): DurableObjectId;
  idFromString(id: string): DurableObjectId;
  get(id: DurableObjectId): DurableObject;
}

interface DurableObjectId {
  toString(): string;
}

interface DurableObject {
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
}
