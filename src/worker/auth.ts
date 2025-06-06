import type { Env } from './env'; // Import Env
import { corsHeaders } from './utils/cors'; // For error responses

// In production, JWT_SECRET should be a secure environment variable
// const JWT_SECRET = 'your-jwt-secret-key'; // Original hardcoded, will use env.JWT_SECRET

// Helper for consistent error responses
function createAuthErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Existing verifyAuth based on KV session token - keep for existing uses if any
export async function verifySessionAuth(request: Request, env: Env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) { // This typically expects a session token, not JWT
    return { authenticated: false, error: "No token provided" };
  }
  
  const token = authHeader.split(' ')[1]; // This is the session token
  
  try {
    const sessionJson = await env.AUTH_STORE.get(`session:${token}`);
    if (!sessionJson) {
      return { authenticated: false, error: "Invalid session token" };
    }
    
    const sessionData = JSON.parse(sessionJson);
    
    if (sessionData.expiresAt < Date.now()) {
      await env.AUTH_STORE.delete(`session:${token}`);
      return { authenticated: false, error: "Session expired" };
    }
    
    // Ensure roles is an array, even if KV store had singular 'role'
    let rolesArray = ['user']; // Default
    if (sessionData.roles && Array.isArray(sessionData.roles)) {
        rolesArray = sessionData.roles;
    } else if (sessionData.role && typeof sessionData.role === 'string') { // Compatibility for old 'role'
        rolesArray = [sessionData.role];
    }

    return {
      authenticated: true,
      userId: sessionData.userId,
      email: sessionData.email, // Added email
      roles: rolesArray // Ensure roles is an array
    };
  } catch (error) {
    console.error('Session auth verification error:', error);
    return { authenticated: false, error: "Auth verification failed" };
  }
}


// --- JWT Related Functions ---

// Modified to use env.JWT_SECRET
async function hmacSha256(secret: string, data: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", key, encoder.encode(data));
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBuffer(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

export async function createJWT(payload: object, env: Env, expiresInDays: number = 7): Promise<string> {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  const header = { alg: "HS256", typ: "JWT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (expiresInDays * 24 * 60 * 60);

  const fullPayload = { ...payload, iat, exp };

  const encodedHeader = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = bufferToBase64Url(new TextEncoder().encode(JSON.stringify(fullPayload)));

  const signatureArrayBuffer = await hmacSha256(env.JWT_SECRET, `${encodedHeader}.${encodedPayload}`);
  const signature = bufferToBase64Url(signatureArrayBuffer);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function verifyJWT(token: string, env: Env): Promise<any | null> {
  if (!env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables for verification.");
    return null;
  }
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) {
      return null; // Invalid token format
    }

    const expectedSignatureArrayBuffer = await hmacSha256(env.JWT_SECRET, `${encodedHeader}.${encodedPayload}`);
    const expectedSignature = bufferToBase64Url(expectedSignatureArrayBuffer);

    if (signature !== expectedSignature) {
      console.warn("JWT signature mismatch");
      return null; // Signature verification failed
    }

    const payloadData = new TextDecoder().decode(base64UrlToBuffer(encodedPayload));
    const payload = JSON.parse(payloadData);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.warn("JWT expired");
      return null; // Token expired
    }
    
    // Ensure roles is an array in the payload
    if (payload.roles && !Array.isArray(payload.roles)) {
        console.warn("JWT 'roles' field is not an array, attempting conversion.");
        if (typeof payload.roles === 'string') {
            try {
                // Attempt to parse if it's a JSON string array, or wrap if it's a single role string
                payload.roles = JSON.parse(payload.roles);
            } catch (e) {
                payload.roles = [payload.roles]; // Treat as a single role in an array
            }
        } else {
             payload.roles = ['user']; // Default if conversion is not straightforward
        }
    } else if (!payload.roles) {
        payload.roles = ['user']; // Default if roles field is missing
    }


    return payload; // Token is valid
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

// New JWT Authentication function for middleware
export async function verifyJwtAuth(request: Request, env: Env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: "Authorization header missing or malformed (Bearer JWT expected)." };
  }
  const token = authHeader.split(' ')[1];
  const decodedToken = await verifyJWT(token, env);

  if (!decodedToken) {
    return { authenticated: false, error: "Invalid or expired JWT." };
  }
  return { authenticated: true, decodedToken };
}

// New Admin Authentication Middleware (using JWT)
export async function adminAuthMiddleware(request: Request, env: Env): Promise<Response | void> {
  const authResult = await verifyJwtAuth(request, env);

  if (!authResult.authenticated || !authResult.decodedToken) {
    return createAuthErrorResponse("Unauthorized", authResult.error || "Authentication failed.", 401);
  }

  const roles = authResult.decodedToken.roles; // Should be an array from verifyJWT
  if (!Array.isArray(roles) || (!roles.includes('admin') && !roles.includes('super-admin'))) {
    return createAuthErrorResponse("Forbidden", "You do not have administrative privileges.", 403);
  }

  // If execution reaches here, user is an admin.
  // Attach decoded token to request for use in subsequent handlers (optional, but good practice)
  (request as any).auth = authResult.decodedToken;
}


// --- Utility functions from original auth.ts, kept for compatibility if used elsewhere ---
export async function generateToken(length = 32) {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}
