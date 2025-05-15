
# Authentication System

This document outlines how authentication works in the Puppy Breeder App.

## Architecture Overview

The application uses JWT (JSON Web Tokens) for stateless authentication with token refresh functionality. Authentication data is stored in Cloudflare KV for persistence.

## Key Components

1. **JWT Token Generation and Validation**
2. **Password Hashing using bcrypt**
3. **User Sessions Management**
4. **Role-based Authorization**

## Setup Instructions

### 1. Configure Environment Variables

Make sure the following secrets are set in your Cloudflare Worker:

```bash
wrangler secret put JWT_SECRET
# Use a strong random string, min 32 characters
```

### 2. Initialize KV Namespace

```bash
wrangler kv:namespace create AUTH_STORE
# Add the binding to wrangler.toml
```

### 3. Add KV Binding to wrangler.toml

```toml
kv_namespaces = [
  { binding = "AUTH_STORE", id = "your-kv-namespace-id" }
]
```

## Authentication Flow

1. **Registration**:
   - Client sends email, password, and user details
   - Server hashes password with bcrypt
   - Server stores user in D1 database
   - Server returns JWT

2. **Login**:
   - Client sends email and password
   - Server verifies against hashed password in database
   - If valid, server generates JWT and stores refresh token in KV
   - Server returns access token and refresh token to client

3. **Token Refresh**:
   - Client sends refresh token
   - Server validates refresh token against KV
   - If valid, server issues new access token
   - Server returns new access token to client

4. **Protected Endpoints**:
   - Client includes access token in Authorization header
   - Server validates token signature and expiration
   - If valid, server processes the request
   - If invalid, server returns 401 Unauthorized

## Code Implementation

### JWT Generation (src/worker/auth.ts)

```typescript
import { sign, verify } from 'jsonwebtoken';

export async function generateToken(user) {
  const token = sign(
    { 
      sub: user.id, 
      email: user.email,
      roles: user.roles
    },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  return token;
}
```

### User Authentication (src/worker/controllers/auth.ts)

```typescript
import bcrypt from 'bcryptjs';

export async function login(email, password, env) {
  // Get user from database
  const stmt = env.PUPPIES_DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email);
  
  const user = await stmt.first();
  
  if (!user) {
    return new Response('Invalid email or password', { status: 401 });
  }
  
  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password);
  
  if (!passwordMatch) {
    return new Response('Invalid email or password', { status: 401 });
  }
  
  // Generate tokens
  const accessToken = await generateToken(user);
  const refreshToken = crypto.randomUUID();
  
  // Store refresh token
  await env.AUTH_STORE.put(
    `refresh_token:${refreshToken}`,
    JSON.stringify({ userId: user.id }),
    { expirationTtl: 60 * 60 * 24 * 7 } // 1 week
  );
  
  return new Response(JSON.stringify({ 
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: JSON.parse(user.roles)
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## Frontend Integration

In `AuthContext.tsx`, the application handles JWT storage, refresh, and API communication.

### Key Frontend Features

1. **Token Storage**: Tokens are stored in localStorage with appropriate expiry settings
2. **Token Refresh**: Automatic token refresh before expiration
3. **Request Authorization**: Adding Authorization headers to API requests
4. **Authentication State**: Managing login state across the application

## Super Admin Setup

To set up the initial super admin accounts for Gsawyer and Drancher:

1. Create a seed file with initial users
2. Run the seed script on deployment 
3. Force password change on first login

## Security Best Practices

1. Always use HTTPS for all communications
2. Store hashed passwords only (never plain text)
3. Implement rate limiting on authentication endpoints
4. Use short-lived access tokens with refresh functionality
5. Implement proper CORS configuration
6. Audit authentication attempts
