import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';
import { encryptApiKey, decryptApiKey } // Assuming decryptApiKey might be used for a GET by ID if we were to return the key
from '../utils/encryption';

// Consistent error response utility
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface IntegrationRecord {
  id: string;
  service_name: string;
  other_config?: string | null; // Stored as JSON string
  is_active: boolean | number; // DB might store as 0/1
  created_at: string;
  updated_at: string;
  // api_key is intentionally omitted for client responses
}


export async function listIntegrations(request: Request, env: Env): Promise<Response> {
  try {
    const { results } = await env.PUPPIES_DB.prepare(
      "SELECT id, service_name, other_config, is_active, created_at, updated_at FROM third_party_integrations"
    ).all<IntegrationRecord>();

    const integrations = results.map(record => ({
        ...record,
        is_active: Boolean(record.is_active) // Ensure boolean
    }));

    return new Response(JSON.stringify(integrations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error listing integrations:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Failed to list integrations", errorMessage, 500);
  }
}

export async function createIntegration(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as {
      service_name?: string;
      api_key?: string; // Plain text API key from client
      other_config?: Record<string, unknown> | string; // Can be object or JSON string
      is_active?: boolean;
    };

    if (!body.service_name || typeof body.service_name !== 'string') {
      return createErrorResponse("Validation Error", "service_name is required and must be a string.", 400);
    }
    if (body.other_config && typeof body.other_config !== 'object' && typeof body.other_config !== 'string') {
        return createErrorResponse("Validation Error", "other_config must be an object or a valid JSON string.", 400);
    }

    let storedApiKey: string | null = null;
    if (body.api_key && typeof body.api_key === 'string' && body.api_key.trim() !== '') {
      const encryptionResult = await encryptApiKey(body.api_key, env);
      if (!encryptionResult) {
        return createErrorResponse("Encryption Error", "Failed to encrypt API key. Check ENCRYPTION_KEY_SECRET.", 500);
      }
      storedApiKey = `${encryptionResult.iv}:${encryptionResult.encryptedKey}`;
    }

    const otherConfigString = typeof body.other_config === 'object'
        ? JSON.stringify(body.other_config)
        : (body.other_config || null);


    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const isActive = body.is_active === undefined ? false : Boolean(body.is_active);


    await env.PUPPIES_DB.prepare(
      "INSERT INTO third_party_integrations (id, service_name, api_key, other_config, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(id, body.service_name, storedApiKey, otherConfigString, isActive ? 1 : 0, now, now)
     .run();

    const newIntegration: IntegrationRecord = {
      id,
      service_name: body.service_name,
      other_config: otherConfigString,
      is_active: isActive,
      created_at: now,
      updated_at: now,
    };

    return new Response(JSON.stringify(newIntegration), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error creating integration:", error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    // @ts-ignore
    if (error.message && error.message.includes("UNIQUE constraint failed: third_party_integrations.service_name")) {
        return createErrorResponse("Conflict", `An integration with service name "${(error as { values?: { service_name?: string } })?.values?.service_name || 'provided'}" already exists.`, 409);
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Failed to create integration", errorMessage, 500);
  }
}

export async function updateIntegration(request: Request, env: Env, integrationId: string): Promise<Response> {
  if (!integrationId) {
      return createErrorResponse("Bad Request", "Integration ID is required in the URL path.", 400);
  }
  try {
    const body = await request.json() as {
      api_key?: string | null; // Plain text API key, empty string or null to clear
      other_config?: Record<string, unknown> | string;
      is_active?: boolean;
      // service_name cannot be updated
    };

    // Fetch existing to ensure it's there
    const existing = await env.PUPPIES_DB.prepare("SELECT id FROM third_party_integrations WHERE id = ?")
        .bind(integrationId).first();
    if (!existing) {
        return createErrorResponse("Not Found", `Integration with ID ${integrationId} not found.`, 404);
    }
     if (body.other_config && typeof body.other_config !== 'object' && typeof body.other_config !== 'string') {
        return createErrorResponse("Validation Error", "other_config must be an object or a valid JSON string.", 400);
    }

    const updates: Record<string, any> = {};
    const params: any[] = [];

    if (body.api_key !== undefined) { // Check if api_key field was explicitly provided
      if (body.api_key && typeof body.api_key === 'string' && body.api_key.trim() !== '') {
        const encryptionResult = await encryptApiKey(body.api_key, env);
        if (!encryptionResult) {
          return createErrorResponse("Encryption Error", "Failed to encrypt API key. Check ENCRYPTION_KEY_SECRET.", 500);
        }
        updates.api_key = `${encryptionResult.iv}:${encryptionResult.encryptedKey}`;
      } else {
        // API key is empty string or null, so clear it
        updates.api_key = null;
      }
    }

    if (body.other_config !== undefined) {
         updates.other_config = typeof body.other_config === 'object'
            ? JSON.stringify(body.other_config)
            : (body.other_config || null);
    }

    if (body.is_active !== undefined) {
      updates.is_active = body.is_active ? 1 : 0;
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse("Bad Request", "No fields provided for update.", 400);
    }

    updates.updated_at = new Date().toISOString();

    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), integrationId];

    await env.PUPPIES_DB.prepare(`UPDATE third_party_integrations SET ${setClauses} WHERE id = ?`)
      .bind(...values)
      .run();

    // Fetch the updated record to return (without api_key)
    const updatedRecord = await env.PUPPIES_DB.prepare(
        "SELECT id, service_name, other_config, is_active, created_at, updated_at FROM third_party_integrations WHERE id = ?"
    ).bind(integrationId).first<IntegrationRecord>();

    if (!updatedRecord) { // Should not happen if update was successful on existing ID
        return createErrorResponse("Internal Server Error", "Failed to retrieve updated integration record.", 500);
    }

    return new Response(JSON.stringify({ ...updatedRecord, is_active: Boolean(updatedRecord.is_active) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error updating integration ${integrationId}:`, error);
    if (error instanceof SyntaxError) {
        return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Failed to update integration", errorMessage, 500);
  }
}

export async function deleteIntegration(request: Request, env: Env, integrationId: string): Promise<Response> {
   if (!integrationId) {
      return createErrorResponse("Bad Request", "Integration ID is required in the URL path.", 400);
  }
  try {
    const result = await env.PUPPIES_DB.prepare("DELETE FROM third_party_integrations WHERE id = ?")
      .bind(integrationId)
      .run();

    if (result.changes === 0) {
      return createErrorResponse("Not Found", `Integration with ID ${integrationId} not found.`, 404);
    }

    return new Response(JSON.stringify({ message: "Integration deleted successfully." }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error deleting integration ${integrationId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Failed to delete integration", errorMessage, 500);
  }
}
