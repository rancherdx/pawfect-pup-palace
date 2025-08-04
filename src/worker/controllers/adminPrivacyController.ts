import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

// Admin Privacy Controller - for managing data deletion requests

export async function listDataDeletionRequests(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const offset = (page - 1) * limit;

    let query = `SELECT * FROM data_deletion_requests`;
    let countQuery = `SELECT COUNT(*) as total FROM data_deletion_requests`;
    const params: unknown[] = [];
    const countParams: unknown[] = [];

    if (status && status !== 'all') {
      query += ` WHERE status = ?`;
      countQuery += ` WHERE status = ?`;
      params.push(status);
      countParams.push(status);
    }

    query += ` ORDER BY requested_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [requestsResult, countResult] = await Promise.all([
      env.PUPPIES_DB.prepare(query).bind(...params).all(),
      env.PUPPIES_DB.prepare(countQuery).bind(...countParams).first()
    ]);

    const total = (countResult as { total?: number })?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return new Response(JSON.stringify({
      requests: requestsResult.results,
      pagination: {
        currentPage: page,
        totalPages,
        totalRequests: total,
        limit
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error listing data deletion requests:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch data deletion requests',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function getDataDeletionRequestById(request: Request, env: Env, params: { id: string }): Promise<Response> {
  try {
    const { id } = params;
    
    const deletionRequest = await env.PUPPIES_DB
      .prepare('SELECT * FROM data_deletion_requests WHERE id = ?')
      .bind(id)
      .first();

    if (!deletionRequest) {
      return new Response(JSON.stringify({ error: 'Data deletion request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ request: deletionRequest }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching data deletion request:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch data deletion request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function updateDataDeletionRequestStatus(request: Request, env: Env, params: { id: string }): Promise<Response> {
  try {
    const { id } = params;
    const body = await request.json() as { status: string; adminNotes?: string };
    const { status, adminNotes } = body;

    if (!status || !['pending', 'processing', 'completed', 'rejected'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const processedAt = ['completed', 'rejected'].includes(status) ? new Date().toISOString() : null;

    const result = await env.PUPPIES_DB
      .prepare(`
        UPDATE data_deletion_requests 
        SET status = ?, admin_notes = ?, processed_at = ?
        WHERE id = ?
      `)
      .bind(status, adminNotes || null, processedAt, id)
      .run();

    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Data deletion request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch the updated request
    const updatedRequest = await env.PUPPIES_DB
      .prepare('SELECT * FROM data_deletion_requests WHERE id = ?')
      .bind(id)
      .first();

    return new Response(JSON.stringify({ 
      message: 'Data deletion request status updated successfully',
      request: updatedRequest 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating data deletion request status:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to update data deletion request status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
