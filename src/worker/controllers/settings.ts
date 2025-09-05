import { corsHeaders } from '../utils/cors';
import type { Env } from '../env';

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export async function getSiteSettings(request: Request, env: Env): Promise<Response> {
  try {
    const settings = await env.PUPPIES_DB
      .prepare('SELECT key, value FROM site_settings')
      .all();

    const settingsObj: Record<string, any> = {};
    settings.results.forEach((setting: any) => {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObj[setting.key] = setting.value;
      }
    });

    return new Response(JSON.stringify(settingsObj), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Failed to fetch site settings', errorMessage, 500);
  }
}

export async function updateSiteSettings(request: Request, env: Env): Promise<Response> {
  try {
    const settings = await request.json();
    const now = new Date().toISOString();

    // Start a transaction by preparing all statements
    const statements = [];
    for (const [key, value] of Object.entries(settings)) {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      statements.push(
        env.PUPPIES_DB
          .prepare('INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)')
          .bind(key, jsonValue, now)
      );
    }

    // Execute all statements
    await Promise.all(statements.map(stmt => stmt.run()));

    return new Response(JSON.stringify({ message: 'Settings updated successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Failed to update site settings', errorMessage, 500);
  }
}

export async function getSetting(request: Request, env: Env, key: string): Promise<Response> {
  try {
    const setting = await env.PUPPIES_DB
      .prepare('SELECT value FROM site_settings WHERE key = ?')
      .bind(key)
      .first();

    if (!setting) {
      return createErrorResponse('Setting not found', `No setting found with key: ${key}`, 404);
    }

    let value;
    try {
      value = JSON.parse((setting as any).value);
    } catch {
      value = (setting as any).value;
    }

    return new Response(JSON.stringify({ key, value }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Failed to fetch setting', errorMessage, 500);
  }
}

export async function updateSetting(request: Request, env: Env, key: string): Promise<Response> {
  try {
    const { value } = await request.json();
    const now = new Date().toISOString();
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);

    await env.PUPPIES_DB
      .prepare('INSERT OR REPLACE INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)')
      .bind(key, jsonValue, now)
      .run();

    return new Response(JSON.stringify({ message: `Setting ${key} updated successfully`, key, value }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('Failed to update setting', errorMessage, 500);
  }
}