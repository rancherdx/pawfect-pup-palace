import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin role
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user: requestingUser }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', requestingUser.id)
      .in('role', ['admin', 'super-admin'])
      .single()

    if (!roles) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { email, name, phone, password, sendWelcomeEmail = false, assignRoles = ['user'] } = await req.json()

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: 'Email and name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create user in auth
    const userData: any = {
      email,
      email_confirm: true, // Auto-confirm email
      user_metadata: { name, phone: phone || '' }
    }

    if (password) {
      userData.password = password
    }

    const { data: newUser, error: createError } = await supabase.auth.admin.createUser(userData)

    if (createError || !newUser.user) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: createError?.message || 'Failed to create user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.user.id,
        name,
        phone: phone || null
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(newUser.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Assign roles
    const roleInserts = assignRoles.map(role => ({
      user_id: newUser.user.id,
      role
    }))

    const { error: rolesError } = await supabase
      .from('user_roles')
      .insert(roleInserts)

    if (rolesError) {
      console.error('Error assigning roles:', rolesError)
    }

    // Log audit event
    await supabase.rpc('log_security_event', {
      p_user_id: newUser.user.id,
      p_event_type: 'user_created_by_admin',
      p_event_data: {
        created_by: requestingUser.id,
        assigned_roles: assignRoles
      }
    })

    // Send welcome email if requested
    if (sendWelcomeEmail && !password) {
      try {
        await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email
        })
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          name,
          phone: phone || null,
          roles: assignRoles
        },
        message: 'User created successfully'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Admin create user error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})