import { corsHeaders } from '../utils/cors';
import { hashPassword, createJWT } from '../auth';
import type { Env } from '../env';

function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export async function checkSetupStatus(request: Request, env: Env): Promise<Response> {
  try {
    // Check if any admin users exist
    const adminUsers = await env.PUPPIES_DB
      .prepare('SELECT COUNT(*) as count FROM users WHERE roles LIKE ?')
      .bind('%"admin"%')
      .first<{ count: number }>();

    const setupRequired = !adminUsers || adminUsers.count === 0;

    return new Response(JSON.stringify({ setupRequired }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error checking setup status:', error);
    return createErrorResponse('Setup status check failed', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

export async function createFirstAdmin(request: Request, env: Env): Promise<Response> {
  try {
    // First check if setup is still needed
    const adminUsers = await env.PUPPIES_DB
      .prepare('SELECT COUNT(*) as count FROM users WHERE roles LIKE ?')
      .bind('%"admin"%')
      .first<{ count: number }>();

    if (adminUsers && adminUsers.count > 0) {
      return createErrorResponse('Setup already completed', 'Administrator account already exists', 400);
    }

    const { name, email, password } = await request.json() as { name?: string, email?: string, password?: string };

    // Validation
    const validationErrors: string[] = [];
    if (!name || name.trim().length === 0) {
      validationErrors.push('Name is required.');
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      validationErrors.push('Valid email is required.');
    }
    if (!password || password.length < 8) {
      validationErrors.push('Password must be at least 8 characters long.');
    }

    if (validationErrors.length > 0) {
      return createErrorResponse('Validation failed', validationErrors.join(' '), 400);
    }

    // Check if email already exists
    const existingUser = await env.PUPPIES_DB
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingUser) {
      return createErrorResponse('Email already in use', null, 400);
    }

    // Create admin user
    const hashedPassword = await hashPassword(password);
    const adminRoles = JSON.stringify(['admin', 'user']); // Admin has both admin and user roles
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.PUPPIES_DB
      .prepare('INSERT INTO users (id, email, password_hash, name, roles, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(userId, email, hashedPassword, name, adminRoles, now, now)
      .run();

    // Create JWT for immediate login
    const jwt = await createJWT({ userId, email, roles: ['admin', 'user'] }, env);

    return new Response(JSON.stringify({
      success: true,
      message: 'Administrator account created successfully',
      jwt,
      user: { id: userId, email, name, roles: ['admin', 'user'] }
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating first admin:', error);
    return createErrorResponse('Setup failed', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}
