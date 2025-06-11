import { apiRequest } from '@/api/client'; // Assuming this can be used client-side

const VISITOR_ID_COOKIE_NAME = 'gds_visitor_id';
const COOKIE_EXPIRATION_DAYS = 365;

// --- Cookie Helper Functions ---
function setCookie(name: string, value: string, days: number): void {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// --- Visitor ID Management ---
let currentVisitorId: string | null = null;

function getVisitorId(): string {
  if (currentVisitorId) {
    return currentVisitorId;
  }

  let visitorId = getCookie(VISITOR_ID_COOKIE_NAME);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    setCookie(VISITOR_ID_COOKIE_NAME, visitorId, COOKIE_EXPIRATION_DAYS);
    console.log('New visitor ID generated:', visitorId);
  }
  currentVisitorId = visitorId;
  return visitorId;
}

// --- Tracking Function ---
export async function trackCurrentPageVisit(): Promise<void> {
  const visitorId = getVisitorId();
  const page_url = window.location.href;
  const referrer_url = document.referrer || undefined; // Ensure undefined if empty for cleaner JSON

  console.log('Tracking page visit:', { page_url, referrer_url, visitor_id: visitorId });

  try {
    const response = await apiRequest<{ success: boolean, visit_id: string, visitor_id?: string }>(
      '/track-visit',
      {
        method: 'POST',
        body: {
          page_url,
          referrer_url,
          visitor_id: visitorId,
        },
      }
    );

    if (response.success) {
      console.log('Visit tracked successfully. Visit ID:', response.visit_id);
      if (response.visitor_id && response.visitor_id !== visitorId) {
        // This case might happen if the backend decided to issue a new ID,
        // for example, if a logged-in user previously had an anonymous ID.
        console.log('Backend provided new visitor ID:', response.visitor_id, 'Updating cookie.');
        currentVisitorId = response.visitor_id; // Update in-memory cache
        setCookie(VISITOR_ID_COOKIE_NAME, response.visitor_id, COOKIE_EXPIRATION_DAYS);
      }
    } else {
      console.warn('Failed to track visit via API.');
    }
  } catch (error) {
    console.error('Error tracking page visit:', error);
  }
}
