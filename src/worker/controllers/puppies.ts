import { corsHeaders } from '../utils/cors';
import type { Env } from '../env'; // Import Env type

// Helper to get D1 binding more type-safely
const getDB = (env: Env) => env.PUPPIES_DB;

interface AuthResult {
    userId: string;
    roles: string[];
}

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Note: For all functions in this file that include an `authResult` parameter or imply admin-only access,
// the router (e.g., in `src/worker/index.ts` or a dedicated router file) is responsible for:
// 1. Calling `verifyJwtAuth(request, env)` to authenticate the user.
// 2. If the route is admin-only (like createPuppy, updatePuppy, deletePuppy),
//    also calling `adminAuthMiddleware(request, env)` to ensure admin privileges.
// 3. Passing the `authResult.decodedToken` (or relevant parts like `userId`, `roles`)
//    from the authentication functions to these controller functions.
// The `authResult` parameter in these functions expects the decoded JWT payload.

// Define a basic Puppy type based on actual database schema
interface Puppy {
    id: string;
    name: string;
    litter_id: string | null;
    breed: string; // Using breed instead of breed_id to match actual schema
    gender: string | null;
    color: string | null;
    birth_date: string; // YYYY-MM-DD
    weight: number | null;
    price: number | null;
    status: string; // e.g., available, reserved, adopted
    description: string | null;
    temperament: string | null; // JSON string array
    photo_url: string | null;
    created_at: string;
    updated_at: string;
}


export async function getAllPuppies(request: Request, env: Env) {
  const url = new URL(request.url);
  const breedName = url.searchParams.get('breed');
  const status = url.searchParams.get('status');
  const searchQuery = url.searchParams.get('searchQuery');
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const offset = (page - 1) * limit;
  
  let queryString = 'SELECT p.id, p.name, p.breed, p.gender, p.birth_date, p.price, p.status, p.photo_url, p.color, p.temperament, p.description, p.litter_id, p.weight, p.created_at, p.updated_at FROM puppies p WHERE 1=1';
  const queryParams: unknown[] = [];
  
  if (breedName) {
    queryString += ' AND p.breed = ?';
    queryParams.push(breedName);
  }
  
  if (status) {
    queryString += ' AND p.status = ?';
    queryParams.push(status);
  }
  
  if (searchQuery) {
    queryString += ' AND (p.name LIKE ? OR p.breed LIKE ?)';
    queryParams.push(`%${searchQuery}%`, `%${searchQuery}%`);
  }
  
  queryString += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);
  
  try {
    const db = getDB(env);
    const { results } = await db.prepare(queryString).bind(...queryParams).all<Puppy>();
    
    const puppies = results.map((p: any) => ({
        ...p,
        birthDate: p.birth_date,
        photoUrl: p.photo_url,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        litterId: p.litter_id
    }));

    let countQueryString = 'SELECT COUNT(p.id) as total FROM puppies p WHERE 1=1';
    const countParams: unknown[] = [];
    if (breedName) {
      countQueryString += ' AND p.breed = ?';
      countParams.push(breedName);
    }
    if (status) {
      countQueryString += ' AND p.status = ?';
      countParams.push(status);
    }
    if (searchQuery) {
      countQueryString += ' AND (p.name LIKE ? OR p.breed LIKE ?)';
      countParams.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    const countResult = await db.prepare(countQueryString).bind(...countParams).first<{total: number}>();
    const totalItems = countResult?.total || 0;
    
    return new Response(JSON.stringify({
      puppies,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalPuppies: totalItems,
      limit
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  } catch (error: any) {
    console.error('Error fetching puppies:', error);
    return createErrorResponse('Failed to fetch puppies', error.message, 500);
  }
}

export async function getPuppyById(request: Request, env: Env) {
  const { params: requestParams } = request as any; // request.params is from itty-router
  const id = requestParams.id;
  
  try {
    const db = getDB(env);
    const puppyResult = await db
      .prepare('SELECT * FROM puppies WHERE id = ?')
      .bind(id)
      .first<Puppy>();
      
    if (!puppyResult) {
      return createErrorResponse('Puppy not found', `No puppy found with ID: ${id}`, 404);
    }
    
    const puppyWithFormattedFields = {
        ...puppyResult,
        birthDate: puppyResult.birth_date,
        photoUrl: puppyResult.photo_url,
        createdAt: puppyResult.created_at,
        updatedAt: puppyResult.updated_at,
        litterId: puppyResult.litter_id
    };
    
    return new Response(JSON.stringify(puppyWithFormattedFields), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  } catch (error: any) {
    console.error(`Error fetching puppy ${id}:`, error);
    return createErrorResponse('Failed to fetch puppy details', error.message, 500);
  }
}

// Example: Router should call adminAuthMiddleware before this.
export async function createPuppy(request: Request, env: Env, authResult: AuthResult) {
  // authResult is expected to be the decoded JWT payload from adminAuthMiddleware
  // The adminAuthMiddleware itself would have already checked for admin roles.
  // However, keeping an explicit check here can be a secondary safeguard.
  if (!authResult.roles || !authResult.roles.includes('admin')) {
    return createErrorResponse('Unauthorized', 'Admin role required to create puppies.', 403);
  }
  
  try {
    const puppyData = await request.json() as any;
    const db = getDB(env);
    
    if (!puppyData.name || !puppyData.breed) {
      return createErrorResponse('Validation Error', 'Missing required fields: name, breed.', 400);
    }
    // TODO: Add more specific validation (e.g., breed_id exists, litter_id exists) by querying the respective tables.

    const puppyId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await db
      .prepare(`
        INSERT INTO puppies (
          id, name, breed, gender, color, birth_date,
          weight, price, status, description,
          temperament, photo_url, litter_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        puppyId,
        puppyData.name,
        puppyData.breed,
        puppyData.gender || null,
        puppyData.color || null,
        puppyData.birthDate || puppyData.birth_date || new Date().toISOString().split('T')[0],
        puppyData.weight || null,
        puppyData.price || null,
        puppyData.status || 'Available',
        puppyData.description || null,
        Array.isArray(puppyData.temperament) ? JSON.stringify(puppyData.temperament) : puppyData.temperament || null,
        puppyData.photoUrl || puppyData.photo_url || null,
        puppyData.litterId || puppyData.litter_id || null,
        now,
        now
      )
      .run();
    
    const newPuppy = await db
      .prepare('SELECT * FROM puppies WHERE id = ?')
      .bind(puppyId)
      .first<Puppy>();

    if (newPuppy) {
        const formattedPuppy = {
          ...newPuppy,
          birthDate: newPuppy.birth_date,
          photoUrl: newPuppy.photo_url,
          createdAt: newPuppy.created_at,
          updatedAt: newPuppy.updated_at,
          litterId: newPuppy.litter_id
        };
        return new Response(JSON.stringify(formattedPuppy), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    } else {
        return createErrorResponse('Failed to retrieve created puppy', null, 500);
    }

  } catch (error: any) {
    console.error('Error creating puppy:', error);
    // Check for D1_CONSTRAINT to provide more specific error for foreign key violations if possible
    if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
        return createErrorResponse('Validation Error', 'Invalid litter_id or breed_id. Ensure they exist.', 400);
    }
    return createErrorResponse('Failed to create puppy', error.message, 500);
  }
}

// Example: Router should call adminAuthMiddleware before this.
export async function updatePuppy(request: Request, env: Env, authResult: AuthResult) {
  // authResult is expected to be the decoded JWT payload from adminAuthMiddleware
  if (!authResult.roles || !authResult.roles.includes('admin')) {
    return createErrorResponse('Unauthorized', 'Admin role required to update puppies.', 403);
  }
  
  const { params: requestParams } = request as any;
  const id = requestParams.id;
  
  try {
    const puppyData = await request.json() as Partial<Puppy>;
    const db = getDB(env);

    const existingPuppy = await db.prepare("SELECT id FROM puppies WHERE id = ?").bind(id).first();
    if (!existingPuppy) {
        return createErrorResponse('Puppy not found', `No puppy found with ID: ${id} to update.`, 404);
    }

    const updates: Record<string, any> = {};
    // Only include fields that are present in puppyData
    for (const key in puppyData) {
        if (Object.prototype.hasOwnProperty.call(puppyData, key) && key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'breed_name' && key !== 'litter_name') {
            if (key === 'image_urls' && Array.isArray((puppyData as any)[key])) {
                 updates[key] = JSON.stringify((puppyData as any)[key]);
            } else if ((puppyData as any)[key] !== undefined) {
                 updates[key] = (puppyData as any)[key];
            }
        }
    }
    
    if (Object.keys(updates).length === 0) {
      return createErrorResponse('No update fields provided.', null, 400);
    }
    updates.updated_at = new Date().toISOString();

    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    
    await db.prepare(`UPDATE puppies SET ${setClauses} WHERE id = ?`).bind(...values).run();
    
    const updatedPuppy = await db
      .prepare('SELECT * FROM puppies WHERE id = ?')
      .bind(id)
      .first<Puppy>();

    if (updatedPuppy) {
        const formattedPuppy = {
          ...updatedPuppy,
          birthDate: updatedPuppy.birth_date,
          photoUrl: updatedPuppy.photo_url,
          createdAt: updatedPuppy.created_at,
          updatedAt: updatedPuppy.updated_at,
          litterId: updatedPuppy.litter_id
        };
        return new Response(JSON.stringify(formattedPuppy), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    } else {
        return createErrorResponse('Failed to retrieve updated puppy', null, 500);
    }

  } catch (error: any) {
    console.error(`Error updating puppy ${id}:`, error);
    if (error.message && error.message.includes('FOREIGN KEY constraint failed')) {
        return createErrorResponse('Validation Error', 'Invalid litter_id or breed_id. Ensure they exist.', 400);
    }
    return createErrorResponse('Failed to update puppy', error.message, 500);
  }
}

// Example: Router should call adminAuthMiddleware before this.
export async function deletePuppy(request: Request, env: Env, authResult: AuthResult) {
  // authResult is expected to be the decoded JWT payload from adminAuthMiddleware
  if (!authResult.roles || !authResult.roles.includes('admin')) {
    return createErrorResponse('Unauthorized', 'Admin role required to delete puppies.', 403);
  }
  
  const { params: requestParams } = request as any;
  const id = requestParams.id;
  const db = getDB(env);
  
  try {
    const existingPuppy = await db.prepare("SELECT id FROM puppies WHERE id = ?").bind(id).first();
    if (!existingPuppy) {
        return createErrorResponse('Puppy not found', `No puppy found with ID: ${id} to delete.`, 404);
    }
    
    const result = await db.prepare('DELETE FROM puppies WHERE id = ?').bind(id).run();

    if (result.changes === 0) {
      return createErrorResponse('Puppy not found or already deleted', `Failed to delete puppy with ID: ${id}.`, 404);
    }
    
    return new Response(JSON.stringify({ success: true, message: `Puppy ${id} deleted successfully.` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  } catch (error: any) {
    console.error(`Error deleting puppy ${id}:`, error);
    return createErrorResponse('Failed to delete puppy', error.message, 500);
  }
}

// Example: Router should call verifyJwtAuth before this.
export async function getMyPuppies(request: Request, env: Env, authResult: AuthResult) {
    // authResult is expected to be the decoded JWT payload from verifyJwtAuth
    const { userId } = authResult;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    try {
        const db = getDB(env);
        const puppiesStmt = db.prepare(`
            SELECT p.*, b.name as breed_name, l.name as litter_name
            FROM puppies p
            JOIN adoptions a ON p.id = a.puppy_id
            LEFT JOIN breeds b ON p.breed_id = b.id
            LEFT JOIN litters l ON p.litter_id = l.id
            WHERE a.user_id = ?
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `).bind(userId, limit, offset);
        const { results } = await puppiesStmt.all<Puppy>();

        const puppies = results.map((p: any) => ({
            ...p,
            birthDate: p.birth_date,
            photoUrl: p.photo_url,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            litterId: p.litter_id
        }));

        const countStmt = db.prepare(`
            SELECT COUNT(p.id) as total
            FROM puppies p
            JOIN adoptions a ON p.id = a.puppy_id
            WHERE a.user_id = ?
        `).bind(userId);
        const countResult = await countStmt.first<{total: number}>();
        const totalItems = countResult?.total || 0;

        return new Response(JSON.stringify({
            data: puppies,
            page,
            limit,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error: any) {
        console.error('Error fetching my puppies:', error);
        return createErrorResponse('Failed to fetch your puppies', error.message, 500);
    }
}

// Example: Router should call verifyJwtAuth before this.
// The function itself handles owner/admin checks based on authResult.
export async function getPuppyHealthRecords(request: Request, env: Env, params: { puppyId: string }, authResult: AuthResult) {
    // authResult is expected to be the decoded JWT payload from verifyJwtAuth
    const { puppyId } = params;
    const { userId, roles } = authResult;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = (page - 1) * limit;

    try {
        const db = getDB(env);

        const puppyExists = await db.prepare("SELECT id FROM puppies WHERE id = ?").bind(puppyId).first();
        if (!puppyExists) {
             return createErrorResponse('Not Found', `Puppy with ID ${puppyId} not found.`, 404);
        }

        let isAuthorized = false;
        if (roles && roles.includes('admin')) {
            isAuthorized = true;
        } else {
            const ownerCheckStmt = db.prepare(`SELECT user_id FROM adoptions WHERE puppy_id = ? AND user_id = ?`).bind(puppyId, userId);
            const ownerCheck = await ownerCheckStmt.first();
            if (ownerCheck) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return createErrorResponse('Forbidden', 'You do not own this puppy or are not authorized to view its health records.', 403);
        }

        const recordsStmt = db.prepare(`
            SELECT * FROM puppy_health_records
            WHERE puppy_id = ?
            ORDER BY date DESC, created_at DESC
            LIMIT ? OFFSET ?
        `).bind(puppyId, limit, offset);
        const { results: records } = await recordsStmt.all();

        const countStmt = db.prepare(`SELECT COUNT(id) as total FROM puppy_health_records WHERE puppy_id = ?`).bind(puppyId);
        const countResult = await countStmt.first<{total: number}>();
        const totalItems = countResult?.total || 0;

        return new Response(JSON.stringify({
            data: records,
            page,
            limit,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (error: any) {
        console.error(`Error fetching health records for puppy ${puppyId}:`, error);
        return createErrorResponse('Failed to fetch health records', error.message, 500);
    }
}

// Example: Router should call verifyJwtAuth before this.
// The function itself handles owner/admin checks based on authResult.
export async function addPuppyHealthRecord(request: Request, env: Env, authResult: AuthResult, params: { puppyId: string }) {
    // authResult is expected to be the decoded JWT payload from verifyJwtAuth
    const { puppyId } = params;
    const { userId, roles } = authResult;

    let body;
    try {
        body = await request.json();
    } catch (e: any) {
        return createErrorResponse('Invalid JSON body', e.message, 400);
    }

    const { record_type, date, details, value, unit } = body as { record_type?: string, date?: string, details?: string, value?: number | null, unit?: string | null };

    if (!record_type || typeof record_type !== 'string' || record_type.trim() === '') {
        return createErrorResponse('record_type is required and must be a non-empty string', null, 400);
    }
    if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return createErrorResponse('date is required and must be in YYYY-MM-DD format', null, 400);
    }
    if (details && typeof details !== 'string') {
        return createErrorResponse('details must be a string if provided', null, 400);
    }
    if (value !== undefined && value !== null && typeof value !== 'number') {
        return createErrorResponse('value must be a number or null if provided', null, 400);
    }
    if (unit !== undefined && unit !== null && typeof unit !== 'string') {
        return createErrorResponse('unit must be a string or null if provided', null, 400);
    }

    try {
        const db = getDB(env);

        const puppyExistsCheck = await db.prepare("SELECT id FROM puppies WHERE id = ?").bind(puppyId).first();
        if (!puppyExistsCheck) {
             return createErrorResponse('Not Found', `Puppy with ID ${puppyId} not found. Cannot add health record.`, 404);
        }

        let isAuthorized = false;
        if (roles && roles.includes('admin')) {
            isAuthorized = true;
        } else {
            const ownerCheckStmt = db.prepare(`SELECT user_id FROM adoptions WHERE puppy_id = ? AND user_id = ?`).bind(puppyId, userId);
            const ownerCheck = await ownerCheckStmt.first();
            if (ownerCheck) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return createErrorResponse('Forbidden', 'You do not own this puppy or are not authorized to add health records.', 403);
        }

        const recordId = crypto.randomUUID();
        const now = new Date().toISOString();

        const stmt = db.prepare(`
            INSERT INTO puppy_health_records (id, puppy_id, record_type, date, details, value, unit, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(recordId, puppyId, record_type, date, details || null, value === undefined ? null : value, unit === undefined ? null : unit, now, now);

        await stmt.run();

        const newRecord = await db.prepare("SELECT * FROM puppy_health_records WHERE id = ?").bind(recordId).first();

        return new Response(JSON.stringify(newRecord), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error: any) {
        console.error(`Error adding health record for puppy ${puppyId}:`, error);
        return createErrorResponse('Failed to add health record', error.message, 500);
    }
}
