// src/worker/controllers/users.ts

// IMPORTANT SECURITY CONSIDERATIONS:
// 1. Rate Limiting: Endpoints like login and register are susceptible to brute-force
//    and enumeration attacks. Implement rate limiting using Cloudflare's Rate Limiting
//    product, or by building a custom solution (e.g., with Durable Objects to track attempts).
// 2. Input Sanitization & Output Encoding: While this API primarily deals with JSON,
//    always validate and sanitize inputs. If any user-controlled data were to be
//    reflected in HTML without proper framework (like React/Vue) escaping, it could
//    lead to XSS. For API responses, ensure content types are correctly set (e.g., application/json)
//    and that data is structured to prevent injection into client-side scripts if consumers
//    are not careful. The primary focus here is robust input validation for backend integrity.

import { corsHeaders } from '../utils/cors';
import { hashPassword, createJWT } from '../auth';
import bcrypt from 'bcryptjs';
import type { Env } from '../env';
import { sendTemplatedEmail } from '../utils/emailService'; // Added import

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | string[] | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export async function login(request: Request, env: Env) { // Changed env type to Env
  try {
    const { email, password } = await request.json() as { email?: string, password?: string };
    
    const validationErrors: string[] = [];
    if (!email) {
      validationErrors.push('Email is required.');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.push('Invalid email format.');
    }
    if (!password) {
      validationErrors.push('Password is required.');
    }

    if (validationErrors.length > 0) {
      return createErrorResponse('Login failed due to validation errors.', validationErrors, 400);
    }
    
    const userResult = await env.PUPPIES_DB
      .prepare('SELECT id, email, name, password_hash, roles FROM users WHERE email = ?')
      .bind(email)
      .first<{ id: string; email: string; name: string; password_hash: string; roles: string; }>();
    
    if (!userResult) {
      return createErrorResponse('Invalid email or password', null, 401);
    }
    
    // IMPORTANT: Password verification logic needs to be robust.
    // Assuming hashPassword is a one-way hash, direct comparison like this is only for already hashed passwords.
    // If `hashPassword` is used for hashing at registration, `userResult.password` should be the stored hash.
    // And a separate `verifyPassword(plainPassword, storedHash)` function would be needed.
    // For now, sticking to the existing logic pattern in the file:
    // const requestHashedPassword = await hashPassword(password); // Old SHA-256 comparison
    // if (userResult.password_hash !== requestHashedPassword) { // Old SHA-256 comparison

    // New bcrypt comparison
    const isPasswordValid = bcrypt.compareSync(password, userResult.password_hash);
    if (!isPasswordValid) {
      return createErrorResponse('Invalid email or password', null, 401);
    }
    
    // const sessionToken = await generateToken(); // This is a session token for KV store - REMOVED
    
    let userRoles: string[] = ['user'];
    try {
        if (typeof userResult.roles === 'string') {
            userRoles = JSON.parse(userResult.roles);
        } else if (Array.isArray(userResult.roles)) {
            userRoles = userResult.roles;
        }
    } catch (e) {
        console.error("Failed to parse roles from DB for user " + userResult.email + ":", userResult.roles, e);
    }

    const jwt = await createJWT({
      userId: userResult.id,
      email: userResult.email,
      roles: userRoles
    }, env ); // Pass full env to createJWT if it needs env.JWT_SECRET from there
    
    // const sessionData = { // REMOVED KV Store logic
    //   userId: userResult.id,
    //   email: userResult.email,
    //   roles: userRoles,
    //   expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
    // };
    // await env.AUTH_STORE.put(`session:${sessionToken}`, JSON.stringify(sessionData)); // REMOVED
    
    return new Response(JSON.stringify({
      // token: sessionToken, // This is the KV session token - REMOVED
      jwt,               // This is the JWT
      user: {
        id: userResult.id,
        email: userResult.email,
        name: userResult.name,
        roles: userRoles
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error during login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown login error';
    return createErrorResponse('Login failed', errorMessage, 500);
  }
}

// Recommendation: Implement rate limiting for this endpoint.
export async function register(request: Request, env: Env) {
  try {
    const { email, password, name } = await request.json() as { email?: string, password?: string, name?: string };
    
    const validationErrors: string[] = [];
    if (!email) {
      validationErrors.push('Email is required.');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.push('Invalid email format.');
    }

    if (!password) {
      validationErrors.push('Password is required.');
    } else if (password.length < 8) {
      validationErrors.push('Password must be at least 8 characters long.');
    }

    if (!name) {
      validationErrors.push('Name is required.');
    } else if (name.length > 100) {
      validationErrors.push('Name must be 100 characters or less.');
    }

    if (validationErrors.length > 0) {
      return createErrorResponse('Registration failed due to validation errors.', validationErrors, 400);
    }
    
    const existingUser = await env.PUPPIES_DB
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();
    
    if (existingUser) {
      return createErrorResponse('Email already in use', null, 400);
    }
    
    const hashedPassword = await hashPassword(password);
    const defaultRoles = JSON.stringify(['user']);
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.PUPPIES_DB
      .prepare('INSERT INTO users (id, email, password_hash, name, roles, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(userId, email, hashedPassword, name, defaultRoles, now, now)
      .run();

    // Send welcome email (fire and forget, don't block response)
    sendTemplatedEmail(env, email, 'welcome_email', { name: name })
      .then(emailResult => {
        console.log(`Welcome email sending attempt for ${email}:`, emailResult.success, emailResult.message);
      })
      .catch(emailError => {
        console.error(`Error queuing welcome email for ${email}:`, emailError);
      });

    // const sessionToken = await generateToken(); // REMOVED
    const jwt = await createJWT({ userId, email, roles: ['user'] }, env); // Pass full env

    // const sessionData = { userId, email, roles: ['user'], expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) }; // REMOVED
    // await env.AUTH_STORE.put(`session:${sessionToken}`, JSON.stringify(sessionData)); // REMOVED
    
    return new Response(JSON.stringify({
      // token: sessionToken, // REMOVED
      jwt,
      user: { id: userId, email, name, roles: ['user'] }
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown registration error';
    return createErrorResponse('Registration failed', errorMessage, 500);
  }
}

// Note: The router is responsible for calling verifyJwtAuth before this function.
export async function getCurrentUser(request: Request, env: Env, authResult: any) {
  try {
    const userId = authResult.userId;
    if (!userId) {
        return createErrorResponse('Unauthorized', 'User ID not found in authentication token.', 401);
    }
    
    const user = await env.PUPPIES_DB
      .prepare('SELECT id, email, name, roles, phone, address, preferences, created_at, updated_at FROM users WHERE id = ?')
      .bind(userId)
      .first<{ id: string; email: string; name: string; roles: string; phone: string | null; address: string | null; preferences: string | null; created_at: string; updated_at: string; }>();
    
    if (!user) {
      return createErrorResponse('User not found', null, 404);
    }

    let parsedRoles = ['user'];
    try {
        if (user.roles && typeof user.roles === 'string') {
            parsedRoles = JSON.parse(user.roles);
        }
    } catch (e) {
        console.error("Failed to parse roles for current user:", user.roles, e);
    }
    
    return new Response(JSON.stringify({ ...user, roles: parsedRoles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Failed to get current user', errorMessage, 500);
  }
}

// Note: The router is responsible for calling verifyJwtAuth before this function.
export async function updateUserProfile(request: Request, env: Env, authResult: any) {
  try {
    const userId = authResult.userId;
    if (!userId) {
      return createErrorResponse('Unauthorized', 'User ID not found in authentication token.', 401);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return createErrorResponse('Invalid JSON body', e.message, 400);
    }

    const { name, phone, address, preferences } = body as { name?: string, phone?: string, address?: string, preferences?: string };

    const validationErrors: string[] = [];
    if (name !== undefined) {
      if (typeof name !== 'string' || name.length > 100) {
        validationErrors.push('Name must be a string and 100 characters or less.');
      }
    }
    if (phone !== undefined && phone !== null) { // phone can be null
      if (typeof phone !== 'string' || phone.length > 20) { // Simple length check for phone
        validationErrors.push('Phone must be a string and 20 characters or less.');
      }
    }
    if (address !== undefined && address !== null) { // address can be null
      if (typeof address !== 'string' || address.length > 255) {
        validationErrors.push('Address must be a string and 255 characters or less.');
      }
    }
    if (preferences !== undefined && preferences !== null) { // preferences can be null
      if (typeof preferences !== 'string' || preferences.length > 500) {
        validationErrors.push('Preferences must be a string and 500 characters or less.');
      }
    }

    if (validationErrors.length > 0) {
        return createErrorResponse('Update failed due to validation errors.', validationErrors, 400);
    }

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone; // Allow setting to null if provided as such
    if (address !== undefined) updates.address = address; // Allow setting to null
    if (preferences !== undefined) updates.preferences = preferences; // Allow setting to null

    if (Object.keys(updates).length === 0) {
      return createErrorResponse('No update fields provided. Please provide name, phone, address, or preferences.', null, 400);
    }

    updates.updated_at = new Date().toISOString();

    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), userId];

    const stmt = `UPDATE users SET ${setClauses} WHERE id = ?`;
    await env.PUPPIES_DB.prepare(stmt).bind(...values).run();

    const updatedUser = await env.PUPPIES_DB
      .prepare('SELECT id, email, name, roles, phone, address, preferences, created_at, updated_at FROM users WHERE id = ?')
      .bind(userId)
      .first<{ id: string; email: string; name: string; roles: string; phone: string | null; address: string | null; preferences: string | null; created_at: string; updated_at: string; }>();

    if (!updatedUser) {
        return createErrorResponse('User not found after update', null, 404);
    }

    let parsedRoles = ['user'];
    if (updatedUser.roles && typeof updatedUser.roles === 'string') {
        try {
            parsedRoles = JSON.parse(updatedUser.roles);
        } catch (e) {
            console.error("Failed to parse roles for updated user profile:", updatedUser.roles, e);
        }
    }

    return new Response(JSON.stringify({ ...updatedUser, roles: parsedRoles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Failed to update user profile', errorMessage, 500);
  }
}

export async function logout(request: Request, env: Env) {
  try {
    // No server-side session token to invalidate for JWT.
    // Client is responsible for clearing the JWT.
    return new Response(JSON.stringify({ message: 'Logout successful (client should clear token).' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) { // Should not happen with current implementation, but good practice
    console.error('Error during logout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown logout error';
    return createErrorResponse('Logout failed', errorMessage, 500);
  }
}

// Admin User Management Functions
// Note: The router is responsible for calling adminAuthMiddleware before these admin functions.

export async function listUsers(request: Request, env: Env) {
  // Note: The router is responsible for calling adminAuthMiddleware before this function.
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;

  try {
    const usersQuery = env.PUPPIES_DB.prepare(
      'SELECT id, email, name, roles, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset);
    const totalUsersQuery = env.PUPPIES_DB.prepare('SELECT COUNT(*) as total_users FROM users');

    const [usersResults, totalResult] = await Promise.all([
      usersQuery.all<{ id: string; email: string; name: string; roles: string; created_at: string; updated_at: string; }>(),
      totalUsersQuery.first<{ total_users: number }>()
    ]);
    
    const users = usersResults.results.map(user => {
      let parsedRoles = ['user'];
      try {
        if (user.roles && typeof user.roles === 'string') {
          parsedRoles = JSON.parse(user.roles);
        }
      } catch (e) {
        console.error("Failed to parse roles for user:", user.id, user.roles, e);
      }
      return { ...user, roles: parsedRoles };
    });
    const totalUsers = totalResult?.total_users || 0;
    const totalPages = Math.ceil(totalUsers / limit);

    return new Response(JSON.stringify({
      users,
      currentPage: page,
      totalPages,
      totalUsers,
      limit
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error listing users:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Failed to list users', errorMessage, 500);
  }
}

export async function getUserByIdAdmin(request: Request, env: Env, userIdParam: string) {
  // Note: The router is responsible for calling adminAuthMiddleware before this function.
  if (!userIdParam) {
    return createErrorResponse('User ID parameter is missing', null, 400);
  }
  try {
    const user = await env.PUPPIES_DB
      .prepare('SELECT id, email, name, roles, created_at, updated_at FROM users WHERE id = ?')
      .bind(userIdParam)
      .first<{ id: string; email: string; name: string; roles: string; created_at: string; updated_at: string; }>();

    if (!user) {
      return createErrorResponse('User not found', `No user found with ID: ${userIdParam}`, 404);
    }
    let parsedRoles = ['user'];
     try {
        if (user.roles && typeof user.roles === 'string') {
            parsedRoles = JSON.parse(user.roles);
        }
    } catch (e) {
        console.error("Failed to parse roles for user:", user.id, user.roles, e);
    }

    return new Response(JSON.stringify({ ...user, roles: parsedRoles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error fetching user ${userIdParam}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Failed to fetch user', errorMessage, 500);
  }
}

export async function updateUserAdmin(request: Request, env: Env, userIdParam: string) {
  // Note: The router is responsible for calling adminAuthMiddleware before this function.
  if (!userIdParam) {
    return createErrorResponse('User ID parameter is missing', null, 400);
  }
  try {
    const body = await request.json() as { name?: string; roles?: string[] };

    const validationErrors: string[] = [];
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.length > 100) {
        validationErrors.push('Name must be a string and 100 characters or less.');
      }
    }
    if (body.roles && (!Array.isArray(body.roles) || body.roles.some(r => typeof r !== 'string'))) {
      validationErrors.push('Roles must be an array of strings.');
    }

    if (validationErrors.length > 0) {
        return createErrorResponse('Update failed due to validation errors.', validationErrors, 400);
    }
    
     const existingUser = await env.PUPPIES_DB.prepare("SELECT id FROM users WHERE id = ?").bind(userIdParam).first();
    if (!existingUser) {
        return createErrorResponse('User not found', `No user found with ID: ${userIdParam}`, 404);
    }

    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.roles !== undefined) updates.roles = JSON.stringify(body.roles);

    if (Object.keys(updates).length === 0) {
      return createErrorResponse('No update fields provided', null, 400);
    }

    updates.updated_at = new Date().toISOString();

    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    values.push(userIdParam);

    const stmt = `UPDATE users SET ${setClauses} WHERE id = ?`;
    await env.PUPPIES_DB.prepare(stmt).bind(...values).run();

    const updatedUser = await env.PUPPIES_DB
      .prepare('SELECT id, email, name, roles, created_at, updated_at FROM users WHERE id = ?')
      .bind(userIdParam)
      .first<{ id: string; email: string; name: string; roles: string; created_at: string; updated_at: string; }>();

    let parsedRoles = ['user'];
    if (updatedUser && updatedUser.roles && typeof updatedUser.roles === 'string') {
        try {
            parsedRoles = JSON.parse(updatedUser.roles);
        } catch (e) {
            console.error("Failed to parse roles for updated user:", updatedUser.id, updatedUser.roles, e);
        }
    }

    return new Response(JSON.stringify({ ...updatedUser, roles: parsedRoles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error updating user ${userIdParam}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error instanceof SyntaxError) {
        return createErrorResponse('Invalid request body', 'Malformed JSON.', 400);
    }
    return createErrorResponse('Failed to update user', errorMessage, 500);
  }
}

export async function deleteUserAdmin(request: Request, env: Env, userIdParam: string) {
  // Note: The router is responsible for calling adminAuthMiddleware before this function.
  if (!userIdParam) {
    return createErrorResponse('User ID parameter is missing', null, 400);
  }
  try {
    const result = await env.PUPPIES_DB.prepare('DELETE FROM users WHERE id = ?').bind(userIdParam).run();

    if (result.changes === 0) {
      return createErrorResponse('User not found', `No user found with ID: ${userIdParam} to delete.`, 404);
    }

    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error deleting user ${userIdParam}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Failed to delete user', errorMessage, 500);
  }
}
