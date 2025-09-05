import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface EnhancedTestimonial {
  id: string;
  name: string;
  title?: string;
  content: string;
  testimonial_text: string;
  location?: string;
  rating: number;
  puppy_name?: string;
  image?: string;
  reviewer_avatar?: string;
  source: 'local' | 'google' | 'facebook';
  google_review_id?: string;
  review_date: string;
  is_featured: boolean;
  admin_approved: boolean;
  response_text?: string;
  response_date?: string;
  created_at: string;
  updated_at: string;
}

interface TestimonialCreateData {
  name: string;
  title?: string;  
  content?: string;
  testimonial_text: string;
  location?: string;
  rating: number;
  puppy_name?: string;
  image?: string;
  is_featured?: boolean;
}

// Admin: List all testimonials with enhanced filtering
export async function listAllTestimonials(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const source = url.searchParams.get('source');
  const approved = url.searchParams.get('approved');
  const featured = url.searchParams.get('featured');
  const offset = (page - 1) * limit;

  if (page < 1) return createErrorResponse("Bad Request", "Page number must be 1 or greater.", 400);
  if (limit < 1 || limit > 100) return createErrorResponse("Bad Request", "Limit must be between 1 and 100.", 400);

  try {
    let whereClause = '';
    const conditions: string[] = [];
    const params: any[] = [];

    if (source) {
      conditions.push('source = ?');
      params.push(source);
    }
    if (approved !== null && approved !== undefined) {
      conditions.push('admin_approved = ?');
      params.push(approved === 'true');
    }
    if (featured !== null && featured !== undefined) {
      conditions.push('is_featured = ?');
      params.push(featured === 'true');
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    const testimonialsQuery = env.PUPPIES_DB.prepare(
      `SELECT * FROM testimonials ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...params, limit, offset);

    const countQuery = env.PUPPIES_DB.prepare(
      `SELECT COUNT(*) as total FROM testimonials ${whereClause}`
    ).bind(...params);

    const [testimonialsResults, totalResult] = await Promise.all([
      testimonialsQuery.all<EnhancedTestimonial>(),
      countQuery.first<{ total: number }>()
    ]);

    const testimonials = testimonialsResults.results || [];
    const total = totalResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return new Response(JSON.stringify({
      testimonials,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: total,
        limit
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error listing testimonials:', error);
    return createErrorResponse('Failed to list testimonials', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Create testimonial
export async function createTestimonial(request: Request, env: Env, authResult: any): Promise<Response> {
  try {
    const testimonialData = await request.json() as TestimonialCreateData;

    // Validation
    if (!testimonialData.name || !testimonialData.testimonial_text) {
      return createErrorResponse("Validation Error", "Name and testimonial text are required.", 400);
    }

    if (testimonialData.rating < 1 || testimonialData.rating > 5) {
      return createErrorResponse("Validation Error", "Rating must be between 1 and 5.", 400);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.PUPPIES_DB.prepare(
      `INSERT INTO testimonials (
        id, name, title, content, testimonial_text, location, rating, 
        puppy_name, image, source, review_date, is_featured, 
        admin_approved, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      testimonialData.name,
      testimonialData.title || null,
      testimonialData.content || testimonialData.testimonial_text,
      testimonialData.testimonial_text,
      testimonialData.location || null,
      testimonialData.rating,
      testimonialData.puppy_name || null,
      testimonialData.image || null,
      'local',
      now,
      testimonialData.is_featured || false,
      true,
      now,
      now
    ).run();

    const newTestimonial = await env.PUPPIES_DB.prepare(
      'SELECT * FROM testimonials WHERE id = ?'
    ).bind(id).first<EnhancedTestimonial>();

    return new Response(JSON.stringify(newTestimonial), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating testimonial:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    return createErrorResponse('Failed to create testimonial', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Update testimonial
export async function updateTestimonial(request: Request, env: Env, testimonialId: string, authResult: any): Promise<Response> {
  if (!testimonialId) {
    return createErrorResponse("Bad Request", "Testimonial ID is required.", 400);
  }

  try {
    const updateData = await request.json() as Partial<TestimonialCreateData & { admin_approved: boolean; response_text: string }>;
    
    // Check if testimonial exists
    const existingTestimonial = await env.PUPPIES_DB.prepare(
      'SELECT id FROM testimonials WHERE id = ?'
    ).bind(testimonialId).first();

    if (!existingTestimonial) {
      return createErrorResponse("Not Found", `Testimonial with ID ${testimonialId} not found.`, 404);
    }

    const updates: Record<string, any> = {};
    const allowedFields = ['name', 'title', 'content', 'testimonial_text', 'location', 'rating', 'puppy_name', 'image', 'is_featured', 'admin_approved', 'response_text'];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    if (updateData.response_text && !updates.response_date) {
      updates.response_date = new Date().toISOString();
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse("Bad Request", "No update fields provided.", 400);
    }

    updates.updated_at = new Date().toISOString();

    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), testimonialId];

    await env.PUPPIES_DB.prepare(`UPDATE testimonials SET ${setClauses} WHERE id = ?`).bind(...values).run();

    const updatedTestimonial = await env.PUPPIES_DB.prepare(
      'SELECT * FROM testimonials WHERE id = ?'
    ).bind(testimonialId).first<EnhancedTestimonial>();

    return new Response(JSON.stringify(updatedTestimonial), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error updating testimonial ${testimonialId}:`, error);
    if (error instanceof SyntaxError) {
      return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    return createErrorResponse('Failed to update testimonial', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Delete testimonial
export async function deleteTestimonial(request: Request, env: Env, testimonialId: string, authResult: any): Promise<Response> {
  if (!testimonialId) {
    return createErrorResponse("Bad Request", "Testimonial ID is required.", 400);
  }

  try {
    const existingTestimonial = await env.PUPPIES_DB.prepare(
      'SELECT id FROM testimonials WHERE id = ?'
    ).bind(testimonialId).first();

    if (!existingTestimonial) {
      return createErrorResponse("Not Found", `Testimonial with ID ${testimonialId} not found.`, 404);
    }

    await env.PUPPIES_DB.prepare('DELETE FROM testimonials WHERE id = ?').bind(testimonialId).run();

    return new Response(JSON.stringify({ message: 'Testimonial deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error deleting testimonial ${testimonialId}:`, error);
    return createErrorResponse('Failed to delete testimonial', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Public: Get approved testimonials for display
export async function getPublicTestimonials(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const featured = url.searchParams.get('featured') === 'true';
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  try {
    let query = 'SELECT * FROM testimonials WHERE admin_approved = true';
    const params: any[] = [];

    if (featured) {
      query += ' AND is_featured = true';
    }

    query += ' ORDER BY is_featured DESC, rating DESC, created_at DESC';
    
    if (limit > 0) {
      query += ' LIMIT ?';
      params.push(limit);
    }

    const testimonials = await env.PUPPIES_DB.prepare(query).bind(...params).all<EnhancedTestimonial>();

    return new Response(JSON.stringify(testimonials.results || []), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching public testimonials:', error);
    return createErrorResponse('Failed to fetch testimonials', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Get testimonial analytics
export async function getTestimonialAnalytics(request: Request, env: Env): Promise<Response> {
  try {
    const stats = await env.PUPPIES_DB.prepare(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN source = 'local' THEN 1 END) as local_count,
        COUNT(CASE WHEN source = 'google' THEN 1 END) as google_count,
        COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_count,
        COUNT(CASE WHEN admin_approved = false THEN 1 END) as pending_approval,
        ROUND(AVG(rating), 2) as average_rating
      FROM testimonials
    `).first();

    const recentTestimonials = await env.PUPPIES_DB.prepare(`
      SELECT name, rating, source, created_at 
      FROM testimonials 
      WHERE admin_approved = true 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all();

    return new Response(JSON.stringify({
      stats,
      recent: recentTestimonials.results || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching testimonial analytics:', error);
    return createErrorResponse('Failed to fetch analytics', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}