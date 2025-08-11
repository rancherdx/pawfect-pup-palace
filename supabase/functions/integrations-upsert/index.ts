import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function encryptJson(json: unknown, base64Key: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(JSON.stringify(json));
  const keyBytes = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  if (keyBytes.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes (base64-encoded)");
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  const ivB64 = btoa(String.fromCharCode(...iv));
  const ctB64 = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  return `${ivB64}:${ctB64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, environment, data } = await req.json();
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

    const data_ciphertext = await encryptJson(data, ENC_KEY);

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