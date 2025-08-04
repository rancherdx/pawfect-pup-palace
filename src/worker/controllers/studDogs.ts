import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

// Consistent error response utility
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface StudDogCore {
  name: string;
  breed_id: string;
  age?: number | null;
  description?: string | null;
  temperament?: string | null;
  certifications?: string | string[] | null; // Input can be array, stored as JSON string
  stud_fee: number;
  image_urls?: string | string[] | null; // Input can be array, stored as JSON string
  is_available?: boolean;
}

interface StudDogRecord extends Omit<StudDogCore, 'is_available'> {
  id: string;
  owner_user_id: string;
  created_at: string;
  updated_at: string;
  is_available: boolean | number; // DB stores as 0/1
  certifications: string | null;
  image_urls: string | null;
}

// For Admin list, includes owner info
interface AdminStudDogListItem extends StudDogRecord {
    breed_name: string | null;
    owner_name: string | null;
    owner_email: string | null;
    // Parsed fields for convenience, though raw are also there from StudDogRecord
    parsed_image_urls: string[] | null;
    parsed_certifications: string[] | null;
}


interface StudDogPublicListItem {
    id: string;
    name: string;
    breed_name: string | null;
    age?: number | null;
    stud_fee: number;
    main_image_url: string | null;
    temperament?: string | null;
}

interface StudDogPublicDetail extends StudDogPublicListItem {
    description?: string | null;
    certifications: string[] | null; // Parsed from JSON
    image_urls: string[] | null; // Parsed from JSON
}


// Admin: Create Stud Dog
export async function createStudDog(request: Request, env: Env): Promise<Response> {
  const authResult = (request as unknown).auth;
  if (!authResult || !authResult.userId) {
    return createErrorResponse("Unauthorized", "Admin authentication required.", 401);
  }
  const owner_user_id = authResult.userId;

  try {
    const body = await request.json() as StudDogCore;

    if (!body.name || typeof body.name !== 'string') {
      return createErrorResponse("Validation Error", "Stud dog name is required.", 400);
    }
    if (!body.breed_id || typeof body.breed_id !== 'string') {
      return createErrorResponse("Validation Error", "Breed ID is required.", 400);
    }
    if (body.stud_fee === undefined || typeof body.stud_fee !== 'number' || body.stud_fee <= 0) {
      return createErrorResponse("Validation Error", "Stud fee must be a positive number.", 400);
    }
    if (body.age !== undefined && body.age !== null && (typeof body.age !== 'number' || body.age < 0)) {
        return createErrorResponse("Validation Error", "Age, if provided, must be a non-negative number.", 400);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const is_available = body.is_available === undefined ? 1 : (body.is_available ? 1 : 0);

    const certificationsString = Array.isArray(body.certifications) ? JSON.stringify(body.certifications) : (typeof body.certifications === 'string' ? body.certifications : null);
    const imageUrlsString = Array.isArray(body.image_urls) ? JSON.stringify(body.image_urls) : (typeof body.image_urls === 'string' ? body.image_urls : null);

    await env.PUPPIES_DB.prepare(
      `INSERT INTO stud_dogs (id, name, breed_id, age, description, temperament, certifications, stud_fee, image_urls, is_available, owner_user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, body.name, body.breed_id, body.age ?? null, body.description ?? null, body.temperament ?? null,
      certificationsString, body.stud_fee, imageUrlsString, is_available, owner_user_id, now, now
    ).run();

    // Fetch the newly created record with joins to return comprehensive data
    const newStudDogData = await env.PUPPIES_DB.prepare(
      `SELECT sd.*, b.name as breed_name, u.name as owner_name, u.email as owner_email
       FROM stud_dogs sd
       LEFT JOIN breeds b ON sd.breed_id = b.id
       LEFT JOIN users u ON sd.owner_user_id = u.id
       WHERE sd.id = ?`
    ).bind(id).first<AdminStudDogListItem>();


    if (!newStudDogData) {
        return createErrorResponse("Internal Server Error", "Failed to retrieve created stud dog.", 500);
    }

    const responseData = {
        ...newStudDogData,
        is_available: Boolean(newStudDogData.is_available),
        parsed_image_urls: newStudDogData.image_urls ? JSON.parse(newStudDogData.image_urls) : null,
        parsed_certifications: newStudDogData.certifications ? JSON.parse(newStudDogData.certifications) : null,
    };


    return new Response(JSON.stringify(responseData), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

  } catch (error) {
    console.error("Error creating stud dog:", error);
    if (error instanceof SyntaxError) return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    // @ts-ignore
    if (error.message && error.message.includes("FOREIGN KEY constraint failed")) {
        return createErrorResponse("Validation Error", "Invalid breed_id or owner_user_id.", 400);
    }
    return createErrorResponse("Failed to create stud dog", error instanceof Error ? error.message : "Unknown error", 500);
  }
}

// Admin: List Stud Dogs (includes unavailable, more details)
export async function listAdminStudDogs(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10); // Admin view might have different default limit
    const breedIdFilter = url.searchParams.get('breed_id');
    const ownerIdFilter = url.searchParams.get('owner_user_id');
    let searchQuery = url.searchParams.get('searchQuery');
    const availabilityFilter = url.searchParams.get('is_available'); // "true", "false", or "all" (or omit for all)

    if (page < 1) return createErrorResponse("Bad Request", "Page number must be 1 or greater.", 400);
    if (limit < 1 || limit > 100) return createErrorResponse("Bad Request", "Limit must be between 1 and 100.", 400);
    const offset = (page - 1) * limit;

    let whereClauses: string[] = ["1 = 1"]; // Start with a truthy condition
    const bindings: unknown[] = [];

    if (breedIdFilter) {
        whereClauses.push("sd.breed_id = ?");
        bindings.push(breedIdFilter);
    }
    if (ownerIdFilter) {
        whereClauses.push("sd.owner_user_id = ?");
        bindings.push(ownerIdFilter);
    }
    if (availabilityFilter === "true") {
        whereClauses.push("sd.is_available = 1");
    } else if (availabilityFilter === "false") {
        whereClauses.push("sd.is_available = 0");
    }
    // if "all" or omitted, no is_available filter is added

    if (searchQuery) {
        searchQuery = `%${searchQuery}%`;
        whereClauses.push("(sd.name LIKE ?)"); // Simple search by name for admin
        bindings.push(searchQuery);
    }

    const whereCondition = `WHERE ${whereClauses.join(' AND ')}`;

    const baseSql = `
      SELECT sd.id, sd.name, sd.age, sd.stud_fee, sd.image_urls, sd.certifications, sd.temperament, sd.description, sd.is_available,
             sd.owner_user_id, u.name as owner_name, u.email as owner_email,
             sd.breed_id, b.name as breed_name,
             sd.created_at, sd.updated_at
      FROM stud_dogs sd
      LEFT JOIN breeds b ON sd.breed_id = b.id
      LEFT JOIN users u ON sd.owner_user_id = u.id
      ${whereCondition}
      ORDER BY sd.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const countSql = `SELECT COUNT(*) as total_stud_dogs FROM stud_dogs sd ${whereCondition}`;

    try {
        const studDogsQuery = env.PUPPIES_DB.prepare(baseSql).bind(...bindings, limit, offset);
        const countQuery = env.PUPPIES_DB.prepare(countSql).bind(...bindings);

        const [studDogsResults, totalResult] = await Promise.all([
            studDogsQuery.all<StudDogRecord & {breed_name:string | null; owner_name: string | null; owner_email: string | null;}>(),
            countQuery.first<{ total_stud_dogs: number }>()
        ]);

        if (!studDogsResults || !totalResult) {
            return createErrorResponse("Internal Server Error", "Failed to fetch stud dogs data for admin.", 500);
        }

        const studDogs: AdminStudDogListItem[] = studDogsResults.results.map(sd => ({
            ...sd,
            is_available: Boolean(sd.is_available),
            parsed_image_urls: sd.image_urls ? JSON.parse(sd.image_urls) : null,
            parsed_certifications: sd.certifications ? JSON.parse(sd.certifications) : null,
            breed_name: sd.breed_name || "Unknown Breed",
            owner_name: sd.owner_name || "N/A",
            owner_email: sd.owner_email || "N/A",
        }));

        const totalStudDogs = totalResult.total_stud_dogs || 0;
        const totalPages = Math.ceil(totalStudDogs / limit);

        return new Response(JSON.stringify({ studDogs, currentPage: page, totalPages, totalStudDogs, limit }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

    } catch (error) {
        console.error("Error listing admin stud dogs:", error);
        return createErrorResponse("Failed to list stud dogs for admin", error instanceof Error ? error.message : "Unknown error", 500);
    }
}


// Public: List Available Stud Dogs
export async function listPublicStudDogs(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '12', 10);
  const breedIdFilter = url.searchParams.get('breed_id');

  if (page < 1) return createErrorResponse("Bad Request", "Page number must be 1 or greater.", 400);
  if (limit < 1 || limit > 50) return createErrorResponse("Bad Request", "Limit must be between 1 and 50.", 400);
  const offset = (page - 1) * limit;

  let baseSql = `
    SELECT sd.id, sd.name, sd.age, sd.stud_fee, sd.image_urls, sd.temperament, b.name as breed_name
    FROM stud_dogs sd
    LEFT JOIN breeds b ON sd.breed_id = b.id
    WHERE sd.is_available = 1`;
  let countSql = `SELECT COUNT(*) as total_stud_dogs FROM stud_dogs sd WHERE sd.is_available = 1`;

  const bindings: any[] = [];
  const countBindings: any[] = [];

  if (breedIdFilter) {
    baseSql += " AND sd.breed_id = ?";
    countSql += " AND sd.breed_id = ?";
    bindings.push(breedIdFilter);
    countBindings.push(breedIdFilter);
  }

  baseSql += " ORDER BY sd.created_at DESC LIMIT ? OFFSET ?";
  bindings.push(limit, offset);

  try {
    const studDogsQuery = env.PUPPIES_DB.prepare(baseSql).bind(...bindings);
    const countQuery = env.PUPPIES_DB.prepare(countSql).bind(...countBindings);

    const [studDogsResults, totalResult] = await Promise.all([
      studDogsQuery.all<Omit<StudDogPublicListItem, 'main_image_url' | 'breed_name'> & {image_urls: string | null; breed_name: string | null}>(),
      countQuery.first<{ total_stud_dogs: number }>()
    ]);

    if (!studDogsResults || !totalResult) {
      return createErrorResponse("Internal Server Error", "Failed to fetch stud dogs data.", 500);
    }

    const studDogs: StudDogPublicListItem[] = studDogsResults.results.map(sd => {
        let main_image_url: string | null = null;
        if (sd.image_urls) {
            try {
                const images = JSON.parse(sd.image_urls);
                if (Array.isArray(images) && images.length > 0) main_image_url = images[0];
            } catch (e) { console.error("Failed to parse image_urls for stud dog", sd.id, e); }
        }
        return { ...sd, age: sd.age ?? undefined, temperament: sd.temperament ?? undefined, main_image_url, breed_name: sd.breed_name || "Unknown Breed" };
    });

    const totalStudDogs = totalResult.total_stud_dogs || 0;
    const totalPages = Math.ceil(totalStudDogs / limit);

    return new Response(JSON.stringify({ studDogs, currentPage: page, totalPages, totalStudDogs, limit }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

  } catch (error) {
    console.error("Error listing public stud dogs:", error);
    return createErrorResponse("Failed to list stud dogs", error instanceof Error ? error.message : "Unknown error", 500);
  }
}

// Public: Get Stud Dog Details
export async function getStudDogDetails(request: Request, env: Env, studDogId: string): Promise<Response> {
  if (!studDogId) {
    return createErrorResponse("Bad Request", "Stud Dog ID is required.", 400);
  }
  try {
    const studDogData = await env.PUPPIES_DB.prepare(
      `SELECT sd.*, b.name as breed_name
       FROM stud_dogs sd
       LEFT JOIN breeds b ON sd.breed_id = b.id
       WHERE sd.id = ?`
    ).bind(studDogId).first<StudDogRecord & {breed_name: string | null}>();

    if (!studDogData) {
      return createErrorResponse("Not Found", `Stud dog with ID ${studDogId} not found.`, 404);
    }

    const parsedImages = studDogData.image_urls ? JSON.parse(studDogData.image_urls) : null;
    const parsedCertifications = studDogData.certifications ? JSON.parse(studDogData.certifications) : null;

    const studDogDetail: StudDogPublicDetail = {
        id: studDogData.id,
        name: studDogData.name,
        breed_name: studDogData.breed_name || "Unknown Breed",
        age: studDogData.age ?? undefined,
        stud_fee: studDogData.stud_fee,
        main_image_url: (parsedImages && parsedImages.length > 0) ? parsedImages[0] : null,
        temperament: studDogData.temperament ?? undefined,
        description: studDogData.description ?? undefined,
        certifications: parsedCertifications,
        image_urls: parsedImages,
    };

    return new Response(JSON.stringify(studDogDetail), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  } catch (error) {
    console.error(`Error fetching stud dog ${studDogId}:`, error);
    return createErrorResponse("Failed to fetch stud dog details", error instanceof Error ? error.message : "Unknown error", 500);
  }
}

// Admin: Update Stud Dog
export async function updateStudDog(request: Request, env: Env, studDogId: string): Promise<Response> {
  const authResult = (request as any).auth;
  if (!authResult || !authResult.userId) {
    return createErrorResponse("Unauthorized", "Admin authentication required.", 401);
  }

  if (!studDogId) {
    return createErrorResponse("Bad Request", "Stud Dog ID is required.", 400);
  }

  try {
    const body = await request.json() as Partial<StudDogCore>;

    const existingStudDog = await env.PUPPIES_DB.prepare("SELECT id, owner_user_id FROM stud_dogs WHERE id = ?")
        .bind(studDogId).first<{id: string, owner_user_id: string}>();

    if (!existingStudDog) {
      return createErrorResponse("Not Found", `Stud dog with ID ${studDogId} not found.`, 404);
    }

    const updates: Record<string, any> = {};
    const allowedFields: (keyof StudDogCore)[] = ['name', 'breed_id', 'age', 'description', 'temperament', 'certifications', 'stud_fee', 'image_urls', 'is_available'];

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            if (field === 'image_urls' || field === 'certifications') {
                updates[field] = Array.isArray(body[field]) ? JSON.stringify(body[field]) : body[field];
            } else if (field === 'is_available') {
                updates[field] = body[field] ? 1 : 0;
            } else {
                updates[field] = body[field] === null ? null : body[field];
            }
        }
    }

    if (body.stud_fee !== undefined && (typeof body.stud_fee !== 'number' || body.stud_fee <= 0)) {
      return createErrorResponse("Validation Error", "Stud fee must be a positive number.", 400);
    }
    if (body.age !== undefined && body.age !== null && (typeof body.age !== 'number' || body.age < 0)) {
        return createErrorResponse("Validation Error", "Age, if provided, must be a non-negative number.", 400);
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse("Bad Request", "No update fields provided.", 400);
    }
    updates.updated_at = new Date().toISOString();

    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), studDogId];

    await env.PUPPIES_DB.prepare(`UPDATE stud_dogs SET ${setClauses} WHERE id = ?`).bind(...values).run();

    const updatedStudDogData = await env.PUPPIES_DB.prepare(
         `SELECT sd.*, b.name as breed_name, u.name as owner_name, u.email as owner_email
          FROM stud_dogs sd
          LEFT JOIN breeds b ON sd.breed_id = b.id
          LEFT JOIN users u ON sd.owner_user_id = u.id
          WHERE sd.id = ?`
    ).bind(studDogId).first<AdminStudDogListItem>();

    if(!updatedStudDogData) {
        return createErrorResponse("Internal Server Error", "Failed to retrieve updated stud dog after update.", 500);
    }

     const responseData = {
        ...updatedStudDogData,
        is_available: Boolean(updatedStudDogData.is_available),
        parsed_image_urls: updatedStudDogData.image_urls ? JSON.parse(updatedStudDogData.image_urls) : null,
        parsed_certifications: updatedStudDogData.certifications ? JSON.parse(updatedStudDogData.certifications) : null,
    };

    return new Response(JSON.stringify(responseData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }});

  } catch (error) {
    console.error(`Error updating stud dog ${studDogId}:`, error);
    if (error instanceof SyntaxError) return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    return createErrorResponse("Failed to update stud dog", error instanceof Error ? error.message : "Unknown error", 500);
  }
}

// Admin: Delete Stud Dog
export async function deleteStudDog(request: Request, env: Env, studDogId: string): Promise<Response> {
  const authResult = (request as any).auth;
  if (!authResult || !authResult.userId) {
    return createErrorResponse("Unauthorized", "Admin authentication required.", 401);
  }
  if (!studDogId) {
    return createErrorResponse("Bad Request", "Stud Dog ID is required.", 400);
  }

  try {
    const result = await env.PUPPIES_DB.prepare("DELETE FROM stud_dogs WHERE id = ?").bind(studDogId).run();
    if (result.changes === 0) {
      return createErrorResponse("Not Found", `Stud dog with ID ${studDogId} not found.`, 404);
    }
    return new Response(JSON.stringify({ message: "Stud dog deleted successfully." }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error(`Error deleting stud dog ${studDogId}:`, error);
    return createErrorResponse("Failed to delete stud dog", error instanceof Error ? error.message : "Unknown error", 500);
  }
}
