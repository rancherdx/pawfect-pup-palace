import type { Env } from '../env';
import { corsHeaders } from '../utils/cors';

// Consistent error response utility
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author_name?: string;
  tags?: string; // Stored as JSON string in database
  category?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface BlogPostCreateData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  author_name?: string;
  tags?: string[];
  category?: string;
  status?: 'draft' | 'published';
}

// Admin: List all blog posts
export async function listAllBlogPosts(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const status = url.searchParams.get('status'); // 'draft', 'published', or null for all
  const offset = (page - 1) * limit;

  if (page < 1) return createErrorResponse("Bad Request", "Page number must be 1 or greater.", 400);
  if (limit < 1 || limit > 100) return createErrorResponse("Bad Request", "Limit must be between 1 and 100.", 400);

  try {
    let whereClauses = ["1 = 1"];
    const bindings: any[] = [];

    if (status && (status === 'draft' || status === 'published')) {
      whereClauses.push("status = ?");
      bindings.push(status);
    }

    const whereCondition = `WHERE ${whereClauses.join(' AND ')}`;
    
    const postsQuery = env.PUPPIES_DB.prepare(
      `SELECT id, title, slug, excerpt, author_name, category, status, published_at, created_at, updated_at 
       FROM blog_posts ${whereCondition} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...bindings, limit, offset);

    const countQuery = env.PUPPIES_DB.prepare(
      `SELECT COUNT(*) as total FROM blog_posts ${whereCondition}`
    ).bind(...bindings);

    const [postsResults, totalResult] = await Promise.all([
      postsQuery.all<Omit<BlogPost, 'content' | 'featured_image_url' | 'tags'>>(),
      countQuery.first<{ total: number }>()
    ]);

    const posts = postsResults.results || [];
    const total = totalResult?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return new Response(JSON.stringify({
      posts,
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
    console.error('Error listing blog posts:', error);
    return createErrorResponse('Failed to list blog posts', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Get blog post by ID
export async function getBlogPostById(request: Request, env: Env, postId: string): Promise<Response> {
  if (!postId) {
    return createErrorResponse("Bad Request", "Post ID is required.", 400);
  }

  try {
    const post = await env.PUPPIES_DB.prepare(
      'SELECT * FROM blog_posts WHERE id = ?'
    ).bind(postId).first<BlogPost>();

    if (!post) {
      return createErrorResponse("Not Found", `Blog post with ID ${postId} not found.`, 404);
    }

    // Parse tags if they exist
    let parsedTags = null;
    if (post.tags) {
      try {
        parsedTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
      } catch (e) {
        console.error('Error parsing tags for post', postId, e);
        parsedTags = [];
      }
    }

    return new Response(JSON.stringify({
      ...post,
      tags: parsedTags
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error fetching blog post ${postId}:`, error);
    return createErrorResponse('Failed to fetch blog post', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Create blog post
export async function createBlogPost(request: Request, env: Env, authResult: any): Promise<Response> {
  try {
    const postData = await request.json() as BlogPostCreateData;

    // Validation
    if (!postData.title || !postData.slug || !postData.content) {
      return createErrorResponse("Validation Error", "Title, slug, and content are required.", 400);
    }

    // Check if slug already exists
    const existingPost = await env.PUPPIES_DB.prepare(
      'SELECT id FROM blog_posts WHERE slug = ?'
    ).bind(postData.slug).first();

    if (existingPost) {
      return createErrorResponse("Validation Error", "A post with this slug already exists.", 400);
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const status = postData.status || 'draft';
    const published_at = status === 'published' ? now : null;
    const tags = postData.tags ? JSON.stringify(postData.tags) : null;

    await env.PUPPIES_DB.prepare(
      `INSERT INTO blog_posts (id, title, slug, content, excerpt, featured_image_url, author_name, tags, category, status, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id, postData.title, postData.slug, postData.content, postData.excerpt || null,
      postData.featured_image_url || null, postData.author_name || null, tags,
      postData.category || null, status, published_at, now, now
    ).run();

    const newPost = await env.PUPPIES_DB.prepare(
      'SELECT * FROM blog_posts WHERE id = ?'
    ).bind(id).first<BlogPost>();

    return new Response(JSON.stringify({
      ...newPost,
      tags: newPost?.tags ? JSON.parse(newPost.tags) : null
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    if (error instanceof SyntaxError) {
      return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    return createErrorResponse('Failed to create blog post', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Update blog post
export async function updateBlogPost(request: Request, env: Env, postId: string, authResult: any): Promise<Response> {
  if (!postId) {
    return createErrorResponse("Bad Request", "Post ID is required.", 400);
  }

  try {
    const updateData = await request.json() as Partial<BlogPostCreateData>;
    
    // Check if post exists
    const existingPost = await env.PUPPIES_DB.prepare(
      'SELECT id, slug FROM blog_posts WHERE id = ?'
    ).bind(postId).first<{ id: string; slug: string }>();

    if (!existingPost) {
      return createErrorResponse("Not Found", `Blog post with ID ${postId} not found.`, 404);
    }

    // If updating slug, check for conflicts
    if (updateData.slug && updateData.slug !== existingPost.slug) {
      const slugConflict = await env.PUPPIES_DB.prepare(
        'SELECT id FROM blog_posts WHERE slug = ? AND id != ?'
      ).bind(updateData.slug, postId).first();

      if (slugConflict) {
        return createErrorResponse("Validation Error", "A post with this slug already exists.", 400);
      }
    }

    const updates: Record<string, any> = {};
    const allowedFields = ['title', 'slug', 'content', 'excerpt', 'featured_image_url', 'author_name', 'tags', 'category', 'status'];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          if (field === 'tags') {
            updates[field] = updateData[field] ? JSON.stringify(updateData[field]) : null;
          } else {
            updates[field] = updateData[field];
          }
        }
      }

    // Handle published_at for status changes
    if (updateData.status === 'published') {
      const currentPost = await env.PUPPIES_DB.prepare(
        'SELECT status, published_at FROM blog_posts WHERE id = ?'
      ).bind(postId).first<{ status: string; published_at: string | null }>();

      if (currentPost?.status !== 'published' || !currentPost.published_at) {
        updates.published_at = new Date().toISOString();
      }
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse("Bad Request", "No update fields provided.", 400);
    }

    updates.updated_at = new Date().toISOString();

    const setClauses = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), postId];

    await env.PUPPIES_DB.prepare(`UPDATE blog_posts SET ${setClauses} WHERE id = ?`).bind(...values).run();

    const updatedPost = await env.PUPPIES_DB.prepare(
      'SELECT * FROM blog_posts WHERE id = ?'
    ).bind(postId).first<BlogPost>();

    if (!updatedPost) {
      return createErrorResponse("Internal Server Error", "Failed to retrieve updated post.", 500);
    }

    return new Response(JSON.stringify({
      ...updatedPost,
      tags: updatedPost?.tags ? JSON.parse(updatedPost.tags) : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error updating blog post ${postId}:`, error);
    if (error instanceof SyntaxError) {
      return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    return createErrorResponse('Failed to update blog post', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}

// Admin: Delete blog post
export async function deleteBlogPost(request: Request, env: Env, postId: string, authResult: any): Promise<Response> {
  if (!postId) {
    return createErrorResponse("Bad Request", "Post ID is required.", 400);
  }

  try {
    const existingPost = await env.PUPPIES_DB.prepare(
      'SELECT id FROM blog_posts WHERE id = ?'
    ).bind(postId).first();

    if (!existingPost) {
      return createErrorResponse("Not Found", `Blog post with ID ${postId} not found.`, 404);
    }

    await env.PUPPIES_DB.prepare('DELETE FROM blog_posts WHERE id = ?').bind(postId).run();

    return new Response(JSON.stringify({ message: 'Blog post deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`Error deleting blog post ${postId}:`, error);
    return createErrorResponse('Failed to delete blog post', error instanceof Error ? error.message : 'Unknown error', 500);
  }
}