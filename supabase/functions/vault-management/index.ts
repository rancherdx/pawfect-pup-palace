import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * @constant corsHeaders
 * @description Defines the CORS headers for the function, allowing cross-origin requests.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * @interface VaultSecret
 * @description Defines the structure for a secret to be stored in the vault.
 */
interface VaultSecret {
  name: string;
  description?: string;
  secret: string;
}

/**
 * The main handler for the vault-management serverless function.
 * This function provides a mock API for managing secrets. It includes endpoints
 * for listing, creating, and deleting secrets, with authentication and admin-level
 * authorization checks. Note: This is a mock implementation and does not securely
 * store or manage real secrets.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<Response>} A response indicating the result of the vault operation.
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const hasAdminAccess = roles?.some(r => ['admin', 'super-admin'].includes(r.role))
    if (!hasAdminAccess) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const method = req.method
    const url = new URL(req.url)
    const secretName = url.searchParams.get('name')

    switch (method) {
      case 'GET':
        if (secretName) {
          // Get specific secret metadata (not the value)
          return new Response(
            JSON.stringify({ 
              name: secretName,
              exists: !!Deno.env.get(secretName),
              description: `Secret: ${secretName}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // List all available secrets (metadata only)
          const secrets = [
            { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Supabase service role key' },
            { name: 'SUPABASE_DB_URL', description: 'Supabase database URL' },
            { name: 'ENCRYPTION_KEY', description: 'Data encryption key' },
            { name: 'OPENAI_API_KEY', description: 'OpenAI API key' },
            { name: 'SQUARE_ACCESS_TOKEN', description: 'Square payment access token' },
            { name: 'SQUARE_APPLICATION_ID', description: 'Square application ID' },
            { name: 'MAILCHANNELS_API_KEY', description: 'MailChannels API key' },
            { name: 'GOOGLE_BUSINESS_API_KEY', description: 'Google Business API key' }
          ].map(secret => ({
            ...secret,
            exists: !!Deno.env.get(secret.name)
          }))

          return new Response(
            JSON.stringify({ secrets }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

      case 'POST':
        const { name, description, secret }: VaultSecret = await req.json()
        
        if (!name || !secret) {
          return new Response(
            JSON.stringify({ error: 'Name and secret are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // In a real vault implementation, this would securely store the secret
        // For now, we'll log the operation and return success
        console.log(`Vault operation: Store secret ${name}`)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Secret ${name} stored successfully`,
            name 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'DELETE':
        if (!secretName) {
          return new Response(
            JSON.stringify({ error: 'Secret name is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log(`Vault operation: Delete secret ${secretName}`)
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Secret ${secretName} deleted successfully` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

  } catch (error) {
    console.error('Vault management error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})