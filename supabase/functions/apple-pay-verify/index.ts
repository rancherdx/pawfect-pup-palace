import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * @function apple-pay-verify
 * @description Serves the Apple Pay domain verification file from storage
 * This endpoint makes the verification file accessible at /.well-known/apple-developer-merchantid-domain-association
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine environment (production vs sandbox)
    const url = new URL(req.url);
    const environment = url.searchParams.get('env') || 'production';
    
    // Fetch the verification file from storage
    const { data, error } = await supabase.storage
      .from('apple-pay')
      .download(`${environment}/apple-developer-merchantid-domain-association`);

    if (error) {
      console.error('Error fetching verification file:', error);
      return new Response(
        JSON.stringify({ error: 'Verification file not found' }), 
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Return the file with correct Content-Type
    // Apple requires either application/octet-stream or text/plain
    return new Response(data, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error in apple-pay-verify function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
