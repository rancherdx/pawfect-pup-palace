import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    const { environment, content } = await req.json();
    if (!environment || !["sandbox","production"].includes(environment)) {
      return new Response(JSON.stringify({ error: "Invalid environment" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (!content || typeof content !== 'string') {
      return new Response(JSON.stringify({ error: "Missing file content" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const path = `${environment}/apple-developer-merchantid-domain-association`;
    const uploadRes = await supabase.storage.from('apple-pay').upload(path, new Blob([content], { type: 'text/plain' }), { upsert: true });
    if (uploadRes.error) {
      console.error(uploadRes.error);
      return new Response(JSON.stringify({ error: uploadRes.error.message }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    await supabase.from('change_logs').insert({ action: 'apple_pay_file_upload', context: environment, details: { path } });

    return new Response(JSON.stringify({ ok: true, path }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});