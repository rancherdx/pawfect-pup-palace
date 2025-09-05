import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Verify admin authentication
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

    // Check if user has admin role
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError || !userRoles?.some(r => r.role === 'admin' || r.role === 'super-admin')) {
      return new Response(
        JSON.stringify({ error: 'Admin privileges required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname;

    // Route: Get security events
    if (req.method === 'GET' && path.includes('/events')) {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      
      const { data: events, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching security events:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch security events' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ events }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Route: Get security statistics
    if (req.method === 'GET' && path.includes('/stats')) {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Count failed logins in last 24h
      const { count: failedLogins } = await supabase
        .from('security_audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'login_failed')
        .gte('created_at', oneDayAgo.toISOString());

      // Count role changes in last 7 days
      const { count: roleChanges } = await supabase
        .from('security_audit_log')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'role_change')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Count suspicious activities in last 24h
      const { count: suspiciousActivities } = await supabase
        .from('security_audit_log')
        .select('*', { count: 'exact', head: true })
        .in('event_type', ['suspicious_activity', 'privilege_escalation_attempt'])
        .gte('created_at', oneDayAgo.toISOString());

      // Approximate active sessions (this would need more sophisticated implementation in real app)
      const { count: totalActiveSessions } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      return new Response(
        JSON.stringify({ 
          failed_logins_24h: failedLogins || 0,
          role_changes_7d: roleChanges || 0,
          total_active_sessions: totalActiveSessions || 0,
          suspicious_activities_24h: suspiciousActivities || 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error in admin-security-api function:', error);
    
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