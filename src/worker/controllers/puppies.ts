
import { corsHeaders } from '../utils/cors';

export async function getAllPuppies(request: Request, env: any) {
  const url = new URL(request.url);
  const breed = url.searchParams.get('breed');
  const status = url.searchParams.get('status');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  
  let query = 'SELECT * FROM puppies WHERE 1=1';
  const params: any[] = [];
  
  if (breed) {
    query += ' AND breed = ?';
    params.push(breed);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  try {
    const { results } = await env.PUPPIES_DB.prepare(query).bind(...params).all();
    
    // Count total for pagination
    const countResult = await env.PUPPIES_DB.prepare('SELECT COUNT(*) as total FROM puppies').all();
    const total = countResult.results[0].total;
    
    return new Response(JSON.stringify({
      puppies: results,
      pagination: {
        total,
        limit,
        offset
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching puppies:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch puppies' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function getPuppyById(request: Request, env: any) {
  const { params } = request as any;
  const id = params.id;
  
  try {
    // Get the puppy data
    const puppyResult = await env.PUPPIES_DB
      .prepare('SELECT * FROM puppies WHERE id = ?')
      .bind(id)
      .first();
      
    if (!puppyResult) {
      return new Response(JSON.stringify({ error: 'Puppy not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Get the puppy's images
    const imagesResult = await env.PUPPIES_DB
      .prepare('SELECT * FROM puppy_images WHERE puppy_id = ?')
      .bind(id)
      .all();
    
    // Get the puppy's parents if any
    const parentsResult = await env.PUPPIES_DB
      .prepare(`
        SELECT p.* FROM puppies p
        JOIN puppy_parents pp ON p.id = pp.parent_id
        WHERE pp.puppy_id = ?
      `)
      .bind(id)
      .all();
    
    const puppy = {
      ...puppyResult,
      images: imagesResult.results.map((img: any) => img.image_url),
      parents: {
        dad: parentsResult.results.find((p: any) => p.gender === 'Male'),
        mom: parentsResult.results.find((p: any) => p.gender === 'Female')
      }
    };
    
    return new Response(JSON.stringify(puppy), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching puppy:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch puppy' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function createPuppy(request: Request, env: any, authResult: any) {
  // Ensure the user has admin privileges
  if (authResult.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  
  try {
    const puppy = await request.json();
    
    // Validate the puppy data
    if (!puppy.name || !puppy.breed) {
      return new Response(JSON.stringify({ error: 'Name and breed are required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Insert the puppy
    const result = await env.PUPPIES_DB
      .prepare(`
        INSERT INTO puppies (name, breed, gender, birth_date, price, description, status, weight, color, microchipped)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        puppy.name,
        puppy.breed,
        puppy.gender,
        puppy.birthDate,
        puppy.price,
        puppy.description,
        puppy.status || 'Available',
        puppy.weight,
        puppy.color,
        puppy.microchipped ? 1 : 0
      )
      .run();
    
    const puppyId = result.meta.last_row_id;
    
    // Insert the puppy's images
    if (puppy.images && Array.isArray(puppy.images)) {
      const imageInserts = puppy.images.map((imageUrl: string, index: number) => {
        return env.PUPPIES_DB
          .prepare('INSERT INTO puppy_images (puppy_id, image_url, display_order) VALUES (?, ?, ?)')
          .bind(puppyId, imageUrl, index)
          .run();
      });
      
      await Promise.all(imageInserts);
    }
    
    // Insert the puppy's parents
    if (puppy.parents && puppy.parents.dad) {
      await env.PUPPIES_DB
        .prepare('INSERT INTO puppy_parents (puppy_id, parent_id, relation_type) VALUES (?, ?, ?)')
        .bind(puppyId, puppy.parents.dad.id, 'Father')
        .run();
    }
    
    if (puppy.parents && puppy.parents.mom) {
      await env.PUPPIES_DB
        .prepare('INSERT INTO puppy_parents (puppy_id, parent_id, relation_type) VALUES (?, ?, ?)')
        .bind(puppyId, puppy.parents.mom.id, 'Mother')
        .run();
    }
    
    // Get the newly created puppy
    const newPuppy = await env.PUPPIES_DB
      .prepare('SELECT * FROM puppies WHERE id = ?')
      .bind(puppyId)
      .first();
    
    return new Response(JSON.stringify(newPuppy), {
      status: 201,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating puppy:', error);
    return new Response(JSON.stringify({ error: 'Failed to create puppy' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function updatePuppy(request: Request, env: any, authResult: any) {
  // Ensure the user has admin privileges
  if (authResult.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  
  const { params } = request as any;
  const id = params.id;
  
  try {
    const puppy = await request.json();
    
    // Update the puppy
    await env.PUPPIES_DB
      .prepare(`
        UPDATE puppies 
        SET 
          name = ?, 
          breed = ?, 
          gender = ?, 
          birth_date = ?, 
          price = ?, 
          description = ?, 
          status = ?, 
          weight = ?, 
          color = ?,
          microchipped = ?
        WHERE id = ?
      `)
      .bind(
        puppy.name,
        puppy.breed,
        puppy.gender,
        puppy.birthDate,
        puppy.price,
        puppy.description,
        puppy.status,
        puppy.weight,
        puppy.color,
        puppy.microchipped ? 1 : 0,
        id
      )
      .run();
    
    // Update images: first delete existing ones then add new ones
    await env.PUPPIES_DB
      .prepare('DELETE FROM puppy_images WHERE puppy_id = ?')
      .bind(id)
      .run();
    
    if (puppy.images && Array.isArray(puppy.images)) {
      const imageInserts = puppy.images.map((imageUrl: string, index: number) => {
        return env.PUPPIES_DB
          .prepare('INSERT INTO puppy_images (puppy_id, image_url, display_order) VALUES (?, ?, ?)')
          .bind(id, imageUrl, index)
          .run();
      });
      
      await Promise.all(imageInserts);
    }
    
    // Update parents: first delete existing ones then add new ones
    await env.PUPPIES_DB
      .prepare('DELETE FROM puppy_parents WHERE puppy_id = ?')
      .bind(id)
      .run();
    
    if (puppy.parents && puppy.parents.dad) {
      await env.PUPPIES_DB
        .prepare('INSERT INTO puppy_parents (puppy_id, parent_id, relation_type) VALUES (?, ?, ?)')
        .bind(id, puppy.parents.dad.id, 'Father')
        .run();
    }
    
    if (puppy.parents && puppy.parents.mom) {
      await env.PUPPIES_DB
        .prepare('INSERT INTO puppy_parents (puppy_id, parent_id, relation_type) VALUES (?, ?, ?)')
        .bind(id, puppy.parents.mom.id, 'Mother')
        .run();
    }
    
    // Get the updated puppy
    const updatedPuppy = await env.PUPPIES_DB
      .prepare('SELECT * FROM puppies WHERE id = ?')
      .bind(id)
      .first();
    
    return new Response(JSON.stringify(updatedPuppy), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating puppy:', error);
    return new Response(JSON.stringify({ error: 'Failed to update puppy' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function deletePuppy(request: Request, env: any, authResult: any) {
  // Ensure the user has admin privileges
  if (authResult.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  
  const { params } = request as any;
  const id = params.id;
  
  try {
    // First delete related records
    await env.PUPPIES_DB
      .prepare('DELETE FROM puppy_images WHERE puppy_id = ?')
      .bind(id)
      .run();
    
    await env.PUPPIES_DB
      .prepare('DELETE FROM puppy_parents WHERE puppy_id = ?')
      .bind(id)
      .run();
    
    // Then delete the puppy
    await env.PUPPIES_DB
      .prepare('DELETE FROM puppies WHERE id = ?')
      .bind(id)
      .run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting puppy:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete puppy' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
