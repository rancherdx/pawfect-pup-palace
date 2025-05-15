
# API Integration Guide

This document outlines how the frontend connects to the backend API in the Puppy Breeder App.

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/auth/register` | POST | Register a new user | No |
| `/auth/login` | POST | Login a user | No |
| `/auth/refresh` | POST | Refresh access token | Yes (refresh token) |
| `/puppies` | GET | Get list of puppies | No |
| `/puppies/:id` | GET | Get puppy details | No |
| `/litters` | GET | Get list of litters | No |
| `/litters/:id` | GET | Get litter details | No |
| `/checkout` | POST | Process payment | Yes |
| `/admin/puppies` | POST | Create a new puppy | Yes (admin) |
| `/admin/litters` | POST | Create a new litter | Yes (admin) |

## Frontend API Utilities

The frontend uses a central API utility to handle requests, authentication, and error handling.

### Request Helper

```typescript
// API helper function in src/api/base.ts
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add auth token if available
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      // Handle token expiration
      if (response.status === 401) {
        // Try to refresh token or redirect to login
      }
      
      throw new Error('API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}
```

## Backend Worker Route Handling

The backend uses `itty-router` to handle API routes:

```typescript
// src/worker/index.ts
import { Router } from 'itty-router';
import { handleLogin, handleRegister, handleRefresh } from './controllers/auth';
import { handleGetPuppies, handleGetPuppyById } from './controllers/puppies';
import { handleGetLitters, handleGetLitterById } from './controllers/litters';
import { handleAuth } from './middleware/auth';

const router = Router();

// Public routes
router.post('/auth/register', handleRegister);
router.post('/auth/login', handleLogin);
router.post('/auth/refresh', handleRefresh);

router.get('/puppies', handleGetPuppies);
router.get('/puppies/:id', handleGetPuppyById);
router.get('/litters', handleGetLitters);
router.get('/litters/:id', handleGetLitterById);

// Protected routes
router.post('/checkout', handleAuth(), handleCheckout);

// Admin routes
router.all('/admin/*', handleAuth({ role: 'admin' }));
router.post('/admin/puppies', handleCreatePuppy);
router.post('/admin/litters', handleCreateLitter);

// Super admin routes
router.all('/admin-test/*', handleAuth({ role: 'super-admin' }));

// Worker fetch handler
export default {
  async fetch(request, env) {
    try {
      // Handle API requests
      if (request.url.includes('/api/')) {
        return router.handle(request, env);
      }
      
      // Handle static assets from R2
      if (request.url.includes('/assets/')) {
        // Serve from R2 bucket
      }
      
      // Handle all other requests with the React app
      return await handlePageRequest(request);
    } catch (e) {
      return new Response(`Server Error: ${e.message}`, { status: 500 });
    }
  }
};
```

## Authentication Middleware

The authentication middleware validates JWT tokens and enforces role-based access:

```typescript
// src/worker/middleware/auth.ts
export function handleAuth(options = {}) {
  return async (request, env) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verify(token, env.JWT_SECRET);
      
      // Check role if required
      if (options.role && (!decoded.roles || !decoded.roles.includes(options.role))) {
        return new Response('Forbidden', { status: 403 });
      }
      
      // Add user to request for handlers to use
      request.user = decoded;
      
    } catch (err) {
      return new Response('Invalid token', { status: 401 });
    }
  };
}
```

## Setup Steps for Full Integration

1. **Configure Environments**:
   - Set up development and production environments in `wrangler.toml`

2. **Initialize Database**:
   - Deploy schema with `wrangler d1 execute puppy_breeder_db --file=./schema.sql`
   - Seed initial data with `wrangler d1 execute puppy_breeder_db --file=./seed.sql`

3. **Set up Secret Keys**:
   - Add all required secrets as documented in secrets/README.md

4. **Configure Worker Routes**:
   - Ensure all API routes are registered in the router
   - Implement route handlers in controller files

5. **Deploy Worker**:
   - Deploy with `wrangler publish`

6. **Frontend Configuration**:
   - Update API URL in frontend config
   - Configure authentication services to use the API endpoints

### Connection Testing

Use the System Status page (`/system-status`) to verify API connectivity and service availability.

## Troubleshooting

Common issues and their solutions:

1. **CORS errors**: Verify CORS headers in the Worker
2. **Authentication failures**: Check JWT configuration and secret keys
3. **Database connection issues**: Verify D1 binding in wrangler.toml
4. **Missing environment variables**: Ensure all secrets are properly set
