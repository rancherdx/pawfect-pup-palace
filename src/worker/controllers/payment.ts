import { Client, Environment, CreatePaymentRequest, Money, ApiError, Payment } from 'square';
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

/**
 * Initializes and returns a Square client instance.
 */
export function getSquareClient(env: Env): Client {
  const accessToken = env.SQUARE_ACCESS_TOKEN;
  const squareEnvironment =
    env.ENVIRONMENT_NAME?.toLowerCase() === 'production'
      ? Environment.Production
      : Environment.Sandbox;

  if (!accessToken) {
    throw new Error('SQUARE_ACCESS_TOKEN is not defined in environment variables.');
  }

  return new Client({
    environment: squareEnvironment,
    accessToken: accessToken,
  });
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
 * Processes a payment request using the Square API and records the transaction.
 */
export async function processPayment(request: Request, env: Env): Promise<Response> {
  try {
    getSquareClient(env);
  } catch (initError) {
     console.error('Critical: Square client could not be initialized due to missing configuration:', initError instanceof Error ? initError.message : initError);
     return createErrorResponse(
        "Payment processing unavailable",
        "The payment system is currently not configured. Please contact support.",
        500
     );
  }

  let squareClient: Client;
  try {
    squareClient = getSquareClient(env);
  } catch (error) {
    console.error('Failed to initialize Square client:', error instanceof Error ? error.message : error);
    return createErrorResponse(
      'Payment processing unavailable',
      'Could not connect to the payment provider.',
      500
    );
  }

  let requestBody: PaymentRequestBody;
  try {
    requestBody = await request.json();
  } catch (error) {
    console.error('Failed to parse request body as JSON:', error instanceof Error ? error.message : error);
    return createErrorResponse('Invalid request format', 'The request body was not valid JSON.', 400);
  }

  const { sourceId, amount, currency, locationId: clientLocationId, userId, puppyId, customerEmail: bodyCustomerEmail } = requestBody;

  if (!sourceId || typeof sourceId !== 'string') {
    return createErrorResponse('Invalid input', 'Missing or invalid payment source ID (sourceId).', 400);
  }
  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    return createErrorResponse('Invalid input', 'Missing, invalid, or non-positive amount.', 400);
  }
  if (!currency || typeof currency !== 'string' || currency.length !== 3) {
    return createErrorResponse('Invalid input', 'Missing or invalid currency code (must be 3 characters).', 400);
  }

  const amountMoney: Money = {
    amount: BigInt(amount), // Amount from request is in smallest unit (cents)
    currency: currency.toUpperCase(),
  };

  const paymentRequest: CreatePaymentRequest = {
    sourceId: sourceId,
    idempotencyKey: crypto.randomUUID(),
    amountMoney: amountMoney,
    locationId: clientLocationId || env.SQUARE_LOCATION_ID,
  };

  try {
    const { result, statusCode, errors: squareErrors } = await squareClient.paymentsApi.createPayment(paymentRequest);

    if (squareErrors && squareErrors.length > 0) {
      console.error('Square API Error during payment creation. Status:', statusCode, 'Errors:', JSON.stringify(squareErrors, null, 2));
      const primaryError = squareErrors[0];
      let detailMessage = "The payment provider declined the transaction or reported an error.";
      if (primaryError.code === 'GENERIC_DECLINE') {
        detailMessage = "The payment was declined. Please try a different payment method or contact your bank.";
      } else if (primaryError.category === 'VALIDATION_ERROR') {
        detailMessage = `There was a validation error with the payment details: ${primaryError.detail || 'Please check your input.'}`;
      }

      return createErrorResponse('Payment failed', detailMessage, statusCode && statusCode >= 400 && statusCode < 500 ? statusCode : 400);
    }

    const squarePayment = result.payment;

    if (squarePayment && squarePayment.id && squarePayment.amountMoney && squarePayment.status) {
      console.log('Payment successful with Square. Payment ID:', squarePayment.id, 'Status:', squarePayment.status);

      // TODO: Future - Implement Square Transaction Risk Assessment here before finalizing order or based on webhook data.
      // This could involve checking squarePayment.riskEvaluation or other fraud indicators if available from Square's response.
      // Based on the risk level, we might decide to hold the order, request further verification, or proceed.

      // Record transaction in D1
      let dbTransactionId: string | null = null;
      try {
        const transactionId = crypto.randomUUID();
        dbTransactionId = transactionId; // Store for potential use in email if needed
        const now = new Date().toISOString();
        let paymentMethodDetails = null;
        if (squarePayment.cardDetails && squarePayment.cardDetails.card) {
          paymentMethodDetails = JSON.stringify({
            brand: squarePayment.cardDetails.card.cardBrand,
            last4: squarePayment.cardDetails.card.last4,
            type: squarePayment.cardDetails.card.cardType,
          });
        }

        const stmt = env.PUPPIES_DB.prepare(
          'INSERT INTO transactions (id, user_id, puppy_id, square_payment_id, amount, currency, payment_method_details, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        await stmt.bind(
          transactionId, userId || null, puppyId || null, squarePayment.id,
          Number(squarePayment.amountMoney.amount),
          squarePayment.amountMoney.currency, paymentMethodDetails, squarePayment.status,
          now, now
        ).run();
        console.log('Transaction recorded successfully in database. Transaction ID:', transactionId);

        // Send payment receipt email
        let finalCustomerEmail = bodyCustomerEmail;
        let customerName = "Valued Customer";

        if (userId && !finalCustomerEmail) { // If no email in body, try to get from user profile
            const user = await env.PUPPIES_DB.prepare("SELECT email, name FROM users WHERE id = ?").bind(userId).first<{email: string; name: string;}>();
            if (user && user.email) {
                finalCustomerEmail = user.email;
                customerName = user.name || customerName;
            } else {
                console.warn(`User with ID ${userId} not found or has no email, cannot send payment receipt.`);
            }
        }

        if (finalCustomerEmail) {
            const emailData = {
                name: customerName,
                order_id: squarePayment.id,
                // Format amount from smallest unit (e.g., cents) to standard display (e.g., dollars)
                // This is a common practice; adjust divisor based on currency's smallest unit.
                amount: (Number(squarePayment.amountMoney.amount) / 100).toFixed(2),
                currency: squarePayment.amountMoney.currency || currency,
                order_link: `/user/orders/${squarePayment.orderId || squarePayment.id}` // Example link
            };
            sendTemplatedEmail(env, finalCustomerEmail, 'payment_receipt', emailData)
              .then(emailResult => {
                console.log(`Payment receipt email attempt for order ${squarePayment.id} to ${finalCustomerEmail}:`, emailResult.success, emailResult.message);
              })
              .catch(emailError => {
                console.error(`Error queuing payment receipt email for order ${squarePayment.id}:`, emailError);
              });
        } else {
            console.warn(`No customer email available for order ${squarePayment.id}; cannot send payment receipt.`);
        }

      } catch (dbError) {
        console.error('CRITICAL: Failed to record successful transaction in database. Payment ID:', squarePayment.id, 'Error:', dbError instanceof Error ? dbError.message : dbError, dbError);
        // Email sending for receipt might be skipped if DB fails here before email logic.
      }

      return new Response(
        JSON.stringify({
          message: 'Payment successful.',
          payment: {
            id: squarePayment.id,
            status: squarePayment.status,
            amountMoney: {
                amount: Number(squarePayment.amountMoney.amount),
                currency: squarePayment.amountMoney.currency
            },
            receiptUrl: squarePayment.receiptUrl,
            orderId: squarePayment.orderId,
            cardLast4: squarePayment.cardDetails?.card?.last4,
            cardBrand: squarePayment.cardDetails?.card?.cardBrand,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error('Square payment response missing critical payment details, though no explicit errors reported by SDK. Response:', JSON.stringify(result, null, 2));
      return createErrorResponse('Payment confirmation incomplete', 'Received an unexpected or incomplete response from the payment provider.', 500);
    }

  } catch (error) {
    let status = 500;
    let message = 'An unexpected error occurred during payment processing.';
    let details: string | null = 'Please try again later or contact support if the issue persists.';

    if (error instanceof ApiError) {
      console.error('Square API Error (caught in general catch block):', error.statusCode, JSON.stringify(error.result, null, 2), error.stack);
      message = 'Payment processing error.';
      details = 'There was an error communicating with the payment provider.';
      status = error.statusCode && error.statusCode >= 400 && error.statusCode < 600 ? error.statusCode : 500;
      if (error.errors && error.errors.length > 0) {
          const primaryError = error.errors[0];
          if (primaryError.category === 'AUTHENTICATION_ERROR') {
              message = 'Payment provider authentication error.';
              details = "There's an issue with the payment system's configuration. Please contact support.";
              status = 500;
          } else {
             details = `Payment provider reported: ${primaryError.code} - ${primaryError.detail || 'No additional details.'}`;
          }
      }
    } else if (error instanceof Error) {
      console.error('Generic error during payment processing:', error.message, error.stack);
    } else {
      console.error('Unknown error type during payment processing:', error);
    }
    return createErrorResponse(message, details, status);
  }
}


/**
 * Handles incoming Square webhooks.
 */
export async function handleSquareWebhook(request: Request, env: Env): Promise<Response> {
  // 1. Signature Verification
  const squareSignature = request.headers.get('X-Square-Signature');
  if (!squareSignature) {
    console.warn('Missing X-Square-Signature header on webhook request.');
    return createErrorResponse('Unauthorized', 'Missing webhook signature.', 401);
  }

  const { SQUARE_WEBHOOK_SIGNATURE_KEY } = env;
  if (!SQUARE_WEBHOOK_SIGNATURE_KEY) {
    console.error('CRITICAL: SQUARE_WEBHOOK_SIGNATURE_KEY is not configured.');
    return createErrorResponse('Internal Server Error', 'Webhook processing is not configured.', 500);
  }

  const requestUrl = request.url;
  const rawBodyText = await request.text(); // Raw body for signature
  const stringToSign = requestUrl + rawBodyText;

  try {
    const keyData = new TextEncoder().encode(SQUARE_WEBHOOK_SIGNATURE_KEY);
    const importedKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC', importedKey, new TextEncoder().encode(stringToSign)
    );
    const calculatedSignature = bufferToBase64(signatureBuffer);

    if (calculatedSignature !== squareSignature) {
      console.warn('Webhook signature mismatch. Calculated:', calculatedSignature, 'Received:', squareSignature);
      return createErrorResponse('Unauthorized', 'Invalid webhook signature.', 401);
    }
    console.log('Webhook signature verified successfully.');

  } catch (sigError) {
    console.error('Error during webhook signature verification:', sigError instanceof Error ? sigError.message : sigError, sigError);
    return createErrorResponse('Internal Server Error', 'Could not verify webhook signature.', 500);
  }

  // 2. Process Event
  try {
    const event = JSON.parse(rawBodyText);
    console.log(`Received Square webhook event: Type: ${event.type}, ID: ${event.id}`);

    switch (event.type) {
      case 'payment.updated':
        const payment = event.data?.object?.payment;
        if (!payment || !payment.id || !payment.status) {
          console.error('Webhook event "payment.updated" missing critical data:', payment);
          return createErrorResponse('Bad Request', 'Malformed payment.updated event data.', 400);
        }

        const { id: squarePaymentId, status: newStatus } = payment;
        const updatedAt = new Date().toISOString();

        console.log(`Processing payment.updated: ID=${squarePaymentId}, New Status=${newStatus}`);

        try {
          const stmt = env.PUPPIES_DB.prepare(
            'UPDATE transactions SET status = ?, updated_at = ? WHERE square_payment_id = ?'
          );
          const dbResult = await stmt.bind(newStatus, updatedAt, squarePaymentId).run();

          if (dbResult.changes > 0) {
            console.log(`Transaction ${squarePaymentId} updated successfully in DB. New status: ${newStatus}. Rows affected: ${dbResult.changes}`);
          } else {
            console.warn(`No transaction found in DB for square_payment_id: ${squarePaymentId} to update. Or status was already ${newStatus}.`);
          }
        } catch (dbError) {
          console.error(`Failed to update transaction ${squarePaymentId} in DB:`, dbError instanceof Error ? dbError.message : dbError, dbError);
        }
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}. Acknowledging receipt.`);
    }

    return new Response(JSON.stringify({ status: 'success', message: 'Webhook processed' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (parseError) {
    console.error('Failed to parse webhook event body:', parseError instanceof Error ? parseError.message : parseError);
    return createErrorResponse('Bad Request', 'Could not parse webhook event JSON.', 400);
  }
}
