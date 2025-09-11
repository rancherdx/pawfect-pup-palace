import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { decryptJson } from "../_shared/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (_req) => {
  if (_req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const ENC_KEY = Deno.env.get("ENCRYPTION_KEY") ?? "";

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ENC_KEY) {
      return new Response(JSON.stringify({ error: "Service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    const { data: records, error } = await supabase
      .from("third_party_integrations")
      .select("id, service, environment, updated_at, data_ciphertext");

    if (error) throw error;

    const sanitizedIntegrations = await Promise.all(
      records.map(async (record) => {
        let decryptedData = { is_active: false, api_key: null };
        try {
          if (record.data_ciphertext) {
            decryptedData = await decryptJson(record.data_ciphertext, ENC_KEY);
          }
        } catch (e) {
          console.error(`Failed to decrypt data for service: ${record.service}`, e);
          // Return default values if decryption fails
        }

        return {
          id: record.id, // Keep the id for now as the UI uses it for keys
          service_name: record.service,
          environment: record.environment,
          updated_at: record.updated_at,
          is_active: decryptedData.is_active || false,
          api_key_set: !!decryptedData.api_key,
        };
      })
    );

    return new Response(JSON.stringify({ integrations: sanitizedIntegrations }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
