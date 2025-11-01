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
    const { userId, updates } = await req.json()

    if (!userId || !updates) {
      return new Response(
        JSON.stringify({ error: 'User ID and updates are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update auth user metadata if email or name changed
    if (updates.email || updates.name) {
      const authUpdates: any = {}
      if (updates.email) authUpdates.email = updates.email
      if (updates.name) authUpdates.user_metadata = { name: updates.name }

      const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        userId,
        authUpdates
      )

      if (authUpdateError) {
        console.error('Error updating auth user:', authUpdateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update user authentication' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Update profile
    const profileUpdates: any = {}
    if (updates.name) profileUpdates.name = updates.name
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone
    if (updates.secondary_email !== undefined) profileUpdates.secondary_email = updates.secondary_email
    if (updates.preferred_name !== undefined) profileUpdates.preferred_name = updates.preferred_name
    if (updates.preferred_contact !== undefined) profileUpdates.preferred_contact = updates.preferred_contact
    if (updates.profile_photo_url !== undefined) profileUpdates.profile_photo_url = updates.profile_photo_url

    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId)
      .select()
      .single()

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to update user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log audit event
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: 'user_updated_by_admin',
      p_event_data: {
        updated_by: requestingUser.id,
        fields_updated: Object.keys(updates)
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        user: updatedProfile,
        message: 'User updated successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Admin update user error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})