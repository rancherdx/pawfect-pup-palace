
import { corsHeaders } from '../utils/cors';

export async function getAllLitters(request: Request, env: any) {
  const url = new URL(request.url);
  const breed = url.searchParams.get('breed');
  const status = url.searchParams.get('status');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  
  let query = 'SELECT * FROM litters WHERE 1=1';
  const params: any[] = [];
  
  if (breed) {
    query += ' AND breed = ?';
    params.push(breed);
  }
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY date_of_birth DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  try {
    const { results } = await env.PUPPIES_DB.prepare(query).bind(...params).all();
    
    // Count total for pagination
    const countResult = await env.PUPPIES_DB.prepare('SELECT COUNT(*) as total FROM litters').all();
    const total = countResult.results[0].total;
    
    return new Response(JSON.stringify({
      litters: results,
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
    console.error('Error fetching litters:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch litters' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function getLitterById(request: Request, env: any) {
  const { params } = request as any;
  const id = params.id;
  
  try {
    // Get the litter data
    const litterResult = await env.PUPPIES_DB
      .prepare('SELECT * FROM litters WHERE id = ?')
      .bind(id)
      .first();
      
    if (!litterResult) {
      return new Response(JSON.stringify({ error: 'Litter not found' }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Get the litter's puppies
    const puppiesResult = await env.PUPPIES_DB
      .prepare('SELECT * FROM puppies WHERE litter_id = ?')
      .bind(id)
      .all();
    
    const litter = {
      ...litterResult,
      puppies: puppiesResult.results
    };
    
    return new Response(JSON.stringify(litter), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching litter:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch litter' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function createLitter(request: Request, env: any, authResult: any) {
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
    const litter = await request.json();
    
    // Validate the litter data
    if (!litter.name || !litter.breed) {
      return new Response(JSON.stringify({ error: 'Name and breed are required' }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Insert the litter
    const result = await env.PUPPIES_DB
      .prepare(`
        INSERT INTO litters (name, mother, father, breed, date_of_birth, puppy_count, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        litter.name,
        litter.mother,
        litter.father,
        litter.breed,
        litter.dateOfBirth,
        litter.puppyCount,
        litter.status || 'Active'
      )
      .run();
    
    const litterId = result.meta.last_row_id;
    
    // Get the newly created litter
    const newLitter = await env.PUPPIES_DB
      .prepare('SELECT * FROM litters WHERE id = ?')
      .bind(litterId)
      .first();
    
    return new Response(JSON.stringify(newLitter), {
      status: 201,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating litter:', error);
    return new Response(JSON.stringify({ error: 'Failed to create litter' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function updateLitter(request: Request, env: any, authResult: any) {
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
    const litter = await request.json();
    
    // Update the litter
    await env.PUPPIES_DB
      .prepare(`
        UPDATE litters 
        SET 
          name = ?, 
          mother = ?, 
          father = ?, 
          breed = ?, 
          date_of_birth = ?, 
          puppy_count = ?, 
          status = ?
        WHERE id = ?
      `)
      .bind(
        litter.name,
        litter.mother,
        litter.father,
        litter.breed,
        litter.dateOfBirth,
        litter.puppyCount,
        litter.status,
        id
      )
      .run();
    
    // Get the updated litter
    const updatedLitter = await env.PUPPIES_DB
      .prepare('SELECT * FROM litters WHERE id = ?')
      .bind(id)
      .first();
    
    return new Response(JSON.stringify(updatedLitter), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error updating litter:', error);
    return new Response(JSON.stringify({ error: 'Failed to update litter' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

export async function deleteLitter(request: Request, env: any, authResult: any) {
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
    // First update any puppies that belong to this litter
    await env.PUPPIES_DB
      .prepare('UPDATE puppies SET litter_id = NULL WHERE litter_id = ?')
      .bind(id)
      .run();
    
    // Then delete the litter
    await env.PUPPIES_DB
      .prepare('DELETE FROM litters WHERE id = ?')
      .bind(id)
      .run();
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error deleting litter:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete litter' }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}
