
const JWT_SECRET = 'your-jwt-secret-key'; // In production, this should be an environment variable

export async function verifyAuth(request: Request, env: any) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false };
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
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
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false };
  }
}

export async function generateToken(length = 32) {
  // In production, use crypto.getRandomValues() instead
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function createJWT(payload: any, expiresIn = '7d') {
  // Simple JWT implementation - in production use a proper JWT library
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseExpiration(expiresIn);
  
  const data = {
    ...payload,
    iat: now,
    exp
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(data));
  
  const signature = createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function createSignature(data: string, secret: string) {
  // This is a simplified version - in production use a proper HMAC implementation
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const keyBuffer = encoder.encode(secret);
  
  // For demonstration only - in production use proper crypto functions
  // This is not secure, just for demonstration
  let hash = 0;
  for (let i = 0; i < dataBuffer.length; i++) {
    hash = ((hash << 5) - hash) + dataBuffer[i] + keyBuffer[i % keyBuffer.length];
    hash |= 0; // Convert to 32bit integer
  }
  
  return btoa(hash.toString());
}

function parseExpiration(expiresIn: string): number {
  const unit = expiresIn.charAt(expiresIn.length - 1);
  const value = parseInt(expiresIn.slice(0, -1));
  
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 24 * 60 * 60;
    default:
      return 60 * 60 * 24 * 7; // Default 7 days
  }
}

export async function hashPassword(password: string) {
  // In a real implementation, use a proper password hashing library with salt
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const [encodedHeader, encodedPayload, signature] = parts;
    
    // Verify signature
    const expectedSignature = createSignature(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
    
    if (expectedSignature !== signature) {
      return null;
    }
    
    // Decode payload
    const payload = JSON.parse(atob(encodedPayload));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}
