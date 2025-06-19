
// Authentication utility functions for Cloudflare Worker
import jwt from 'jsonwebtoken';

interface AuthResult {
  userId: string;
  role: string;
  roles?: string[];
}

export async function authenticate(request: Request, env: any): Promise<AuthResult | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    if (!token || !env.JWT_SECRET) {
      return null;
    }

    // Verify the JWT token
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    if (!decoded.userId) {
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
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string, secret: string): any {
  return jwt.verify(token, secret);
}
