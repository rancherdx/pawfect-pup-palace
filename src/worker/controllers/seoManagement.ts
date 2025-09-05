import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface SEOMeta {
  id: string;
  page_type: string;
  page_id?: string;
  page_slug?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type: string;
  twitter_card: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  robots: string;
  schema_markup?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface SEOCreateData {
  page_type: string;
  page_id?: string;
  page_slug?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  robots?: string;
  schema_markup?: Record<string, any>;
}

// Admin: List all SEO meta entries
export async function listSEOMeta(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page_type = url.searchParams.get('page_type');
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM seo_meta';
    const params: any[] = [];

    if (page_type) {
      query += ' WHERE page_type = ?';
      params.push(page_type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const results = await env.PUPPIES_DB.prepare(query).bind(...params).all<SEOMeta>();

    // Parse JSON fields
    const seoMeta = (results.results || []).map(meta => ({
      ...meta,
      meta_keywords: typeof meta.meta_keywords === 'string' ? JSON.parse(meta.meta_keywords) : meta.meta_keywords,
      schema_markup: typeof meta.schema_markup === 'string' ? JSON.parse(meta.schema_markup) : meta.schema_markup
    }));

    return new Response(JSON.stringify({ seo_meta: seoMeta }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error listing SEO meta:', error);
    return createErrorResponse('Failed to list SEO meta', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Get SEO meta by ID or page identifier
export async function getSEOMeta(request: Request, env: Env, identifier: string): Promise<Response> {
  const url = new URL(request.url);
  const byPageType = url.searchParams.get('by') === 'page';
  const pageId = url.searchParams.get('page_id');
  const pageSlug = url.searchParams.get('page_slug');

  try {
    let query: string;
    let params: any[];

    if (byPageType) {
      if (pageId) {
        query = 'SELECT * FROM seo_meta WHERE page_type = ? AND page_id = ?';
        params = [identifier, pageId];
      } else if (pageSlug) {
        query = 'SELECT * FROM seo_meta WHERE page_type = ? AND page_slug = ?';
        params = [identifier, pageSlug];
      } else {
        query = 'SELECT * FROM seo_meta WHERE page_type = ?';
        params = [identifier];
      }
    } else {
      query = 'SELECT * FROM seo_meta WHERE id = ?';
      params = [identifier];
    }

    const result = await env.PUPPIES_DB.prepare(query).bind(...params).first<SEOMeta>();

    if (!result) {
      return createErrorResponse("Not Found", "SEO meta not found.", 404);
    }

    // Parse JSON fields
    const seoMeta = {
      ...result,
      meta_keywords: typeof result.meta_keywords === 'string' ? JSON.parse(result.meta_keywords) : result.meta_keywords,
      schema_markup: typeof result.schema_markup === 'string' ? JSON.parse(result.schema_markup) : result.schema_markup
    };

    return new Response(JSON.stringify(seoMeta), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching SEO meta:', error);
    return createErrorResponse('Failed to fetch SEO meta', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Create or update SEO meta
export async function upsertSEOMeta(request: Request, env: Env, authResult: any): Promise<Response> {
  try {
    const seoData = await request.json() as SEOCreateData;

    if (!seoData.page_type) {
      return createErrorResponse("Validation Error", "Page type is required.", 400);
    }

    // Check if entry already exists
    let existingQuery = 'SELECT id FROM seo_meta WHERE page_type = ?';
    const existingParams = [seoData.page_type];

    if (seoData.page_id) {
      existingQuery += ' AND page_id = ?';
      existingParams.push(seoData.page_id);
    } else if (seoData.page_slug) {
      existingQuery += ' AND page_slug = ?';
      existingParams.push(seoData.page_slug);
    }

    const existing = await env.PUPPIES_DB.prepare(existingQuery).bind(...existingParams).first<{ id: string }>();

    const now = new Date().toISOString();

    if (existing) {
      // Update existing
      const updates: Record<string, any> = {};
      const allowedFields = [
        'meta_title', 'meta_description', 'meta_keywords', 'og_title', 'og_description', 
        'og_image', 'og_type', 'twitter_card', 'twitter_title', 'twitter_description', 
        'twitter_image', 'canonical_url', 'robots', 'schema_markup'
      ];

      for (const field of allowedFields) {
        if (seoData[field] !== undefined) {
          updates[field] = field === 'meta_keywords' || field === 'schema_markup' 
            ? JSON.stringify(seoData[field]) 
            : seoData[field];
        }
      }

      updates.updated_at = now;

      const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), (existing as { id: string }).id];

      await env.PUPPIES_DB.prepare(`UPDATE seo_meta SET ${setClauses} WHERE id = ?`).bind(...values).run();

      const updated = await env.PUPPIES_DB.prepare('SELECT * FROM seo_meta WHERE id = ?').bind((existing as { id: string }).id).first<SEOMeta>();
      
      return new Response(JSON.stringify({
        ...updated,
        meta_keywords: typeof updated?.meta_keywords === 'string' ? JSON.parse(updated.meta_keywords) : updated?.meta_keywords,
        schema_markup: typeof updated?.schema_markup === 'string' ? JSON.parse(updated.schema_markup) : updated?.schema_markup
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else {
      // Create new
      const id = crypto.randomUUID();

      await env.PUPPIES_DB.prepare(`
        INSERT INTO seo_meta (
          id, page_type, page_id, page_slug, meta_title, meta_description, 
          meta_keywords, og_title, og_description, og_image, og_type, 
          twitter_card, twitter_title, twitter_description, twitter_image, 
          canonical_url, robots, schema_markup, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        seoData.page_type,
        seoData.page_id || null,
        seoData.page_slug || null,
        seoData.meta_title || null,
        seoData.meta_description || null,
        seoData.meta_keywords ? JSON.stringify(seoData.meta_keywords) : null,
        seoData.og_title || null,
        seoData.og_description || null,
        seoData.og_image || null,
        seoData.og_type || 'website',
        seoData.twitter_card || 'summary_large_image',
        seoData.twitter_title || null,
        seoData.twitter_description || null,
        seoData.twitter_image || null,
        seoData.canonical_url || null,
        seoData.robots || 'index,follow',
        seoData.schema_markup ? JSON.stringify(seoData.schema_markup) : null,
        now,
        now
      ).run();

      const newSEO = await env.PUPPIES_DB.prepare('SELECT * FROM seo_meta WHERE id = ?').bind(id).first<SEOMeta>();

      return new Response(JSON.stringify({
        ...newSEO,
        meta_keywords: typeof newSEO?.meta_keywords === 'string' ? JSON.parse(newSEO.meta_keywords) : newSEO?.meta_keywords,
        schema_markup: typeof newSEO?.schema_markup === 'string' ? JSON.parse(newSEO.schema_markup) : newSEO?.schema_markup
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error upserting SEO meta:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    return createErrorResponse('Failed to upsert SEO meta', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Delete SEO meta
export async function deleteSEOMeta(request: Request, env: Env, seoId: string, authResult: any): Promise<Response> {
  if (!seoId) {
    return createErrorResponse("Bad Request", "SEO meta ID is required.", 400);
  }

  try {
    const existing = await env.PUPPIES_DB.prepare('SELECT id FROM seo_meta WHERE id = ?').bind(seoId).first();

    if (!existing) {
      return createErrorResponse("Not Found", `SEO meta with ID ${seoId} not found.`, 404);
    }

    await env.PUPPIES_DB.prepare('DELETE FROM seo_meta WHERE id = ?').bind(seoId).run();

    return new Response(JSON.stringify({ message: 'SEO meta deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error deleting SEO meta ${seoId}:`, error);
    return createErrorResponse('Failed to delete SEO meta', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Public: Get SEO data for a specific page
export async function getPublicSEOMeta(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const pageType = url.searchParams.get('page_type');
  const pageId = url.searchParams.get('page_id');
  const pageSlug = url.searchParams.get('page_slug');

  if (!pageType) {
    return createErrorResponse("Bad Request", "Page type is required.", 400);
  }

  try {
    let query = 'SELECT * FROM seo_meta WHERE page_type = ?';
    const params = [pageType];

    if (pageId) {
      query += ' AND page_id = ?';
      params.push(pageId);
    } else if (pageSlug) {
      query += ' AND page_slug = ?';
      params.push(pageSlug);
    }

    const result = await env.PUPPIES_DB.prepare(query).bind(...params).first<SEOMeta>();

    if (!result) {
      // Return default SEO structure
      return new Response(JSON.stringify({
        page_type: pageType,
        meta_title: '',
        meta_description: '',
        robots: 'index,follow',
        og_type: 'website'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse JSON fields
    const seoMeta = {
      ...result,
      meta_keywords: typeof result.meta_keywords === 'string' ? JSON.parse(result.meta_keywords) : result.meta_keywords,
      schema_markup: typeof result.schema_markup === 'string' ? JSON.parse(result.schema_markup) : result.schema_markup
    };

    return new Response(JSON.stringify(seoMeta), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching public SEO meta:', error);
    return createErrorResponse('Failed to fetch SEO meta', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Generate sitemap data
export async function generateSitemap(request: Request, env: Env): Promise<Response> {
  try {
    const [puppies, litters, blogPosts] = await Promise.all([
      env.PUPPIES_DB.prepare('SELECT id, updated_at FROM puppies').all<{ id: string; updated_at: string }>(),
      env.PUPPIES_DB.prepare('SELECT id, updated_at FROM litters').all<{ id: string; updated_at: string }>(),
      env.PUPPIES_DB.prepare('SELECT slug, updated_at FROM blog_posts WHERE status = ?').bind('published').all<{ slug: string; updated_at: string }>()
    ]);

    const baseUrl = new URL(request.url).origin;
    const sitemap = {
      static_pages: [
        { url: `${baseUrl}/`, lastmod: new Date().toISOString(), priority: 1.0 },
        { url: `${baseUrl}/about`, lastmod: new Date().toISOString(), priority: 0.8 },
        { url: `${baseUrl}/puppies`, lastmod: new Date().toISOString(), priority: 0.9 },
        { url: `${baseUrl}/litters`, lastmod: new Date().toISOString(), priority: 0.8 },
        { url: `${baseUrl}/contact`, lastmod: new Date().toISOString(), priority: 0.7 },
        { url: `${baseUrl}/health`, lastmod: new Date().toISOString(), priority: 0.6 },
        { url: `${baseUrl}/reviews`, lastmod: new Date().toISOString(), priority: 0.6 }
      ],
      puppies: (puppies.results || []).map((puppy: any) => ({
        url: `${baseUrl}/puppies/${puppy.id}`,
        lastmod: puppy.updated_at,
        priority: 0.8
      })),
      litters: (litters.results || []).map(litter => ({
        url: `${baseUrl}/litters/${litter.id}`,
        lastmod: litter.updated_at,
        priority: 0.7
      })),
      blog_posts: (blogPosts.results || []).map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastmod: post.updated_at,
        priority: 0.6
      }))
    };

    return new Response(JSON.stringify(sitemap), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    return createErrorResponse('Failed to generate sitemap', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}