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
 * The main handler for the setup-status serverless function.
 * This function checks the application's setup status by calling a database function
 * to count the number of existing super administrator accounts. This is used by the
 * setup page to determine if the setup process needs to be run.
 *
 * @param {Request} req - The incoming HTTP request.
 * @returns {Promise<Response>} A response containing the count of admin accounts.
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Call the database function to count super admins
    const { data, error } = await supabase.rpc('count_super_admins')

    if (error) {
      console.error('Error counting super admins:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to check setup status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return the number of admins found
    return new Response(
      JSON.stringify({ adminCount: data }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Setup status error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})