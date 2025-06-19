import { getAllLitters, getLitterById, createLitter, updateLitter, deleteLitter } from '../controllers/litters';
import { authenticate } from '../utils/auth';

// Define the structure for route handlers with authentication
interface Route {
  method: string;
  path: string;
  handler: (request: Request, env: any, authResult: any) => Promise<Response> | Response;
  auth?: boolean;
}

// Define the structure for public route handlers
interface PublicRoute {
  method: string;
  path: string;
  handler: (request: Request, env: any) => Promise<Response> | Response;
}

// Authentication middleware
const withAuth = (route: Route) => {
  return {
    ...route,
    handler: async (request: Request, env: any) => {
      const authResult = await authenticate(request, env);
      if (!authResult?.userId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return route.handler(request, env, authResult);
    },
  };
};

// Public Routes
const publicRoutes: PublicRoute[] = [
  // Health check endpoint
  {
    method: 'GET',
    path: '/health',
    handler: async () => {
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    },
  },
];

// Admin Routes
const adminRoutes = [
  // Litters
  {
    method: 'GET',
    path: '/admin/litters',
    handler: async (request, env, authResult) => {
      return getAllLitters(request, env);
    },
  },
  {
    method: 'GET',
    path: '/admin/litters/:id',
    handler: async (request, env, authResult) => {
      return getLitterById(request, env);
    },
  },
  {
    method: 'POST',
    path: '/admin/litters',
    handler: async (request, env, authResult) => {
      return createLitter(request, env, authResult);
    },
  },
  {
    method: 'PUT',
    path: '/admin/litters/:id',
    handler: async (request, env, authResult) => {
      return updateLitter(request, env, authResult);
    },
  },
  {
    method: 'DELETE',
    path: '/admin/litters/:id',
    handler: async (request, env, authResult) => {
      return deleteLitter(request, env, authResult);
    },
  },
];

export default adminRoutes;
