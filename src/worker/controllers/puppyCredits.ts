import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | string[] | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface UserPuppyCredits {
  id: string;
  user_id: string;
  balance: number; // in cents
  last_updated_at: number; // Unix timestamp
  created_at: number; // Unix timestamp
}

interface PuppyCreditTransaction {
  id: string;
  user_id: string;
  type: 'issue' | 'redeem' | 'adjustment' | 'refund_credit';
  amount: number; // in cents
  description: string;
  related_order_id?: string | null;
  admin_user_id?: string | null;
  created_at: number; // Unix timestamp
}

interface AuthResult {
    userId: string;
    // roles: string[]; // Add if needed for role-specific logic within these functions
}

/**
 * Fetches the current puppy credit balance for the authenticated user.
 */
export async function getUserPuppyCreditBalance(request: Request, env: Env, authResult: AuthResult): Promise<Response> {
  const { userId } = authResult;

  if (!userId) {
    return createErrorResponse('Authentication required.', 'User ID not found in token.', 401);
  }

  try {
    const db = env.PUPPIES_DB; // Assuming PUPPIES_DB is the correct D1 binding
    const creditsRecord = await db.prepare(
      "SELECT balance FROM user_puppy_credits WHERE user_id = ?"
    ).bind(userId).first<Pick<UserPuppyCredits, 'balance'>>();

    const balance = creditsRecord ? creditsRecord.balance : 0;

    return new Response(JSON.stringify({ user_id: userId, balance_cents: balance }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error fetching puppy credit balance for user ${userId}:`, error);
    return createErrorResponse('Failed to fetch puppy credit balance.', error.message, 500);
  }
}

/**
 * Fetches the transaction history for the authenticated user's puppy credits (paginated).
 */
export async function getPuppyCreditHistory(request: Request, env: Env, authResult: AuthResult): Promise<Response> {
  const { userId } = authResult;

  if (!userId) {
    return createErrorResponse('Authentication required.', 'User ID not found in token.', 401);
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;

  try {
    const db = env.PUPPIES_DB;

    const transactionsQuery = db.prepare(
      "SELECT id, type, amount, description, related_order_id, created_at FROM puppy_credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(userId, limit, offset);

    const countQuery = db.prepare(
      "SELECT COUNT(*) as total_transactions FROM puppy_credit_transactions WHERE user_id = ?"
    ).bind(userId);

    const [{ results: transactions }, countResult] = await Promise.all([
      transactionsQuery.all<Omit<PuppyCreditTransaction, 'user_id' | 'admin_user_id'>>(),
      countQuery.first<{ total_transactions: number }>()
    ]);

    const totalTransactions = countResult?.total_transactions || 0;
    const totalPages = Math.ceil(totalTransactions / limit);

    return new Response(JSON.stringify({
      data: transactions || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalTransactions,
        limit,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error fetching puppy credit history for user ${userId}:`, error);
    return createErrorResponse('Failed to fetch puppy credit history.', error.message, 500);
  }
}

interface IssueCreditsRequestBody {
  user_id: string;
  amount: number; // in cents
  description: string;
}

/**
 * Allows an admin to issue puppy credits to a user.
 * The router must ensure adminAuthMiddleware is applied.
 */
export async function issuePuppyCredits(request: Request, env: Env, authResult: AuthResult): Promise<Response> {
  // authResult here would be the admin's decoded JWT.
  const adminUserId = authResult.userId;

  let body: IssueCreditsRequestBody;
  try {
    body = await request.json();
  } catch (e) {
    return createErrorResponse('Invalid JSON request body.', e.message, 400);
  }

  const { user_id: targetUserId, amount, description } = body;

  if (!targetUserId || typeof targetUserId !== 'string') {
    return createErrorResponse('Validation Error: target_user_id is required and must be a string.', null, 400);
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return createErrorResponse('Validation Error: amount is required and must be a positive integer (cents).', null, 400);
  }
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return createErrorResponse('Validation Error: description is required and must be a non-empty string.', null, 400);
  }

  try {
    const db = env.PUPPIES_DB;
    const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    const creditTransactionId = crypto.randomUUID();
    const userCreditRecordId = crypto.randomUUID(); // For potential new user_puppy_credits record

    // Check if target user exists (optional, but good practice)
    const targetUserExists = await db.prepare("SELECT id FROM users WHERE id = ?").bind(targetUserId).first();
    if (!targetUserExists) {
        return createErrorResponse('User not found.', `Target user with ID ${targetUserId} does not exist.`, 404);
    }

    // Using D1 batch for atomicity
    const batchResult = await db.batch([
      // 1. Get current balance or initialize if not exists (UPSERT logic essentially)
      // This is a bit tricky with batch as we can't use result of one step in next directly.
      // So, we'll do an UPSERT like operation.
      // Try to update existing balance first.
      db.prepare(
        "UPDATE user_puppy_credits SET balance = balance + ?, last_updated_at = ? WHERE user_id = ?"
      ).bind(amount, now, targetUserId),
      // If no row was updated (user had no credit record), insert a new one.
      // This requires a separate check after the batch or a more complex UPSERT if D1 supported it directly for this case.
      // For simplicity here, we'll assume a follow-up or a trigger might handle this,
      // OR, more practically, we'd select first, then decide to INSERT or UPDATE.
      // Let's adjust to select first, then conditionally run batch for insert/update + transaction log.

      // Re-thinking for better atomicity with current D1 capabilities:
      // We will perform the SELECT outside and then conditionally build the batch.
      // However, to truly make the read+write atomic without application-level locks (which are complex),
      // it's often better to design D1 statements to handle this, e.g. by ensuring user_puppy_credits row always exists.
      // For this implementation, we'll try to insert a new credit record, and if it fails due to UNIQUE constraint (user_id),
      // then we know to update. This is less ideal than an UPSERT.

      // A more common pattern if UPSERT isn't smooth:
      // INSERT OR IGNORE into user_puppy_credits (id, user_id, balance, created_at, last_updated_at) VALUES (?, ?, 0, ?, ?)
      // This ensures a row exists. Then UPDATE.
      db.prepare(
        "INSERT OR IGNORE INTO user_puppy_credits (id, user_id, balance, created_at, last_updated_at) VALUES (?, ?, 0, ?, ?)"
      ).bind(userCreditRecordId, targetUserId, now, now),
      // Then, update the balance (this will work whether the above inserted or if it was ignored)
      db.prepare(
        "UPDATE user_puppy_credits SET balance = balance + ?, last_updated_at = ? WHERE user_id = ?"
      ).bind(amount, now, targetUserId),
      // 2. Record the transaction
      db.prepare(
        "INSERT INTO puppy_credit_transactions (id, user_id, type, amount, description, admin_user_id, created_at) VALUES (?, ?, 'issue', ?, ?, ?, ?)"
      ).bind(creditTransactionId, targetUserId, amount, description, adminUserId, now)
    ]);

    // Note: D1 batch results don't give direct feedback on individual statement success like "rows affected" for updates in a simple way.
    // We assume success if no error is thrown. More robust error checking might be needed depending on D1 behavior.
    // For the INSERT OR IGNORE + UPDATE pattern, it should be fine.

    // Fetch the new balance to return
    const updatedCreditRecord = await db.prepare(
      "SELECT balance FROM user_puppy_credits WHERE user_id = ?"
    ).bind(targetUserId).first<Pick<UserPuppyCredits, 'balance'>>();

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully issued ${amount / 100} credits to user ${targetUserId}.`,
      new_balance_cents: updatedCreditRecord?.balance ?? amount, // Fallback to amount if record somehow not found after insert
      transaction_id: creditTransactionId,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`Error issuing puppy credits by admin ${adminUserId} to user ${targetUserId}:`, error);
    // Check for specific D1 errors if possible, e.g., foreign key constraint if user_id doesn't exist in users table.
    if (error.message && error.message.includes("FOREIGN KEY constraint failed")) {
        return createErrorResponse('Database Error', "Failed due to a foreign key constraint. Ensure user exists.", 500);
    }
    return createErrorResponse('Failed to issue puppy credits.', error.message, 500);
  }
}
