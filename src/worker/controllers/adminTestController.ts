
import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';
import { createJWT, verifyJWT } from '../auth';

// Generate admin test session with fresh token
export async function createAdminTestSession(request: Request, env: Env, adminToken: any): Promise<Response> {
  try {
    const body = await request.json() as { purpose?: string; userId?: string };
    const { purpose = 'endpoint_testing', userId } = body;

    // Generate a unique session ID
    const sessionId = crypto.randomUUID();
    
    // Create test-specific JWT payload
    const testPayload = {
      sessionId,
      adminUserId: adminToken.userId,
      impersonatedUserId: userId || null,
      purpose,
      isTestToken: true,
    };

    // Generate short-lived test token (1 hour)
    const testToken = await createJWT(testPayload, env, 1/24); // 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    // Store session in database
    await env.PUPPIES_DB
      .prepare(`
        INSERT INTO admin_test_sessions 
        (id, admin_user_id, impersonated_user_id, test_token, session_purpose, expires_at, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        sessionId,
        adminToken.userId,
        userId || null,
        testToken,
        purpose,
        expiresAt,
        true,
        new Date().toISOString()
      )
      .run();

    const session = {
      id: sessionId,
      adminUserId: adminToken.userId,
      impersonatedUserId: userId || null,
      testToken,
      sessionPurpose: purpose,
      expiresAt,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(session), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating admin test session:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create test session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Generate impersonation token for user testing
export async function createImpersonationSession(request: Request, env: Env, adminToken: any): Promise<Response> {
  try {
    const body = await request.json() as { userId: string; purpose?: string };
    const { userId, purpose = 'user_impersonation' } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID is required for impersonation' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify user exists
    const user = await env.PUPPIES_DB
      .prepare('SELECT id, email, name, roles FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate session
    const sessionId = crypto.randomUUID();
    
    const testPayload = {
      sessionId,
      adminUserId: adminToken.userId,
      userId: userId, // The user being impersonated
      email: (user as any).email,
      name: (user as any).name,
      roles: JSON.parse((user as any).roles || '["user"]'),
      impersonatedUserId: userId,
      purpose,
      isTestToken: true,
      isImpersonation: true,
    };

    const testToken = await createJWT(testPayload, env, 1/24); // 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    await env.PUPPIES_DB
      .prepare(`
        INSERT INTO admin_test_sessions 
        (id, admin_user_id, impersonated_user_id, test_token, session_purpose, expires_at, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        sessionId,
        adminToken.userId,
        userId,
        testToken,
        purpose,
        expiresAt,
        true,
        new Date().toISOString()
      )
      .run();

    const session = {
      id: sessionId,
      adminUserId: adminToken.userId,
      impersonatedUserId: userId,
      testToken,
      sessionPurpose: purpose,
      expiresAt,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(session), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating impersonation session:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create impersonation session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Log test API calls
export async function logTestCall(request: Request, env: Env, sessionId: string, testData: any): Promise<void> {
  try {
    await env.PUPPIES_DB
      .prepare(`
        INSERT INTO admin_test_logs 
        (id, session_id, endpoint, method, request_body, response_status, response_body, latency_ms, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        crypto.randomUUID(),
        sessionId,
        testData.endpoint,
        testData.method,
        testData.requestBody || null,
        testData.responseStatus,
        testData.responseBody || null,
        testData.latencyMs,
        new Date().toISOString()
      )
      .run();
  } catch (error) {
    console.error('Error logging test call:', error);
  }
}

// Get test session logs
export async function getTestSessionLogs(request: Request, env: Env, adminToken: any): Promise<Response> {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = `
      SELECT atl.*, ats.session_purpose 
      FROM admin_test_logs atl
      JOIN admin_test_sessions ats ON atl.session_id = ats.id
      WHERE ats.admin_user_id = ?
    `;
    const params = [adminToken.userId];

    if (sessionId) {
      query += ` AND atl.session_id = ?`;
      params.push(sessionId);
    }

    query += ` ORDER BY atl.created_at DESC LIMIT ?`;
    params.push(limit);

    const result = await env.PUPPIES_DB.prepare(query).bind(...params).all();

    return new Response(JSON.stringify({ logs: result.results }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching test session logs:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch test session logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
