import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DataDeletionRequestBody {
  name?: string;
  email: string;
  account_creation_timeframe?: string;
  puppy_ids?: string;
  additional_details: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const body: DataDeletionRequestBody = await req.json();

    // Validate input
    const validationErrors: string[] = [];

    if (!body.email) {
      validationErrors.push('Email is required.');
    } else if (typeof body.email !== 'string' || !/\S+@\S+\.\S+/.test(body.email) || body.email.length > 255) {
      validationErrors.push('Valid email is required and must be less than 255 characters.');
    }

    if (body.name && (typeof body.name !== 'string' || body.name.length > 255)) {
      validationErrors.push('Name must be a string and less than 255 characters.');
    }

    if (!body.additional_details && !body.name) {
      validationErrors.push('Either Name or Additional Details must be provided along with Email to help identify your data.');
    }

    if (body.additional_details && (typeof body.additional_details !== 'string' || body.additional_details.length > 2000)) {
      validationErrors.push('Additional details must be a string and less than 2000 characters.');
    }

    if (body.account_creation_timeframe && (typeof body.account_creation_timeframe !== 'string' || body.account_creation_timeframe.length > 100)) {
      validationErrors.push('Account creation timeframe must be a string and less than 100 characters.');
    }

    if (body.puppy_ids && (typeof body.puppy_ids !== 'string' || body.puppy_ids.length > 500)) {
      validationErrors.push('Puppy IDs field must be a string and less than 500 characters.');
    }

    if (validationErrors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request data', details: validationErrors }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get client IP and user agent for security logging
    const clientIP = req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown';
    const userAgent = req.headers.get('User-Agent') || 'unknown';

    // Insert data deletion request
    const { data: deletionRequest, error: insertError } = await supabase
      .from('data_deletion_requests')
      .insert({
        name: body.name || null,
        email: body.email,
        account_creation_timeframe: body.account_creation_timeframe || null,
        puppy_ids: body.puppy_ids || null,
        additional_details: body.additional_details || null,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting data deletion request:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit data deletion request' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log security event
    await supabase.rpc('log_security_event', {
      p_user_id: user.id,
      p_event_type: 'data_deletion_request',
      p_event_data: {
        request_id: deletionRequest.id,
        email: body.email
      },
      p_ip_address: clientIP,
      p_user_agent: userAgent
    });

    console.log(`Data deletion request submitted successfully: ${deletionRequest.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Your data deletion request has been submitted successfully. An administrator will review it shortly.',
        requestId: deletionRequest.id 
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error in secure-data-deletion-request function:', error);
    
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'An internal error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

serve(handler);