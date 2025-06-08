
import { corsHeaders } from '../utils/cors';
import { hashPassword, generateToken, createJWT } from '../auth'; // Removed verifyJWT as it's not used here
import type { Env } from '../env';
import { sendTemplatedEmail } from '../utils/emailService'; // Added import

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export async function login(request: Request, env: Env) { // Changed env type to Env
  try {
    const { email, password } = await request.json() as { email?: string, password?: string };
    
    if (!email || !password) {
      return createErrorResponse('Email and password are required', null, 400);
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
    const requestHashedPassword = await hashPassword(password);
    if (userResult.password_hash !== requestHashedPassword) {
      return createErrorResponse('Invalid email or password', null, 401);
    }
    
    const sessionToken = await generateToken(); // This is a session token for KV store
    
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
    
    const sessionData = {
      userId: userResult.id,
      email: userResult.email,
      roles: userRoles,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
    };
    await env.AUTH_STORE.put(`session:${sessionToken}`, JSON.stringify(sessionData));
    
    return new Response(JSON.stringify({
      token: sessionToken, // This is the KV session token
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

export async function register(request: Request, env: Env) { // Changed env type to Env
  try {
    const { email, password, name } = await request.json() as { email?: string, password?: string, name?: string };
    
    if (!email || !password || !name) {
      return createErrorResponse('Email, password, and name are required', null, 400);
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
      .prepare('INSERT INTO users (id, email, password, name, roles, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
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

    const sessionToken = await generateToken();
    const jwt = await createJWT({ userId, email, roles: ['user'] }, env); // Pass full env

    const sessionData = { userId, email, roles: ['user'], expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) };
    await env.AUTH_STORE.put(`session:${sessionToken}`, JSON.stringify(sessionData));
    
    return new Response(JSON.stringify({
      token: sessionToken,
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

    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (preferences !== undefined) updates.preferences = preferences;

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
      .first();

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

export async function logout(request: Request, env: Env) { // Changed env type to Env
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('No token provided', 'Authorization header with Bearer session token is expected.', 400);
    }
    const token = authHeader.split(' ')[1]; // This is the session token
    await env.AUTH_STORE.delete(`session:${token}`);

    return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error during logout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown logout error';
    return createErrorResponse('Logout failed', errorMessage, 500);
  }
}

// Admin User Management Functions

export async function listUsers(request: Request, env: Env) {
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
  if (!userIdParam) {
    return createErrorResponse('User ID parameter is missing', null, 400);
  }
  try {
    const body = await request.json() as { name?: string; roles?: string[] };

    // TODO: Future - Consider triggering ID/Face Verification for sensitive changes (e.g., email/password change, role change to admin) or during account recovery processes.
    // This would involve calling a verification service before proceeding with the update below.

    if (body.roles && (!Array.isArray(body.roles) || body.roles.some(r => typeof r !== 'string'))) {
      return createErrorResponse('Invalid input for roles', 'Roles must be an array of strings.', 400);
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
