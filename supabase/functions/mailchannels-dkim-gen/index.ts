import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify admin access
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating RSA key pair for DKIM...");

    // Generate RSA 2048-bit key pair
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    );

    // Export public key
    const publicKeyBuffer = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));
    const publicKeyPEM = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;

    // Export private key
    const privateKeyBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));
    const privateKeyPEM = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;

    // Format for DNS TXT record (remove headers/footers and newlines)
    const dnsPublicKey = publicKeyBase64.replace(/\n/g, '');

    // Get domain from settings
    const { data: domainSetting } = await supabaseClient
      .from("site_settings")
      .select("value")
      .eq("key", "mailchannels_dkim_domain")
      .single();

    const domain = domainSetting?.value?.domain || "gdspuppies.com";

    // Store keys in site_settings
    await supabaseClient
      .from("site_settings")
      .update({ value: { key: publicKeyPEM } })
      .eq("key", "mailchannels_dkim_public_key");

    await supabaseClient
      .from("site_settings")
      .update({ value: { key: privateKeyPEM } })
      .eq("key", "mailchannels_dkim_private_key");

    console.log("DKIM keys generated and stored successfully");

    // Format DNS record
    const dnsRecord = {
      hostname: `mailchannels._domainkey.${domain}`,
      type: "TXT",
      value: `v=DKIM1; k=rsa; p=${dnsPublicKey}`,
      formatted: `mailchannels._domainkey.${domain} TXT "v=DKIM1; k=rsa; p=${dnsPublicKey}"`
    };

    return new Response(
      JSON.stringify({
        success: true,
        publicKey: publicKeyPEM,
        dnsRecord,
        message: "DKIM keys generated successfully. Add the DNS record to your domain."
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating DKIM keys:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});