import type { Env } from '../env';
import { corsHeaders } from '../utils/cors'; // Assuming corsHeaders for error responses

// Consistent error response utility
function createErrorResponse(message: string, details: string | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface EmailTemplateListItem {
  id: string;
  name: string;
  subject: string;
  is_editable_in_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailTemplateDetail extends EmailTemplateListItem {
  html_body: string;
}

// Strips html_body for list views
function toEmailTemplateListItem(template: any): EmailTemplateListItem {
    return {
        id: template.id,
        name: template.name,
        subject: template.subject,
        is_editable_in_admin: Boolean(template.is_editable_in_admin),
        created_at: template.created_at,
        updated_at: template.updated_at,
    };
}

function toEmailTemplateDetail(template: any): EmailTemplateDetail {
    return {
        ...toEmailTemplateListItem(template),
        html_body: template.html_body,
    };
}


export async function listEmailTemplates(request: Request, env: Env): Promise<Response> {
  try {
    const { results } = await env.PUPPIES_DB.prepare(
      "SELECT id, name, subject, is_editable_in_admin, created_at, updated_at FROM email_templates ORDER BY name"
    ).all<Omit<EmailTemplateDetail, 'html_body'>>(); // DB returns 0/1 for boolean

    if (!results) {
        return new Response(JSON.stringify([]), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const templates = results.map(toEmailTemplateListItem);

    return new Response(JSON.stringify(templates), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error listing email templates:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Failed to list email templates", errorMessage, 500);
  }
}

export async function getEmailTemplateById(request: Request, env: Env, templateId: string): Promise<Response> {
  if (!templateId) {
    return createErrorResponse("Bad Request", "Template ID is required.", 400);
  }
  try {
    const template = await env.PUPPIES_DB.prepare(
      "SELECT id, name, subject, html_body, is_editable_in_admin, created_at, updated_at FROM email_templates WHERE id = ?"
    ).bind(templateId).first<EmailTemplateDetail>();

    if (!template) {
      return createErrorResponse("Not Found", `Email template with ID ${templateId} not found.`, 404);
    }

    return new Response(JSON.stringify(toEmailTemplateDetail(template)), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error fetching email template ${templateId}:`, error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Failed to fetch email template", errorMessage, 500);
  }
}

export async function updateEmailTemplate(request: Request, env: Env, templateId: string): Promise<Response> {
  if (!templateId) {
    return createErrorResponse("Bad Request", "Template ID is required.", 400);
  }
  try {
    const body = await request.json() as { subject?: string; html_body?: string };

    if (!body.subject || typeof body.subject !== 'string' || body.subject.trim() === '') {
      return createErrorResponse("Validation Error", "Subject is required and must be a non-empty string.", 400);
    }
    if (!body.html_body || typeof body.html_body !== 'string' || body.html_body.trim() === '') {
      return createErrorResponse("Validation Error", "HTML body is required and must be a non-empty string.", 400);
    }

    const template = await env.PUPPIES_DB.prepare(
      "SELECT id, name, is_editable_in_admin FROM email_templates WHERE id = ?"
    ).bind(templateId).first<{ id: string; name: string; is_editable_in_admin: number }>();

    if (!template) {
      return createErrorResponse("Not Found", `Email template with ID ${templateId} not found.`, 404);
    }

    if (!template.is_editable_in_admin) {
      return createErrorResponse(
        "Forbidden",
        `System template "${template.name}" (ID: ${templateId}) cannot be modified.`,
        403
      );
    }

    const now = new Date().toISOString();
    await env.PUPPIES_DB.prepare(
      "UPDATE email_templates SET subject = ?, html_body = ?, updated_at = ? WHERE id = ?"
    ).bind(body.subject, body.html_body, now, templateId).run();

    const updatedTemplate = await env.PUPPIES_DB.prepare(
        "SELECT id, name, subject, html_body, is_editable_in_admin, created_at, updated_at FROM email_templates WHERE id = ?"
    ).bind(templateId).first<EmailTemplateDetail>();

    if(!updatedTemplate){
         return createErrorResponse("Internal Server Error", "Failed to retrieve updated template after update.", 500);
    }

    return new Response(JSON.stringify(toEmailTemplateDetail(updatedTemplate)), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error updating email template ${templateId}:`, error);
     if (error instanceof SyntaxError) {
        return createErrorResponse("Invalid request body", "Malformed JSON.", 400);
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Failed to update email template", errorMessage, 500);
  }
}
