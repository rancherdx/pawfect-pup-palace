
import type { Env } from '../env';
import { corsHeaders } from '../utils/cors'; // For consistent CORS headers
import { sendTemplatedEmail } from '../utils/emailService'; // Added import
import { Client, Environment } from 'square'; // Import Square SDK
import { randomUUID } from 'crypto'; // For idempotency key

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
  sourceId: string; // This is the nonce from Square Web Payments SDK
  amount: number; // Amount in cents
  currency: string; // e.g., 'USD'
  locationId?: string; // Optional: Square location ID
  userId?: string; // Your internal user ID
  puppyId?: string; // Your internal puppy ID for tracking the purchase
  customerEmail?: string; // Optional email for receipt
  idempotencyKey?: string; // Optional: client-generated idempotency key
  authorizeOnly?: boolean; // For pre-authorization
  puppy_credits_to_apply?: number; // Amount of puppy credits to apply in cents
}

// Records a payment transaction in the D1 database.
async function recordPayment(
  env: Env,
  paymentDetails: {
    id: string; // Internal UUID for the payment record
    square_payment_id?: string | null; // Null if fully paid by credits
    status?: string;
    amount: number; // Net amount charged to primary payment source (e.g., card). Could be 0 if fully paid by credits.
    currency?: string;
    source_type?: string; // e.g., CARD, PUPPY_CREDIT
    receipt_url?: string | null; // Null if not applicable (e.g. puppy credit)
    user_id?: string;
    puppy_id?: string;
    created_at?: string;
    original_amount_before_credits?: number; // Gross amount before credits
    credits_applied_amount?: number; // Amount covered by credits
  }
): Promise<void> {
  // Log extended details if credits were used
  console.log('Recording payment with details:', JSON.stringify(paymentDetails, null, 2));

  const {
    id,
    square_payment_id,
    status,
    amount,
    currency,
    source_type,
    receipt_url,
    user_id,
    puppy_id,
    created_at
  } = paymentDetails;

  // Use current time if created_at is not provided
  const db_created_at = paymentDetails.created_at || new Date().toISOString();

  // TODO: Extend payments table schema to include original_amount_before_credits and credits_applied_amount
  // For now, these will not be inserted into DB unless schema is updated.
  // We will insert the net amount (amount charged to card/Square) into the 'amount' column.
  console.log(
    `Recording payment: UserID: ${paymentDetails.user_id}, PuppyID: ${paymentDetails.puppy_id}, Original Amount: ${paymentDetails.original_amount_before_credits}, Credits Applied: ${paymentDetails.credits_applied_amount}, Net Amount: ${paymentDetails.amount}, Source: ${paymentDetails.source_type}`
  );

  try {
    // Assuming 'payments' table has 'amount' for the net amount charged to the external source.
    // Additional columns 'original_amount' and 'credits_applied' would be ideal.
    const stmt = env.DB.prepare(`
      INSERT INTO payments (
        id, square_payment_id, status, amount, currency,
        source_type, receipt_url, user_id, puppy_id, created_at
        -- Potentially: , original_amount_before_credits, credits_applied_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?  /*, ?, ? */ )
    `);

    const { success, meta } = await stmt.bind(
      paymentDetails.id,
      paymentDetails.square_payment_id || null,
      paymentDetails.status || null,
      paymentDetails.amount, // Net amount charged
      paymentDetails.currency || null,
      paymentDetails.source_type || null,
      paymentDetails.receipt_url || null,
      paymentDetails.user_id || null,
      paymentDetails.puppy_id || null,
      db_created_at
      // paymentDetails.original_amount_before_credits || paymentDetails.amount, // If schema updated
      // paymentDetails.credits_applied_amount || 0                         // If schema updated
    ).run();

    if (success) {
      console.log(`Payment recorded successfully in DB. Internal ID: ${paymentDetails.id}, Square ID: ${paymentDetails.square_payment_id}`);
    } else {
      console.error(`Failed to record payment in DB. Internal ID: ${paymentDetails.id}, Square ID: ${paymentDetails.square_payment_id}. Meta:`, meta);
    }
  } catch (dbError: any) {
    console.error(`Error recording payment to DB (Internal ID: ${paymentDetails.id}, Square ID: ${paymentDetails.square_payment_id}):`, dbError.message, dbError.cause);
  }
}


function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Processes a payment request and records the transaction.
 */
export async function processPayment(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', null, 405);
  }

  let body: PaymentRequestBody;
  try {
    body = await request.json();
  } catch (e) {
    return createErrorResponse('Invalid JSON request body', e.message, 400);
  }

  const { sourceId, amount: originalAmount, currency, userId, puppyId, customerEmail, authorizeOnly, puppy_credits_to_apply } = body;
  let amountToChargeSquare = originalAmount;
  let creditsAppliedAmount = 0;
  const db = env.DB; // Assuming PUPPIES_DB is env.DB or similar for puppy credits tables

  if (!originalAmount || typeof originalAmount !== 'number' || originalAmount <= 0) {
      return createErrorResponse('Invalid original amount', 'Amount must be a positive number (in cents).', 400);
  }
  if (!currency) {
      return createErrorResponse('Missing currency information', null, 400);
  }


  // --- Puppy Credits Logic ---
  if (puppy_credits_to_apply && puppy_credits_to_apply > 0) {
    if (!userId) {
      return createErrorResponse('User authentication required to apply puppy credits.', null, 401);
    }

    const creditsRecord = await db.prepare("SELECT balance FROM user_puppy_credits WHERE user_id = ?").bind(userId).first<{ balance: number }>();
    const userBalance = creditsRecord ? creditsRecord.balance : 0;

    if (userBalance <= 0) {
      // No credits to apply, proceed as normal but inform client? Or just ignore. For now, ignore.
      console.log(`User ${userId} requested to apply credits, but balance is ${userBalance}.`);
    } else {
      const creditsToActuallyApply = Math.min(puppy_credits_to_apply, userBalance, originalAmount);
      if (creditsToActuallyApply > 0) {
        amountToChargeSquare = originalAmount - creditsToActuallyApply;
        creditsAppliedAmount = creditsToActuallyApply;
        console.log(`Applying ${creditsAppliedAmount} puppy credits for user ${userId}. Original amount: ${originalAmount}, New amount for Square: ${amountToChargeSquare}`);
      }
    }
  }
  // --- End Puppy Credits Logic ---

  // If fully paid by credits
  if (amountToChargeSquare <= 0 && creditsAppliedAmount > 0) {
    if (!userId) return createErrorResponse('User ID is required for credit-only payment.', null, 400); // Should have been caught earlier

    const now = Math.floor(Date.now() / 1000);
    const creditTransactionId = crypto.randomUUID();
    const paymentRecordId = randomUUID();

    try {
      // Atomically debit credits and record transaction
      await db.batch([
        db.prepare("UPDATE user_puppy_credits SET balance = balance - ?, last_updated_at = ? WHERE user_id = ?").bind(creditsAppliedAmount, now, userId),
        db.prepare("INSERT INTO puppy_credit_transactions (id, user_id, type, amount, description, related_order_id, created_at) VALUES (?, ?, 'redeem', ?, ?, ?, ?)")
          .bind(creditTransactionId, userId, -creditsAppliedAmount, `Redeemed for order/puppy: ${puppyId || 'N/A'}`, paymentRecordId, now)
      ]);

      await recordPayment(env, {
        id: paymentRecordId,
        square_payment_id: null, // No Square payment
        status: 'COMPLETED', // Or a custom status like 'PAID_BY_CREDIT'
        amount: 0, // Net amount charged to external source is 0
        currency: currency,
        source_type: 'PUPPY_CREDIT',
        receipt_url: null,
        user_id: userId,
        puppy_id: puppyId,
        created_at: new Date(now * 1000).toISOString(),
        original_amount_before_credits: originalAmount,
        credits_applied_amount: creditsAppliedAmount,
      });

      // TODO: Send custom receipt for puppy credit only payment if needed
      console.log(`Order fully paid with ${creditsAppliedAmount} puppy credits for user ${userId}.`);
      return new Response(JSON.stringify({
        success: true,
        message: "Payment completed fully with puppy credits.",
        payment: {
            id: paymentRecordId, // Internal payment ID
            status: 'COMPLETED',
            amountMoney: { amount: 0, currency: currency },
            sourceType: 'PUPPY_CREDIT',
            creditsApplied: creditsAppliedAmount,
            originalAmount: originalAmount,
        }
      }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (creditError: any) {
      console.error(`Error debiting puppy credits for user ${userId} after full payment attempt:`, creditError);
      return createErrorResponse('Failed to process puppy credit debit. Payment not completed.', creditError.message, 500);
    }
  }

  // If partially paid by credits or no credits used, and sourceId is required for Square
  if (!sourceId && amountToChargeSquare > 0) {
     return createErrorResponse('Payment source ID is required when amount is due.', 'sourceId is missing.', 400);
  }


  // Proceed with Square payment if amountToChargeSquare > 0
  try {
    const { paymentsApi } = new Client({
      environment: env.ENV === 'production' ? Environment.Production : Environment.Sandbox,
      accessToken: env.SQUARE_ACCESS_TOKEN,
    });

    const idempotencyKey = body.idempotencyKey || randomUUID(); // Re-evaluate idempotency if credits change the effective request
    const createPaymentRequest: any = {
      sourceId: sourceId,
      idempotencyKey: idempotencyKey,
      amountMoney: {
        amount: BigInt(amountToChargeSquare),
        currency: currency,
      },
    };

    if (authorizeOnly) {
      createPaymentRequest.autocomplete = false;
      console.log(`Square Payment intent: Authorize Only for amount ${amountToChargeSquare} ${currency}. Idempotency Key: ${idempotencyKey}`);
    } else {
      console.log(`Square Payment intent: Capture Immediately for amount ${amountToChargeSquare} ${currency}. Idempotency Key: ${idempotencyKey}`);
    }

    const paymentResponse = await paymentsApi.createPayment(createPaymentRequest);
    const paymentResult = paymentResponse.result.payment;

    if (paymentResult) {
      // If payment was successful and credits were applied, now debit them.
      if (userId && creditsAppliedAmount > 0) {
        const now = Math.floor(Date.now() / 1000);
        const creditTransactionId = crypto.randomUUID();
        try {
          await db.batch([
            db.prepare("UPDATE user_puppy_credits SET balance = balance - ?, last_updated_at = ? WHERE user_id = ?").bind(creditsAppliedAmount, now, userId),
            db.prepare("INSERT INTO puppy_credit_transactions (id, user_id, type, amount, description, related_order_id, admin_user_id, created_at) VALUES (?, ?, 'redeem', ?, ?, ?, NULL, ?)")
              .bind(creditTransactionId, userId, -creditsAppliedAmount, `Redeemed for order/puppy: ${puppyId || 'N/A'} (Square Payment: ${paymentResult.id})`, paymentResult.id, now)
          ]);
          console.log(`Successfully debited ${creditsAppliedAmount} puppy credits from user ${userId} after Square payment.`);
        } catch (creditError: any) {
          console.error(`CRITICAL: Failed to debit puppy credits for user ${userId} AFTER successful Square payment ${paymentResult.id}. Error: ${creditError.message}. Manual intervention required.`);
          // TODO: Implement a robust mechanism for handling this scenario (e.g., queue for retry, admin alert).
          // Potentially auto-refund the Square payment if credits can't be debited, though this adds more complexity.
        }
      }

      await recordPayment(env, {
        id: randomUUID(),
        square_payment_id: paymentResult.id,
        status: paymentResult.status,
        amount: Number(paymentResult.amountMoney?.amount), // Net amount charged by Square
        currency: paymentResult.amountMoney?.currency,
        source_type: paymentResult.sourceType,
        receipt_url: paymentResult.receiptUrl,
        user_id: userId,
        puppy_id: puppyId,
        created_at: paymentResult.createdAt,
        original_amount_before_credits: originalAmount,
        credits_applied_amount: creditsAppliedAmount,
      });

      if (!authorizeOnly && customerEmail && paymentResult.receiptUrl && env.SENDGRID_API_KEY && env.SENDGRID_FROM_EMAIL) {
        try {
            await sendTemplatedEmail(
                env,
                customerEmail,
                'Your Puppy Purchase Receipt', // Subject
                `Thank you for your purchase! View your receipt here: ${paymentResult.receiptUrl}`, // Plain text content
                // HTML content can be more elaborate, e.g., using a SendGrid template ID
                `<p>Thank you for your purchase! You can view your receipt <a href="${paymentResult.receiptUrl}">here</a>.</p>`,
                // templateId: env.SENDGRID_RECEIPT_TEMPLATE_ID // If using a template
            );
            console.log('Receipt email sent to:', customerEmail);
        } catch (emailError) {
            console.error('Failed to send receipt email:', emailError);
            // Do not fail the payment if email sending fails
        }
      }


      return new Response(
        JSON.stringify({ success: true, payment: paymentResult }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return createErrorResponse('Payment creation failed', 'No payment result returned from Square.', 500);
    }
  } catch (error: any) {
    console.error('Square API Error:', error);
    // Check for Square specific error details
    if (error.errors && error.errors.length > 0) {
        const squareError = error.errors[0];
        return createErrorResponse(
            `Square API Error: ${squareError.category} - ${squareError.code}`,
            squareError.detail,
            error.statusCode || 500 // Use Square's status code if available
        );
    }
    return createErrorResponse('Payment processing error', error.message || 'An unknown error occurred.', 500);
  }
}

/**
 * Handles incoming Square webhooks.
 */
export async function handleSquareWebhook(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', null, 405);
  }

  // Basic Webhook Signature Verification (if key is available)
  const signature = request.headers.get('x-square-signature');
  const webhookUrl = request.url; // The URL the webhook was sent to

  if (env.SQUARE_WEBHOOK_SIGNATURE_KEY && signature) {
    try {
      const bodyText = await request.clone().text(); // Clone request to read body
      const dataToVerify = webhookUrl + bodyText;
      const encoder = new TextEncoder();

      const importedKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(env.SQUARE_WEBHOOK_SIGNATURE_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const calculatedSignatureBuffer = await crypto.subtle.sign(
        'HMAC',
        importedKey,
        encoder.encode(dataToVerify)
      );

      // Convert ArrayBuffer to Base64 string for comparison
      const calculatedSignatureBase64 = bufferToBase64(calculatedSignatureBuffer);

      if (calculatedSignatureBase64 !== signature) {
        console.warn(`Invalid Square webhook signature. URL: ${webhookUrl}, Received: ${signature}, Calculated: ${calculatedSignatureBase64}`);
        return createErrorResponse('Invalid webhook signature', null, 401);
      }
      console.log('Square webhook signature verified successfully.');
    } catch (sigError: any) {
      console.error('Error during webhook signature verification:', sigError);
      return createErrorResponse('Webhook signature verification failed', sigError.message, 500);
    }
  } else if (!env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
    console.warn('SQUARE_WEBHOOK_SIGNATURE_KEY is not configured. Skipping webhook signature verification. THIS IS INSECURE FOR PRODUCTION.');
    // Depending on security requirements, you might choose to reject webhooks if the key is missing in production
  } else if (!signature) {
    console.warn('Missing x-square-signature header in webhook request.');
    // Optionally, reject if signature is expected but missing
  }

  try {
    const webhookData = await request.json();
    console.log('Received Square Webhook:', JSON.stringify(webhookData, null, 2));

    // TODO: Process the webhook event (e.g., payment.updated, refund.created)
    // Example:
    // if (webhookData.type === 'payment.updated') {
    //   const payment = webhookData.data.object.payment;
    //   // Update payment status in your database, handle refunds, etc.
    //   await recordPayment(env, { // Adapt this to your actual needs for updates
    //     square_payment_id: payment.id,
    //     status: payment.status,
    //     // ... other relevant fields
    //   });
    // }

    return new Response(JSON.stringify({ success: true, message: 'Webhook received' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error processing Square webhook:', error);
    return createErrorResponse('Webhook processing error', error.message, 500);
  }
}

// Admin: Capture a previously authorized payment
export async function captureAuthorizedPayment(request: Request, env: Env, paymentId: string): Promise<Response> {
  // Note: The router should ensure this is admin-protected.
  // It expects `paymentId` to be the Square Payment ID.

  if (!paymentId) {
    return createErrorResponse('Missing paymentId parameter', null, 400);
  }

  try {
    const { paymentsApi } = new Client({
      environment: env.ENV === 'production' ? Environment.Production : Environment.Sandbox,
      accessToken: env.SQUARE_ACCESS_TOKEN,
    });

    // Check current status in our DB first (optional, but good practice)
    const existingPayment = await env.DB.prepare("SELECT status FROM payments WHERE square_payment_id = ?")
      .bind(paymentId)
      .first<{ status: string }>();

    if (!existingPayment) {
      return createErrorResponse('Payment not found in our records', `Square payment ID: ${paymentId}`, 404);
    }
    if (existingPayment.status !== 'AUTHORIZED') {
      // Or if it's already COMPLETED, VOIDED, etc.
      return createErrorResponse('Payment not in capturable state', `Current status: ${existingPayment.status}`, 409); // 409 Conflict
    }

    console.log(`Attempting to capture Square payment ID: ${paymentId}`);
    const captureResponse = await paymentsApi.capturePayment(paymentId);
    const capturedPaymentResult = captureResponse.result.payment;

    if (capturedPaymentResult && capturedPaymentResult.status === 'COMPLETED') {
      // Update status in our database
      const updateStmt = env.DB.prepare("UPDATE payments SET status = ?, updated_at = ? WHERE square_payment_id = ?");
      await updateStmt.bind(capturedPaymentResult.status, new Date().toISOString(), paymentId).run();

      console.log(`Successfully captured Square payment ID: ${paymentId}. New status: ${capturedPaymentResult.status}`);

      // Optionally, send a payment confirmation email now if not sent at authorization.
      // (Assuming recordPayment was called at authorization time with relevant details like customerEmail, userId, puppyId)
      // This part would require fetching the original payment record to get email, user, puppy details.
      // For simplicity, this example doesn't re-send an email here but it could be added.

      return new Response(JSON.stringify({ success: true, payment: capturedPaymentResult }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // This case might occur if capture didn't result in COMPLETED status immediately, or if there was an issue.
      console.error(`Capture for Square payment ID ${paymentId} did not result in COMPLETED. Status: ${capturedPaymentResult?.status}`);
      return createErrorResponse('Payment capture failed or status not COMPLETED',
        `Square status: ${capturedPaymentResult?.status || 'Unknown'}. Square Payment ID: ${paymentId}`, 500);
    }

  } catch (error: any) {
    console.error(`Error capturing Square payment ID ${paymentId}:`, error);
    if (error.errors && error.errors.length > 0) {
        const squareError = error.errors[0];
        return createErrorResponse(
            `Square API Error during capture: ${squareError.category} - ${squareError.code}`,
            squareError.detail,
            error.statusCode || 500
        );
    }
    return createErrorResponse('Payment capture process error', error.message || 'An unknown error occurred.', 500);
  }
}

interface RefundRequestBody {
  payment_id: string; // Square Payment ID
  amount: number;     // Amount in cents
  currency: string;   // e.g., USD
  reason?: string;
}

// Admin: Refund a payment
export async function refundPaymentHandler(request: Request, env: Env): Promise<Response> {
  // Note: Router should ensure this is admin-protected.
  let body: RefundRequestBody;
  try {
    body = await request.json();
  } catch (e) {
    return createErrorResponse('Invalid JSON request body', e.message, 400);
  }

  const { payment_id, amount, currency, reason } = body;
  const idempotencyKey = randomUUID(); // Each refund attempt needs a unique idempotency key

  if (!payment_id || !amount || !currency) {
    return createErrorResponse('Missing required refund information', 'payment_id, amount, and currency are required.', 400);
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return createErrorResponse('Invalid amount for refund', 'Amount must be a positive number (in cents).', 400);
  }

  try {
    const { refundsApi } = new Client({
      environment: env.ENV === 'production' ? Environment.Production : Environment.Sandbox,
      accessToken: env.SQUARE_ACCESS_TOKEN,
    });

    console.log(`Attempting to refund payment ID: ${payment_id} for ${amount} ${currency}. Idempotency Key: ${idempotencyKey}`);

    const refundResponse = await refundsApi.refundPayment({
      idempotencyKey: idempotencyKey,
      paymentId: payment_id,
      amountMoney: {
        amount: BigInt(amount),
        currency: currency,
      },
      reason: reason || undefined,
    });

    const refundResult = refundResponse.result.refund;

    if (refundResult) {
      console.log(`Refund successful for Square Payment ID: ${payment_id}. Refund ID: ${refundResult.id}, Status: ${refundResult.status}`);

      // TODO: Database Operations for Refunds:
      // 1. Option A: Create a new 'refunds' table and record the refund details:
      //    - id (new UUID for the refund record itself)
      //    - square_refund_id (refundResult.id)
      //    - payment_id (original Square payment_id)
      //    - amount (Number(refundResult.amountMoney?.amount))
      //    - currency (refundResult.amountMoney?.currency)
      //    - reason (refundResult.reason)
      //    - status (refundResult.status - e.g., PENDING, COMPLETED, REJECTED, FAILED)
      //    - created_at (refundResult.createdAt)
      //    - updated_at (refundResult.updatedAt)
      //    Example: await env.DB.prepare("INSERT INTO refunds (...) VALUES (...)").bind(...).run();

      // 2. Option B: Update the original payment record in the 'payments' table:
      //    - Add columns like `refunded_amount`, `refund_status`, `last_refund_id`.
      //    - Update status to `REFUNDED` or `PARTIALLY_REFUNDED`.
      //    - This can be complex if multiple partial refunds are allowed.
      //    Example:
      //    const originalPayment = await env.DB.prepare("SELECT amount, refunded_amount FROM payments WHERE square_payment_id = ?").bind(payment_id).first();
      //    const currentRefundedAmount = (originalPayment?.refunded_amount || 0) + Number(refundResult.amountMoney?.amount);
      //    let newStatus = existingPayment.status;
      //    if (currentRefundedAmount >= originalPayment.amount) newStatus = 'REFUNDED';
      //    else if (currentRefundedAmount > 0) newStatus = 'PARTIALLY_REFUNDED';
      //    await env.DB.prepare("UPDATE payments SET status = ?, refunded_amount = ?, updated_at = ? WHERE square_payment_id = ?")
      //        .bind(newStatus, currentRefundedAmount, new Date().toISOString(), payment_id).run();

      // For now, just logging. DB schema changes and full logic would be a separate step.
      console.log('TODO: Implement database recording for this refund.', refundResult);


      return new Response(JSON.stringify({ success: true, refund: refundResult }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Should not happen if Square API call itself didn't throw an error and status is 200
      return createErrorResponse('Refund processing did not return a refund object, though API call succeeded.', null, 500);
    }

  } catch (error: any) {
    console.error(`Error processing refund for Square Payment ID ${payment_id}:`, error);
    if (error.errors && error.errors.length > 0) {
        const squareError = error.errors[0];
        return createErrorResponse(
            `Square API Error during refund: ${squareError.category} - ${squareError.code}`,
            squareError.detail,
            error.statusCode || 500
        );
    }
    return createErrorResponse('Refund processing error', error.message || 'An unknown error occurred.', 500);
  }
}
