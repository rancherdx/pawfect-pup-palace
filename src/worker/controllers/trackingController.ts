import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';
import { randomUUID } from 'crypto';
import { verifyJwtAuth // Assuming this can be used to optionally get user_id
} from '../auth';


// Helper for consistent error responses
function createErrorResponse(message: string, details: string | string[] | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface TrackVisitRequestBody {
  page_url: string;
  referrer_url?: string;
  visitor_id?: string; // Anonymous ID from cookie
}

interface SiteVisitData {
  id: string;
  visitor_id: string;
  user_id: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  user_agent: string | null;
  page_url: string;
  referrer_url: string | null;
  visit_timestamp: number;
  is_active: boolean;
  last_active_at: number;
}

// TODO: This function will be moved or properly implemented when WebSockets are set up.
// For now, it's a placeholder for the broadcasting logic.
async function broadcastAdminNotification(payload: any, env: Env) {
  console.log("Broadcasting admin notification (placeholder):", JSON.stringify(payload));
  // In a real implementation:
  // Iterate over active WebSocket connections (e.g., from a Durable Object or a global Set in the worker)
  // and send the payload:
  // env.ADMIN_NOTIFICATION_WEBSOCKETS.sendToAll(JSON.stringify(payload));
}


export async function trackVisitHandler(request: Request, env: Env): Promise<Response> {
  let requestBody: TrackVisitRequestBody;
  try {
    requestBody = await request.json();
  } catch (e: any) {
    return createErrorResponse('Invalid JSON request body.', e.message, 400);
  }

  const { page_url, referrer_url } = requestBody;
  let visitor_id = requestBody.visitor_id;

  if (!page_url) {
    return createErrorResponse('page_url is required.', null, 400);
  }

  // Extract data from request object
  const ip_address = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || null;
  const user_agent = request.headers.get('user-agent') || null;

  // Cloudflare specific geo data
  const cf: any = (request as any).cf || {};
  const country = cf.country || null;
  const city = cf.city || null;
  const region = cf.region || null;

  let user_id: string | null = null;
  let newVisitorIdGenerated = false;

  // Attempt to get user_id if authenticated
  // This assumes verifyJwtAuth can gracefully handle missing tokens and not throw error/return response
  try {
    const authResult = await verifyJwtAuth(request, env, true); // Pass true for optional auth
    if (authResult && authResult.authenticated && authResult.decodedToken) {
      user_id = authResult.decodedToken.userId;
    }
  } catch (authError) {
    // If verifyJwtAuth throws an error for unauthenticated users, catch it and proceed.
    // Or, ensure verifyJwtAuth (when optional) returns a specific non-error state.
    console.log("No authenticated user for this visit or error during auth check:", authError);
  }


  if (!user_id && !visitor_id) {
    visitor_id = randomUUID(); // Generate new anonymous visitor ID
    newVisitorIdGenerated = true;
  } else if (!visitor_id && user_id) {
    // If user is logged in but no anonymous visitor_id was passed (e.g., first visit after login),
    // use their user_id as the visitor_id for simplicity in this context, or generate a new one.
    // For this implementation, let's keep visitor_id distinct unless it's purely anonymous.
    // If a user-specific visitor_id is desired, that logic could be added.
    // For now, if user is logged in, their user_id is primary. If no visitor_id, it's fine.
    // The prompt implies visitor_id is primarily for anonymous users.
    // If visitor_id is not provided, but user_id is, we can consider user_id as the "visitor_id" for grouping.
    // However, the schema has both. So, if visitor_id is missing for a logged-in user, we might still generate one or use user_id.
    // Let's use user_id as visitor_id if the user is logged in AND no separate visitor_id is provided
    visitor_id = user_id;
  }


  const now = Math.floor(Date.now() / 1000);
  const visit_id = randomUUID();

  const visitData: SiteVisitData = {
    id: visit_id,
    visitor_id: visitor_id!, // Should be set by now if logic is correct
    user_id: user_id,
    ip_address: ip_address, // TODO: Consider hashing/anonymizing based on privacy policy
    country: country,
    city: city,
    region: region,
    user_agent: user_agent,
    page_url: page_url,
    referrer_url: referrer_url || null,
    visit_timestamp: now,
    is_active: true, // Assuming active on new track
    last_active_at: now,
  };

  try {
    const db = env.PUPPIES_DB;
    // Using INSERT OR REPLACE for is_active and last_active_at for a given visitor_id on a page could be an option
    // to keep only the latest "active" state per page, but that's more complex.
    // For now, just inserting every tracked event as a distinct record.
    // A separate process/query would be needed to determine currently "active" visitors.
    // The prompt implies `site_visits` is more of a log.
    // Let's refine the `is_active` and `last_active_at` logic.
    // For a simple heartbeat/visit log, each ping could be a new row.
    // Or, if we want to update the `last_active_at` for an ongoing session:
    // This would require an UPSERT based on visitor_id and perhaps page_url if we want to track activity per page.
    // For simplicity as per schema, let's just insert. `is_active` might be for WebSocket presence later.

    await db.prepare(
      `INSERT INTO site_visits (id, visitor_id, user_id, ip_address, country, city, region, user_agent, page_url, referrer_url, visit_timestamp, is_active, last_active_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      visitData.id,
      visitData.visitor_id,
      visitData.user_id,
      visitData.ip_address,
      visitData.country,
      visitData.city,
      visitData.region,
      visitData.user_agent,
      visitData.page_url,
      visitData.referrer_url,
      visitData.visit_timestamp,
      visitData.is_active,
      visitData.last_active_at
    ).run();

    console.log('Site visit logged:', visitData.id);

    // Prepare and send notification payload
    const notificationPayload = {
      type: 'new_visit', // Or 'visitor_active'
      data: {
        visit_id: visitData.id,
        visitor_id: visitData.visitor_id,
        user_id: visitData.user_id,
        page_url: visitData.page_url,
        city: visitData.city,
        country: visitData.country,
        timestamp: visitData.visit_timestamp,
      }
    };
    await broadcastAdminNotification(notificationPayload, env); // Call placeholder

    const responsePayload: any = { success: true, visit_id: visitData.id };
    if (newVisitorIdGenerated) {
      responsePayload.visitor_id = visitor_id; // Send back if newly generated for client cookie
    }

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error logging site visit:', error);
    return createErrorResponse('Failed to track visit.', error.message, 500);
  }
}
