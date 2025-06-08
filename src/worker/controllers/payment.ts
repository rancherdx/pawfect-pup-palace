
import type { Env } from '../env';
import { corsHeaders } from '../utils/cors'; // For consistent CORS headers
import { sendTemplatedEmail } from '../utils/emailService'; // Added import

// Helper function to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface PaymentRequestBody {
  sourceId: string;
  amount: number;
  currency: string;
  locationId?: string;
  userId?: string;
  puppyId?: string;
  customerEmail?: string; // Optional email for receipt
}

function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Processes a payment request and records the transaction.
 * Note: Square integration disabled due to import issues
 */
export async function processPayment(request: Request, env: Env): Promise<Response> {
  return createErrorResponse(
    'Payment processing temporarily unavailable',
    'Square integration is currently disabled due to configuration issues.',
    503
  );
}

/**
 * Handles incoming Square webhooks.
 * Note: Square integration disabled due to import issues
 */
export async function handleSquareWebhook(request: Request, env: Env): Promise<Response> {
  return createErrorResponse(
    'Webhook processing temporarily unavailable',
    'Square webhook processing is currently disabled due to configuration issues.',
    503
  );
}
