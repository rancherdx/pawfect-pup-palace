import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

// Consistent error response utility
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface Testimonial {
  id: string;
  name: string;
  title?: string;
  content: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

interface TestimonialCreateData {
  name: string;
  title?: string;
  content: string;
  image?: string;
}

// Admin: List all testimonials
export async function listAllTestimonials(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;

  if (page < 1) return createErrorResponse("Bad Request", "Page number must be 1 or greater.", 400);
  if (limit < 1 || limit > 100) return createErrorResponse("Bad Request", "Limit must be between 1 and 100.", 400);

  try {
    const testimonialsQuery = env.PUPPIES_DB.prepare(
      'SELECT * FROM testimonials ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset);

    const countQuery = env.PUPPIES_DB.prepare('SELECT COUNT(*) as total FROM testimonials');

    const [testimonialsResults, totalResult] = await Promise.all([
      testimonialsQuery.all<Testimonial>(),
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

// Admin: Get testimonial by ID
export async function getTestimonialById(request: Request, env: Env, testimonialId: string): Promise<Response> {
  if (!testimonialId) {
    return createErrorResponse("Bad Request", "Testimonial ID is required.", 400);
  }

  try {
    const testimonial = await env.PUPPIES_DB.prepare(
      'SELECT * FROM testimonials WHERE id = ?'
    ).bind(testimonialId).first<Testimonial>();

    if (!testimonial) {
      return createErrorResponse("Not Found", `Testimonial with ID ${testimonialId} not found.`, 404);
    }

    return new Response(JSON.stringify(testimonial), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error fetching testimonial ${testimonialId}:`, error);
    return createErrorResponse('Failed to fetch testimonial', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Create testimonial
export async function createTestimonial(request: Request, env: Env, authResult: any): Promise<Response> {
  try {
    const testimonialData = await request.json() as TestimonialCreateData;

    // Validation
    if (!testimonialData.name || !testimonialData.content) {
      return createErrorResponse("Validation Error", "Name and content are required.", 400);
    }

    if (testimonialData.name.length > 100) {
      return createErrorResponse("Validation Error", "Name must be 100 characters or less.", 400);
    }

    if (testimonialData.content.length > 1000) {
      return createErrorResponse("Validation Error", "Content must be 1000 characters or less.", 400);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await env.PUPPIES_DB.prepare(
      `INSERT INTO testimonials (id, name, title, content, image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      testimonialData.name,
      testimonialData.title || null,
      testimonialData.content,
      testimonialData.image || null,
      now,
      now
    ).run();

    const newTestimonial = await env.PUPPIES_DB.prepare(
      'SELECT * FROM testimonials WHERE id = ?'
    ).bind(id).first<Testimonial>();

    if (!newTestimonial) {
      return createErrorResponse("Internal Server Error", "Failed to retrieve created testimonial.", 500);
    }

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
    const updateData = await request.json() as Partial<TestimonialCreateData>;
    
    // Check if testimonial exists
    const existingTestimonial = await env.PUPPIES_DB.prepare(
      'SELECT id FROM testimonials WHERE id = ?'
    ).bind(testimonialId).first();

    if (!existingTestimonial) {
      return createErrorResponse("Not Found", `Testimonial with ID ${testimonialId} not found.`, 404);
    }

    const updates: Record<string, any> = {};
    const allowedFields = ['name', 'title', 'content', 'image'];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    }

    // Validation
    if (updates.name && updates.name.length > 100) {
      return createErrorResponse("Validation Error", "Name must be 100 characters or less.", 400);
    }

    if (updates.content && updates.content.length > 1000) {
      return createErrorResponse("Validation Error", "Content must be 1000 characters or less.", 400);
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
    ).bind(testimonialId).first<Testimonial>();

    if (!updatedTestimonial) {
      return createErrorResponse("Internal Server Error", "Failed to retrieve updated testimonial.", 500);
    }

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

// Public: Get all testimonials (for public display)
export async function getPublicTestimonials(request: Request, env: Env): Promise<Response> {
  try {
    const testimonials = await env.PUPPIES_DB.prepare(
      'SELECT * FROM testimonials ORDER BY created_at DESC'
    ).all<Testimonial>();

    return new Response(JSON.stringify(testimonials.results || []), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching public testimonials:', error);
    return createErrorResponse('Failed to fetch testimonials', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}