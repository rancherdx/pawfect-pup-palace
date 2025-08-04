import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

interface SquareOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  environment: 'sandbox' | 'production';
}

interface SquareTokenResponse {
  access_token: string;
  token_type: string;
  expires_at: string;
  merchant_id: string;
  refresh_token?: string;
  subscription_id?: string;
  plan_id?: string;
}

/**
 * Generate Square OAuth authorization URL
 */
export async function generateAuthUrl(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const state = url.searchParams.get('state') || generateRandomState();
    const scopes = url.searchParams.get('scopes') || 'MERCHANT_PROFILE_READ PAYMENTS_READ PAYMENTS_WRITE';
    
    const config = getSquareConfig(env);
    
    const authUrl = new URL('https://connect.squareup.com/oauth2/authorize');
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('session', 'false');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('redirect_uri', config.redirectUri);
    
    return new Response(JSON.stringify({
      authUrl: authUrl.toString(),
      state: state,
      redirectUri: config.redirectUri
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating Square auth URL:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate authorization URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle OAuth callback from Square
 */
export async function handleOAuthCallback(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    if (error) {
      const errorDescription = url.searchParams.get('error_description');
      return new Response(JSON.stringify({
        error: 'OAuth authorization failed',
        description: errorDescription || error
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!code) {
      return new Response(JSON.stringify({
        error: 'Missing authorization code'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const config = getSquareConfig(env);
    
    // Exchange authorization code for access token
    const tokenResponse = await exchangeCodeForToken(code, config);
    
    // Store the access token and merchant info in database
    await storeSquareIntegration(tokenResponse, env);
    
    return new Response(JSON.stringify({
      success: true,
      merchantId: tokenResponse.merchant_id,
      message: 'Square account successfully connected!'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(JSON.stringify({
      error: 'OAuth callback failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get current Square OAuth status
 */
export async function getOAuthStatus(request: Request, env: Env): Promise<Response> {
  try {
    const stmt = env.PUPPIES_DB.prepare(`
      SELECT * FROM integrations 
      WHERE service_name = 'square' AND is_active = 1
      ORDER BY created_at DESC LIMIT 1
    `);
    
    const integration = await stmt.first();
    
    if (!integration) {
      return new Response(JSON.stringify({
        connected: false,
        message: 'No Square integration found'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const config = typeof (integration as { other_config: string | Record<string, unknown> }).other_config === 'string' 
      ? JSON.parse((integration as { other_config: string }).other_config) 
      : (integration as { other_config: Record<string, unknown> }).other_config || {};
    
    return new Response(JSON.stringify({
      connected: true,
      merchantId: config.merchant_id,
      connectedAt: (integration as { created_at?: string })?.created_at,
      permissions: config.permissions || [],
      environment: config.environment || 'production'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error checking OAuth status:', error);
    return new Response(JSON.stringify({
      error: 'Failed to check OAuth status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Revoke Square OAuth access
 */
export async function revokeOAuth(request: Request, env: Env): Promise<Response> {
  try {
    // Get current integration
    const stmt = env.PUPPIES_DB.prepare(`
      SELECT * FROM integrations 
      WHERE service_name = 'square' AND is_active = 1
      ORDER BY created_at DESC LIMIT 1
    `);
    
    const integration = await stmt.first();
    
    if (!integration) {
      return new Response(JSON.stringify({
        error: 'No active Square integration found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const config = typeof (integration as { other_config: string | Record<string, unknown> }).other_config === 'string' 
      ? JSON.parse((integration as { other_config: string }).other_config) 
      : (integration as { other_config: Record<string, unknown> }).other_config || {};
    
    // Revoke token with Square
    if (config.access_token) {
      await revokeSquareToken(config.access_token, env);
    }
    
    // Deactivate integration in database
    const updateStmt = env.PUPPIES_DB.prepare(`
      UPDATE integrations 
      SET is_active = 0, updated_at = ?
      WHERE id = ?
    `);
    
    await updateStmt.bind(Math.floor(Date.now() / 1000), (integration as any).id).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Square integration successfully revoked'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error revoking OAuth:', error);
    return new Response(JSON.stringify({
      error: 'Failed to revoke OAuth access',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions

function getSquareConfig(env: Env): SquareOAuthConfig {
  const environment = env.ENV === 'development' ? 'sandbox' : 'production';
  
  return {
    clientId: (env as any).SQUARE_APPLICATION_ID,
    clientSecret: (env as any).SQUARE_APPLICATION_SECRET,
    redirectUri: `https://new.gdspuppies.com/api/square/oauth/callback`,
    environment
  };
}

async function exchangeCodeForToken(code: string, config: SquareOAuthConfig): Promise<SquareTokenResponse> {
  const tokenUrl = 'https://connect.squareup.com/oauth2/token';
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2024-06-04'
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: config.redirectUri
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
  }
  
  return response.json();
}

async function storeSquareIntegration(tokenResponse: SquareTokenResponse, env: Env): Promise<void> {
  // First, deactivate any existing Square integrations
  const deactivateStmt = env.PUPPIES_DB.prepare(`
    UPDATE integrations 
    SET is_active = 0 
    WHERE service_name = 'square'
  `);
  await deactivateStmt.run();
  
  // Store new integration
  const stmt = env.PUPPIES_DB.prepare(`
    INSERT INTO integrations (
      id, service_name, api_key_set, is_active, other_config, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const integrationConfig = {
    access_token: tokenResponse.access_token,
    merchant_id: tokenResponse.merchant_id,
    token_type: tokenResponse.token_type,
    expires_at: tokenResponse.expires_at,
    refresh_token: tokenResponse.refresh_token,
    environment: env.ENV === 'development' ? 'sandbox' : 'production',
    connected_at: new Date().toISOString()
  };
  
  await stmt.bind(
    generateId(),
    'square',
    1, // api_key_set = true
    1, // is_active = true
    JSON.stringify(integrationConfig),
    Math.floor(Date.now() / 1000),
    Math.floor(Date.now() / 1000)
  ).run();
}

async function revokeSquareToken(accessToken: string, env: Env): Promise<void> {
  const revokeUrl = 'https://connect.squareup.com/oauth2/revoke';
  
  const config = getSquareConfig(env);
  
  const response = await fetch(revokeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Square-Version': '2024-06-04'
    },
    body: JSON.stringify({
      client_id: config.clientId,
      access_token: accessToken
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to revoke token with Square:', error);
    // Continue anyway - we'll deactivate locally
  }
}

function generateRandomState(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}