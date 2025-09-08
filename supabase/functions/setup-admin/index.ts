import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Security check for setup secret
  const setupSecret = Deno.env.get('SETUP_SECRET');
  if (!setupSecret || req.headers.get('X-Setup-Secret') !== setupSecret) {
    return new Response(
      JSON.stringify({ error: 'Forbidden' }),
      {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const { name, email, password } = await req.json()

    // Validate input
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // If this is the second admin, validate the details
    if (adminCount === 1) {
      const expectedName = "Girard Sawyer";
      const expectedEmail = "girard@gdspuppies.com";
      if (name.toLowerCase() !== expectedName.toLowerCase() || email.toLowerCase() !== expectedEmail.toLowerCase()) {
        return new Response(
          JSON.stringify({ error: `Invalid details for the second administrator account. Please use the designated name and email.` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check how many super admins already exist
    const { data: adminCount, error: countError } = await supabase.rpc('count_super_admins')

    if (countError) {
      console.error('Error checking admin count:', countError)
      return new Response(
        JSON.stringify({ error: 'Failed to check setup status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (adminCount >= 2) {
      return new Response(
        JSON.stringify({ error: 'Setup already completed. The maximum number of super administrators has been reached.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create the user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // Auto-confirm email for admin setup
    })

    if (authError) {
      console.error('Error creating admin user:', authError)
      return new Response(
        JSON.stringify({ 
          error: authError.message.includes('already registered') 
            ? 'Email already in use' 
            : 'Failed to create admin user'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Promote user to admin role
    const { error: promoteError } = await supabase.rpc('promote_user_to_admin', {
      target_user_id: authData.user.id
    })

    if (promoteError) {
      console.error('Error promoting user to admin:', promoteError)
    // Try to delete the user if we can't make them admin
    await supabase.auth.admin.deleteUser(authData.user.id)
    return new Response(
      JSON.stringify({ error: 'Failed to assign super admin privileges' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Super administrator account created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name
        }
      }),
      { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Setup admin error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})