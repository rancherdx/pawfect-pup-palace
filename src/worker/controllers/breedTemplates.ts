import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

// Consistent error response utility
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface BreedTemplate {
  id: string;
  name: string;
  description?: string;
  characteristics?: string[];
  temperament?: string[];
  health_considerations?: string[];
  grooming_needs?: string;
  exercise_requirements?: string;
  size_category?: string;
  lifespan?: string;
  origin?: string;
  breed_group?: string;
  created_at: string;
  updated_at: string;
}

interface BreedTemplateCreateData {
  name: string;
  description?: string;
  characteristics?: string[];
  temperament?: string[];
  health_considerations?: string[];
  grooming_needs?: string;
  exercise_requirements?: string;
  size_category?: string;
  lifespan?: string;
  origin?: string;
  breed_group?: string;
}

// Note: This assumes there's a breed_templates table in the database
// If using the existing breeds table, we'll need to adjust the schema

// Admin: List all breed templates
export async function listAllBreedTemplates(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;

  if (page < 1) return createErrorResponse("Bad Request", "Page number must be 1 or greater.", 400);
  if (limit < 1 || limit > 100) return createErrorResponse("Bad Request", "Limit must be between 1 and 100.", 400);

  try {
    // For now, we'll use the breeds table that exists in the schema
    const breedsQuery = env.PUPPIES_DB.prepare(
      'SELECT * FROM breeds ORDER BY name ASC LIMIT ? OFFSET ?'
    ).bind(limit, offset);

    const countQuery = env.PUPPIES_DB.prepare('SELECT COUNT(*) as total FROM breeds');

    const [breedsResults, totalResult] = await Promise.all([
      breedsQuery.all<any>(),
      countQuery.first<{ total: number }>()
    ]);

    const breeds = breedsResults.results || [];
    const total = totalResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    // Parse JSON fields for each breed
    const parsedBreeds = breeds.map(breed => ({
      ...breed,
      characteristics: breed.characteristics ? JSON.parse(breed.characteristics) : [],
      temperament: breed.temperament ? JSON.parse(breed.temperament) : [],
      health_considerations: breed.health_considerations ? JSON.parse(breed.health_considerations) : []
    }));

    return new Response(JSON.stringify({
      breeds: parsedBreeds,
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
    console.error('Error listing breed templates:', error);
    return createErrorResponse('Failed to list breed templates', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Get breed template by ID
export async function getBreedTemplateById(request: Request, env: Env, breedId: string): Promise<Response> {
  if (!breedId) {
    return createErrorResponse("Bad Request", "Breed ID is required.", 400);
  }

  try {
    const breed = await env.PUPPIES_DB.prepare(
      'SELECT * FROM breeds WHERE id = ?'
    ).bind(breedId).first<any>();

    if (!breed) {
      return createErrorResponse("Not Found", `Breed template with ID ${breedId} not found.`, 404);
    }

    // Parse JSON fields
    const parsedBreed = {
      ...breed,
      characteristics: breed.characteristics ? JSON.parse(breed.characteristics) : [],
      temperament: breed.temperament ? JSON.parse(breed.temperament) : [],
      health_considerations: breed.health_considerations ? JSON.parse(breed.health_considerations) : []
    };

    return new Response(JSON.stringify(parsedBreed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error fetching breed template ${breedId}:`, error);
    return createErrorResponse('Failed to fetch breed template', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Create breed template
export async function createBreedTemplate(request: Request, env: Env, authResult: any): Promise<Response> {
  try {
    const breedData = await request.json() as BreedTemplateCreateData;

    // Validation
    if (!breedData.name) {
      return createErrorResponse("Validation Error", "Breed name is required.", 400);
    }

    if (breedData.name.length > 100) {
      return createErrorResponse("Validation Error", "Breed name must be 100 characters or less.", 400);
    }

    // Check if breed name already exists
    const existingBreed = await env.PUPPIES_DB.prepare(
      'SELECT id FROM breeds WHERE name = ?'
    ).bind(breedData.name).first();

    if (existingBreed) {
      return createErrorResponse("Validation Error", "A breed with this name already exists.", 400);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // Convert arrays to JSON strings for storage
    const characteristics = breedData.characteristics ? JSON.stringify(breedData.characteristics) : null;
    const temperament = breedData.temperament ? JSON.stringify(breedData.temperament) : null;
    const health_considerations = breedData.health_considerations ? JSON.stringify(breedData.health_considerations) : null;

    await env.PUPPIES_DB.prepare(
      `INSERT INTO breeds (id, name, description, characteristics, temperament, health_considerations, 
                          grooming_needs, exercise_requirements, size_category, lifespan, origin, breed_group, 
                          created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      breedData.name,
      breedData.description || null,
      characteristics,
      temperament,
      health_considerations,
      breedData.grooming_needs || null,
      breedData.exercise_requirements || null,
      breedData.size_category || null,
      breedData.lifespan || null,
      breedData.origin || null,
      breedData.breed_group || null,
      now,
      now
    ).run();

    const newBreed = await env.PUPPIES_DB.prepare(
      'SELECT * FROM breeds WHERE id = ?'
    ).bind(id).first<any>();

    if (!newBreed) {
      return createErrorResponse("Internal Server Error", "Failed to retrieve created breed template.", 500);
    }

    // Parse JSON fields for response
    const parsedBreed = {
      ...newBreed,
      characteristics: newBreed.characteristics ? JSON.parse(newBreed.characteristics) : [],
      temperament: newBreed.temperament ? JSON.parse(newBreed.temperament) : [],
      health_considerations: newBreed.health_considerations ? JSON.parse(newBreed.health_considerations) : []
    };

    return new Response(JSON.stringify(parsedBreed), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating breed template:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    return createErrorResponse('Failed to create breed template', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Update breed template
export async function updateBreedTemplate(request: Request, env: Env, breedId: string, authResult: any): Promise<Response> {
  if (!breedId) {
    return createErrorResponse("Bad Request", "Breed ID is required.", 400);
  }

  try {
    const updateData = await request.json() as Partial<BreedTemplateCreateData>;
    
    // Check if breed exists
    const existingBreed = await env.PUPPIES_DB.prepare(
      'SELECT id, name FROM breeds WHERE id = ?'
    ).bind(breedId).first<{ id: string; name: string }>();

    if (!existingBreed) {
      return createErrorResponse("Not Found", `Breed template with ID ${breedId} not found.`, 404);
    }

    // If updating name, check for conflicts
    if (updateData.name && updateData.name !== existingBreed.name) {
      const nameConflict = await env.PUPPIES_DB.prepare(
        'SELECT id FROM breeds WHERE name = ? AND id != ?'
      ).bind(updateData.name, breedId).first();

      if (nameConflict) {
        return createErrorResponse("Validation Error", "A breed with this name already exists.", 400);
      }
    }

    const updates: Record<string, any> = {};
    const allowedFields = [
      'name', 'description', 'characteristics', 'temperament', 'health_considerations',
      'grooming_needs', 'exercise_requirements', 'size_category', 'lifespan', 'origin', 'breed_group'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (['characteristics', 'temperament', 'health_considerations'].includes(field)) {
          updates[field] = updateData[field] ? JSON.stringify(updateData[field]) : null;
        } else {
          updates[field] = updateData[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse("Bad Request", "No update fields provided.", 400);
    }

    updates.updated_at = new Date().toISOString();

    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), breedId];

    await env.PUPPIES_DB.prepare(`UPDATE breeds SET ${setClauses} WHERE id = ?`).bind(...values).run();

    const updatedBreed = await env.PUPPIES_DB.prepare(
      'SELECT * FROM breeds WHERE id = ?'
    ).bind(breedId).first<any>();

    if (!updatedBreed) {
      return createErrorResponse("Internal Server Error", "Failed to retrieve updated breed template.", 500);
    }

    // Parse JSON fields for response
    const parsedBreed = {
      ...updatedBreed,
      characteristics: updatedBreed.characteristics ? JSON.parse(updatedBreed.characteristics) : [],
      temperament: updatedBreed.temperament ? JSON.parse(updatedBreed.temperament) : [],
      health_considerations: updatedBreed.health_considerations ? JSON.parse(updatedBreed.health_considerations) : []
    };

    return new Response(JSON.stringify(parsedBreed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error updating breed template ${breedId}:`, error);
    if (error instanceof SyntaxError) {
      return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    return createErrorResponse('Failed to update breed template', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Delete breed template
export async function deleteBreedTemplate(request: Request, env: Env, breedId: string, authResult: any): Promise<Response> {
  if (!breedId) {
    return createErrorResponse("Bad Request", "Breed ID is required.", 400);
  }

  try {
    const existingBreed = await env.PUPPIES_DB.prepare(
      'SELECT id FROM breeds WHERE id = ?'
    ).bind(breedId).first();

    if (!existingBreed) {
      return createErrorResponse("Not Found", `Breed template with ID ${breedId} not found.`, 404);
    }

    // Check if breed is being used by any puppies or litters
    const puppyCount = await env.PUPPIES_DB.prepare(
      'SELECT COUNT(*) as count FROM puppies WHERE breed = (SELECT name FROM breeds WHERE id = ?)'
    ).bind(breedId).first<{ count: number }>();

    const litterCount = await env.PUPPIES_DB.prepare(
      'SELECT COUNT(*) as count FROM litters WHERE breed = (SELECT name FROM breeds WHERE id = ?)'
    ).bind(breedId).first<{ count: number }>();

    if ((puppyCount?.count || 0) > 0 || (litterCount?.count || 0) > 0) {
      return createErrorResponse(
        "Cannot Delete", 
        "This breed template is being used by existing puppies or litters and cannot be deleted.", 
        400
      );
    }

    await env.PUPPIES_DB.prepare('DELETE FROM breeds WHERE id = ?').bind(breedId).run();

    return new Response(JSON.stringify({ message: 'Breed template deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error deleting breed template ${breedId}:`, error);
    return createErrorResponse('Failed to delete breed template', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}