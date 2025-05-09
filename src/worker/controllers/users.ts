
import { corsHeaders } from '../utils/cors';
import { hashPassword, generateToken, createJWT, verifyJWT } from '../auth';

export async function login(request: Request, env: any) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password are required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Get the user by email
    const user = await env.PUPPIES_DB
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Check password
    const hashedPassword = await hashPassword(password);
    if (user.password !== hashedPassword) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Generate a session token
    const token = await generateToken();
    
    // Create JWT
    const jwt = createJWT({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // Store the session in KV
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    await env.AUTH_STORE.put(`session:${token}`, JSON.stringify(sessionData));
    
    return new Response(JSON.stringify({
      token,
      jwt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function register(request: Request, env: any) {
  try {
    const { email, password, name } = await request.json();
    
    // Validate input
    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: 'Email, password, and name are required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Check if user already exists
    const existingUser = await env.PUPPIES_DB
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();
    
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already in use' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password);
    
    // Insert the user
    const result = await env.PUPPIES_DB
      .prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
      .bind(email, hashedPassword, name, 'customer')
      .run();
    
    const userId = result.meta.last_row_id;
    
    // Generate a session token
    const token = await generateToken();
    
    // Create JWT
    const jwt = createJWT({
      userId,
      email,
      role: 'customer'
    });
    
    // Store the session in KV
    const sessionData = {
      userId,
      email,
      role: 'customer',
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    await env.AUTH_STORE.put(`session:${token}`, JSON.stringify(sessionData));
    
    return new Response(JSON.stringify({
      token,
      jwt,
      user: {
        id: userId,
        email,
        name,
        role: 'customer'
      }
    }), {
      status: 201,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error during registration:', error);
    return new Response(JSON.stringify({ error: 'Registration failed' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function getCurrentUser(request: Request, env: any, authResult: any) {
  try {
    const userId = authResult.userId;
    
    // Get the user data
    const user = await env.PUPPIES_DB
      .prepare('SELECT id, email, name, role FROM users WHERE id = ?')
      .bind(userId)
      .first();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    return new Response(JSON.stringify(user), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error getting user:', error);
    return new Response(JSON.stringify({ error: 'Failed to get user' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function logout(request: Request, env: any) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'No token provided' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Delete the session from KV
    await env.AUTH_STORE.delete(`session:${token}`);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return new Response(JSON.stringify({ error: 'Logout failed' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
