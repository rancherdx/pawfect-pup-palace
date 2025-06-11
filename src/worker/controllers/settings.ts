import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

const SITE_SETTINGS_KEY = "site_settings";

// Interface for Tracking Settings
interface TrackingSettings {
  googleAnalyticsId?: string;
  googleSearchConsoleVerification?: string;
  facebookPixelId?: string;
  bingUetId?: string;
  customHeadScripts?: string;
  customBodyScripts?: string;
}

// Default settings structure, adjust as needed to match SettingsPanel.tsx expectations
const defaultSiteSettings = {
  siteName: "GDS Puppies",
  contactEmail: "contact@gdspuppies.example.com",
  maintenanceMode: false,
  logoUrl: "/images/default-logo.png", // Example path
  defaultLanguage: "en-US",
  currency: "USD",
  socialMediaLinks: {
    facebook: "https://facebook.com/gdspuppies",
    instagram: "https://instagram.com/gdspuppies",
    twitter: "https://twitter.com/gdspuppies"
  },
  seoDefaults: {
    title: "GDS Puppies - Your Premier Puppy Destination",
    description: "Find your new best friend from our loving litters of puppies.",
    keywords: "puppies, dogs, breeder, family pets"
  },
  tracking: { // New tracking settings field
    googleAnalyticsId: "",
    googleSearchConsoleVerification: "",
    facebookPixelId: "",
    bingUetId: "",
    customHeadScripts: "",
    customBodyScripts: "",
  } as TrackingSettings,
  // Add other settings fields expected by SettingsPanel.tsx here
  // e.g. themeColor, itemsPerPage, etc.
};

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

export async function getSiteSettings(request: Request, env: Env): Promise<Response> {
  try {
    const settingsJson = await env.AUTH_STORE.get(SITE_SETTINGS_KEY);
    if (settingsJson === null) {
      // No settings found, return default settings
      // Optionally, save default settings to KV here if desired:
      // await env.AUTH_STORE.put(SITE_SETTINGS_KEY, JSON.stringify(defaultSiteSettings));
      return new Response(JSON.stringify(defaultSiteSettings), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    let settings = JSON.parse(settingsJson);
    // Ensure tracking settings are present, merge with defaults if not
    settings.tracking = { ...defaultSiteSettings.tracking, ...(settings.tracking || {}) };

    return new Response(JSON.stringify(settings), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching or parsing site settings:", error);
    // If parsing failed, it might be good to return defaults or a specific error
    if (error instanceof SyntaxError) {
        return createErrorResponse("Failed to parse site settings", "Stored settings data is corrupted. Returning defaults.", 500);
        // As a fallback, could return defaultSiteSettings here too
        // return new Response(JSON.stringify(defaultSiteSettings), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error fetching settings.";
    return createErrorResponse("Failed to retrieve site settings", errorMessage, 500);
  }
}

export async function updateSiteSettings(request: Request, env: Env): Promise<Response> {
  try {
    const newSettings = await request.json();

    // Basic validation: ensure it's an object
    if (typeof newSettings !== 'object' || newSettings === null) {
      return createErrorResponse("Invalid request body", "Settings must be a JSON object.", 400);
    }

    // More specific validation (example: check for a required field)
    if (typeof newSettings.siteName === 'undefined') {
      // Retain existing settings if a full update is not provided, or merge.
      // For simplicity, this example assumes a full settings object is provided.
      // If partial updates are allowed, fetch existing, merge, then save.
      // For now, let's assume the client sends the whole settings object.
      // If siteName is critical and must exist:
      // return createErrorResponse("Invalid settings data", "siteName is a required field.", 400);
    }

    // For a robust system, you might want to merge with existing settings or validate all fields.
    // This example overwrites with the new settings object.
    // It's good practice to ensure newSettings conforms to a defined schema/interface.

    // For safety, merge with default settings to ensure all keys are present if client sends partial data
    // This also helps prevent removing essential keys if client sends a stripped-down object
    const currentSettingsJson = await env.AUTH_STORE.get(SITE_SETTINGS_KEY);
    let currentSettings = defaultSiteSettings; // Start with defaults
    if (currentSettingsJson) {
        try {
            currentSettings = JSON.parse(currentSettingsJson);
        } catch (e) {
            console.error("Error parsing current settings from KV, using defaults:", e);
            // currentSettings remains defaultSiteSettings
        }
    }

    // Ensure the tracking field itself exists before trying to spread it
    const updatedTrackingSettings = {
      ...(currentSettings.tracking || defaultSiteSettings.tracking), // Base with current or default tracking
      ...(newSettings.tracking || {}), // Apply new tracking settings
    };

    const mergedSettings = {
      ...currentSettings,
      ...newSettings,
      tracking: updatedTrackingSettings, // Ensure tracking is properly merged
    };


    await env.AUTH_STORE.put(SITE_SETTINGS_KEY, JSON.stringify(mergedSettings));

    return new Response(JSON.stringify({
        message: "Site settings updated successfully.",
        settings: mergedSettings
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error updating site settings:", error);
    if (error instanceof SyntaxError) { // JSON parsing error from request.json()
        return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error updating settings.";
    return createErrorResponse("Failed to update site settings", errorMessage, 500);
  }
}
