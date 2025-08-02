import type { Env } from './env'; // Import Env
import { corsHeaders } from './utils/cors'; // For error responses
import bcrypt from 'bcryptjs';

// In production, JWT_SECRET should be a secure environment variable
// const JWT_SECRET = 'your-jwt-secret-key'; // Original hardcoded, will use env.JWT_SECRET

// Helper for consistent error responses
function createAuthErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
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

export async function verifyJWT(token: string, env: Env): Promise<Record<string, unknown> | null> {
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
  (request as Record<string, unknown>).auth = authResult.decodedToken;
}

// Removed generateToken (simple string generator) as it's no longer needed.
// hashPassword remains as it's used for password hashing with bcrypt.

export async function hashPassword(password: string): Promise<string> {
  // Password migration strategy:
  // 1. Add a new boolean column to the users table, e.g., `is_password_bcrypt_hashed`.
  // 2. When a user tries to log in:
  //    - If `is_password_bcrypt_hashed` is true, use `bcrypt.compareSync` (or `bcrypt.compare`).
  //    - If false (or null), attempt to verify with the old SHA-256 hash.
  //      - If successful, re-hash the password with bcrypt, save it, set `is_password_bcrypt_hashed` to true, and then proceed with login.
  //      - If SHA-256 verification also fails, then it's an invalid password.
  // This allows for gradual migration without forcing all users to reset at once.
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
}
