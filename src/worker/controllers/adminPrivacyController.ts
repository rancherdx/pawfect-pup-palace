import { corsHeaders } from '../utils/cors';
import type { Env } from '../env';

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | string[] | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// List all data deletion requests with pagination
export async function listDataDeletionRequests(request: Request, env: Env) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const offset = (page - 1) * limit;
  const statusFilter = url.searchParams.get('status');

  try {
    let query = 'SELECT * FROM data_deletion_requests';
    const queryParams: any[] = [];
    const countParams: any[] = [];

    if (statusFilter) {
      query += ' WHERE status = ?';
      queryParams.push(statusFilter);
      countParams.push(statusFilter);
    }

    query += ' ORDER BY requested_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const { results } = await env.PUPPIES_DB.prepare(query).bind(...queryParams).all();

    let countQuery = 'SELECT COUNT(*) as total FROM data_deletion_requests';
    if (statusFilter) {
        countQuery += ' WHERE status = ?';
    }
    const totalResult = await env.PUPPIES_DB.prepare(countQuery).bind(...countParams).first<{ total: number }>();
    const totalItems = totalResult?.total || 0;

    return new Response(JSON.stringify({
      data: results,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Error listing data deletion requests:', error);
    return createErrorResponse('Failed to list data deletion requests', error.message, 500);
  }
}

// Get a single data deletion request by ID
export async function getDataDeletionRequestById(request: Request, env: Env, params: { id: string }) {
  const { id } = params;
  if (!id) {
    return createErrorResponse('Request ID is required', null, 400);
  }

  try {
    const requestDetail = await env.PUPPIES_DB.prepare('SELECT * FROM data_deletion_requests WHERE id = ?').bind(id).first();

    if (!requestDetail) {
      return createErrorResponse('Data deletion request not found', `No request found with ID: ${id}`, 404);
    }

    return new Response(JSON.stringify(requestDetail), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error(`Error fetching data deletion request ${id}:`, error);
    return createErrorResponse('Failed to fetch data deletion request', error.message, 500);
  }
}

interface UpdateStatusBody {
  status: string;
  admin_notes?: string;
}

// Update the status and admin_notes of a data deletion request
export async function updateDataDeletionRequestStatus(request: Request, env: Env, params: { id: string }) {
  const { id } = params;
  if (!id) {
    return createErrorResponse('Request ID is required', null, 400);
  }

  if (request.method !== 'PUT') {
    return createErrorResponse('Method not allowed', 'Only PUT requests are accepted for status updates.', 405);
  }

  try {
    const body = await request.json() as UpdateStatusBody;
    const { status, admin_notes } = body;

    const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return createErrorResponse('Invalid status provided.', `Status must be one of: ${validStatuses.join(', ')}`, 400);
    }

    if (admin_notes !== undefined && (typeof admin_notes !== 'string' || admin_notes.length > 2000)) {
        return createErrorResponse('Admin notes must be a string and less than 2000 characters.', null, 400);
    }

    const existingRequest = await env.PUPPIES_DB.prepare('SELECT id FROM data_deletion_requests WHERE id = ?').bind(id).first();
    if (!existingRequest) {
      return createErrorResponse('Data deletion request not found', `No request found with ID: ${id} to update.`, 404);
    }

    const processed_at = (status === 'completed' || status === 'rejected') ? new Date().toISOString() : null;

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    updateFields.push('status = ?');
    updateValues.push(status);

    if (admin_notes !== undefined) {
        updateFields.push('admin_notes = ?');
        updateValues.push(admin_notes);
    }

    if (processed_at) {
        updateFields.push('processed_at = ?');
        updateValues.push(processed_at);
    }

    updateFields.push('updated_at = ?'); // Always update updated_at
    updateValues.push(new Date().toISOString());

    updateValues.push(id); // For the WHERE clause

    const stmt = `UPDATE data_deletion_requests SET ${updateFields.join(', ')} WHERE id = ?`;

    await env.PUPPIES_DB.prepare(stmt).bind(...updateValues).run();

    const updatedRequest = await env.PUPPIES_DB.prepare('SELECT * FROM data_deletion_requests WHERE id = ?').bind(id).first();

    return new Response(JSON.stringify(updatedRequest), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error(`Error updating data deletion request ${id}:`, error);
    if (error instanceof SyntaxError) {
        return createErrorResponse('Invalid JSON payload.', null, 400);
    }
    return createErrorResponse('Failed to update data deletion request', error.message, 500);
  }
}
