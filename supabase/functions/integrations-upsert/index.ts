import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { encryptJson, decryptJson } from "../_shared/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, environment, data: partialData } = await req.json();
    if (!service || !environment || !data) {
      return new Response(JSON.stringify({ error: "Missing service, environment, or data" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!["sandbox", "production"].includes(environment)) {
      return new Response(JSON.stringify({ error: "Invalid environment" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const ENC_KEY = Deno.env.get("ENCRYPTION_KEY") ?? "";

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Supabase service role not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (!ENC_KEY) {
      return new Response(JSON.stringify({ error: "ENCRYPTION_KEY not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    // Fetch existing record to support partial updates
    const { data: existingRecord, error: fetchError } = await supabase
      .from("third_party_integrations")
      .select("data_ciphertext")
      .eq("service", service)
      .eq("environment", environment)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Ignore 'not found' error
      throw fetchError;
    }

    let existingData = {};
    if (existingRecord && existingRecord.data_ciphertext) {
      try {
        existingData = await decryptJson(existingRecord.data_ciphertext, ENC_KEY);
      } catch (e) {
        console.error("Failed to decrypt existing data, starting fresh.", e);
        // Potentially corrupted data or key change, handle by overwriting.
      }
    }

    const fullData = { ...existingData, ...partialData };

    // If api_key is present but empty, it means the user wants to clear it.
    // However, for updates that don't touch the key, it won't be in partialData.
    // The only time we want to remove the key is if it's explicitly set to null or an empty string.
    if (partialData.api_key === '' || partialData.api_key === null) {
      delete fullData.api_key;
    }

    const data_ciphertext = await encryptJson(fullData, ENC_KEY);

    const upsertRes = await supabase
      .from("third_party_integrations")
      .upsert(
        [{ service, environment, name: service, data_ciphertext }],
        { onConflict: "service,environment" }
      )
      .select("id, updated_at")
      .single();

    if (upsertRes.error) {
      console.error("Upsert error", upsertRes.error);
      return new Response(JSON.stringify({ error: upsertRes.error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Audit log (best-effort)
    await supabase.from("change_logs").insert({
      action: "integrations_upsert",
      context: service,
      details: { environment },
    });

    return new Response(JSON.stringify({ ok: true, id: upsertRes.data.id, updated_at: upsertRes.data.updated_at }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) } ), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});