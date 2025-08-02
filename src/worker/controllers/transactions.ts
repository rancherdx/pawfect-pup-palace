import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

// Consistent error response utility
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface TransactionRecord {
  id: string;
  user_id: string | null;
  puppy_id: string | null;
  square_payment_id: string | null;
  amount: number;
  currency: string;
  payment_method_details: string | null; // JSON string
  status: string;
  created_at: string;
  updated_at: string;
}

// Interface for the data returned for a user's transaction list
interface UserTransactionListItem {
    id: string;
    square_payment_id: string | null;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    puppy_id: string | null;
    payment_method_details: Record<string, unknown> | null; // Parsed JSON
}


export async function listTransactions(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const statusFilter = url.searchParams.get('status');
  let searchQuery = url.searchParams.get('searchQuery');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  if (page < 1) return createErrorResponse("Bad Request", "Page number must be 1 or greater.", 400);
  if (limit < 1 || limit > 100) return createErrorResponse("Bad Request", "Limit must be between 1 and 100.", 400);

  const offset = (page - 1) * limit;

  let whereClauses: string[] = [];
  const bindings: unknown[] = [];

  if (statusFilter) {
    whereClauses.push("status = ?");
    bindings.push(statusFilter);
  }
  if (startDate) {
    whereClauses.push("created_at >= ?");
    bindings.push(`${startDate}T00:00:00.000Z`);
  }
  if (endDate) {
    whereClauses.push("created_at <= ?");
    bindings.push(`${endDate}T23:59:59.999Z`);
  }

  if (searchQuery) {
    searchQuery = `%${searchQuery}%`;
    whereClauses.push("(id LIKE ? OR square_payment_id LIKE ?)");
    bindings.push(searchQuery, searchQuery);
  }

  const whereCondition = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const transactionsSql = `
    SELECT id, user_id, puppy_id, square_payment_id, amount, currency, payment_method_details, status, created_at, updated_at
    FROM transactions
    ${whereCondition}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const countSql = `SELECT COUNT(*) as total_transactions FROM transactions ${whereCondition}`;

  try {
    const transactionsQuery = env.PUPPIES_DB.prepare(transactionsSql).bind(...bindings, limit, offset);
    const countQuery = env.PUPPIES_DB.prepare(countSql).bind(...bindings);

    const [transactionsResults, totalResult] = await Promise.all([
      transactionsQuery.all<TransactionRecord>(),
      countQuery.first<{ total_transactions: number }>()
    ]);

    if (!transactionsResults || !totalResult) {
        return createErrorResponse("Internal Server Error", "Failed to fetch transaction data.", 500);
    }

    const transactions = transactionsResults.results.map(t => ({
        ...t,
        amount: Number(t.amount),
        payment_method_details: t.payment_method_details ? JSON.parse(t.payment_method_details) : null
    }));
    const totalTransactions = totalResult.total_transactions || 0;
    const totalPages = Math.ceil(totalTransactions / limit);

    return new Response(JSON.stringify({
      transactions,
      currentPage: page,
      totalPages,
      totalTransactions,
      limit
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error listing transactions:", error);
    let errorMessage = "Unknown error";
    let errorDetails = null;
    if (error instanceof Error) {
        errorMessage = error.message;
        // @ts-ignore
        if (error.cause && error.cause.message) {
             // @ts-ignore
            errorDetails = error.cause.message;
        }
    }
    return createErrorResponse("Failed to list transactions", `${errorMessage}${errorDetails ? ` (Details: ${errorDetails})` : ''}`, 500);
  }
}


export async function listUserTransactions(request: Request, env: Env): Promise<Response> {
  // The authMiddleware in index.ts should have attached `auth` to the request.
  const authResult = (request as any).auth;

  if (!authResult || !authResult.userId) {
    return createErrorResponse("Unauthorized", "User authentication required.", 401);
  }
  const userId = authResult.userId;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10); // Convert to string

  if (page < 1) return createErrorResponse("Bad Request", "Page number must be 1 or greater.", 400);
  if (limit < 1 || limit > 50) return createErrorResponse("Bad Request", "Limit must be between 1 and 50.", 400);

  const offset = (page - 1) * limit;

  const transactionsSql = `
    SELECT id, square_payment_id, amount, currency, status, created_at, puppy_id, payment_method_details
    FROM transactions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const countSql = `SELECT COUNT(*) as total_transactions FROM transactions WHERE user_id = ?`;

  try {
    const transactionsQuery = env.PUPPIES_DB.prepare(transactionsSql).bind(userId, limit, offset);
    const countQuery = env.PUPPIES_DB.prepare(countSql).bind(userId);

    const [transactionsResults, totalResult] = await Promise.all([
      transactionsQuery.all<Omit<TransactionRecord, 'user_id' | 'updated_at'>>(), // user_id is fixed by WHERE, updated_at not selected
      countQuery.first<{ total_transactions: number }>()
    ]);

    if (!transactionsResults || !totalResult) {
        return createErrorResponse("Internal Server Error", "Failed to fetch your transactions.", 500);
    }

    const transactions: UserTransactionListItem[] = transactionsResults.results.map(t => ({
      id: t.id,
      square_payment_id: t.square_payment_id,
      amount: Number(t.amount),
      currency: t.currency,
      status: t.status,
      created_at: t.created_at,
      puppy_id: t.puppy_id,
      payment_method_details: t.payment_method_details ? JSON.parse(t.payment_method_details) : null,
    }));

    const totalTransactions = totalResult.total_transactions || 0;
    const totalPages = Math.ceil(totalTransactions / limit);

    return new Response(JSON.stringify({
      transactions,
      currentPage: page,
      totalPages,
      totalTransactions,
      limit
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error(`Error listing transactions for user ${userId}:`, error);
    let errorMessage = "Unknown error";
     if (error instanceof Error) errorMessage = error.message;
    return createErrorResponse("Failed to list your transactions", errorMessage, 500);
  }
}
}
