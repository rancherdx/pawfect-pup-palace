
// Authentication utility functions for Cloudflare Worker
import { verifyJWT } from '../auth';
import type { Env } from '../env';

interface AuthResult {
  userId: string;
  role: string;
  roles?: string[];
}

export async function authenticate(request: Request, env: Env): Promise<AuthResult | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    if (!token || !env.JWT_SECRET) {
      return null;
    }

    // Verify the JWT token using the existing auth system
    const decoded = await verifyJWT(token, env);
    
    if (!decoded || !decoded.userId) {
      return null;
    }

    return {
      userId: decoded.userId,
      role: decoded.role || 'user',
      roles: decoded.roles || []
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function generateToken(payload: any, secret: string, expiresIn: string = '24h'): string {
  // This function is now handled by createJWT in ../auth.ts
  throw new Error('Use createJWT from ../auth.ts instead');
}

export function verifyToken(token: string, secret: string): any {
  // This function is now handled by verifyJWT in ../auth.ts
  throw new Error('Use verifyJWT from ../auth.ts instead');
}
