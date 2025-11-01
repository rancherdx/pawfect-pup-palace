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
    const { userId, sendResetEmail = true, temporaryPassword } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let message = ''
    let tempPassword = null

    if (sendResetEmail) {
      // Generate and send password reset link
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: userData.user.email!
      })

      if (resetError) {
        console.error('Error generating reset link:', resetError)
        return new Response(
          JSON.stringify({ error: 'Failed to send password reset email' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      message = 'Password reset email sent successfully'
    } else {
      // Set temporary password
      const newPassword = temporaryPassword || Math.random().toString(36).slice(-12) + 'A1!'
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      )

      if (updateError) {
        console.error('Error setting temporary password:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to set temporary password' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Set force password change flag
      await supabase
        .from('profiles')
        .update({ force_password_change: true })
        .eq('id', userId)

      tempPassword = newPassword
      message = 'Temporary password set successfully'
    }

    // Log audit event
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: 'password_reset_by_admin',
      p_event_data: {
        reset_by: requestingUser.id,
        method: sendResetEmail ? 'email' : 'temporary_password'
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        message,
        temporaryPassword: tempPassword
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Admin reset password error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})