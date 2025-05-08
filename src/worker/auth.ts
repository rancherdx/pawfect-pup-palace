
import { createHash } from 'crypto';

export async function verifyAuth(request: Request, env: any) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false };
  }
  
  const token = authHeader.split(' ')[1];
  
  // Check if the token exists in KV store
  const session = await env.AUTH_STORE.get(`session:${token}`);
  
  if (!session) {
    return { authenticated: false };
  }
  
  // Parse the session data
  const sessionData = JSON.parse(session);
  
  // Check if the session has expired
  if (sessionData.expiresAt < Date.now()) {
    await env.AUTH_STORE.delete(`session:${token}`);
    return { authenticated: false };
  }
  
  return {
    authenticated: true,
    userId: sessionData.userId,
    role: sessionData.role
  };
}

export async function generateToken(length = 32) {
  // In production, use crypto.getRandomValues() instead
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string) {
  // In a real implementation, use a proper password hashing library with salt
  // This is a simplified version for the example
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}
