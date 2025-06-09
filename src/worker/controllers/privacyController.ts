import { corsHeaders } from '../utils/cors';
import type { Env } from '../env';
import { sendTemplatedEmail } from '../utils/emailService'; // Added for email notifications

// Helper for consistent error responses
function createErrorResponse(message: string, details: string | string[] | null = null, status: number): Response {
  return new Response(
    JSON.stringify({ error: message, details: details }),
    { status: status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

interface DataDeletionRequestBody {
  name?: string;
  email: string;
  account_creation_timeframe?: string;
  puppy_ids?: string;
  additional_details: string;
}

export async function requestDataDeletion(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return createErrorResponse('Method not allowed', 'Only POST requests are accepted.', 405);
  }

  try {
    const body = await request.json() as DataDeletionRequestBody;

    const validationErrors: string[] = [];

    if (!body.email) {
      validationErrors.push('Email is required.');
    } else if (typeof body.email !== 'string' || !/\S+@\S+\.\S+/.test(body.email) || body.email.length > 255) {
      validationErrors.push('Valid email is required and must be less than 255 characters.');
    }

    if (body.name && (typeof body.name !== 'string' || body.name.length > 255)) {
      validationErrors.push('Name must be a string and less than 255 characters.');
    }

    // Require email AND additional_details. Name is optional.
    if (!body.additional_details && !body.name) {
        validationErrors.push('Either Name or Additional Details must be provided along with Email to help identify your data.');
    }

    if (body.additional_details && (typeof body.additional_details !== 'string' || body.additional_details.length > 2000)) {
        validationErrors.push('Additional details must be a string and less than 2000 characters.');
    }

    if (body.account_creation_timeframe && (typeof body.account_creation_timeframe !== 'string' || body.account_creation_timeframe.length > 100)) {
      validationErrors.push('Account creation timeframe must be a string and less than 100 characters.');
    }

    if (body.puppy_ids && (typeof body.puppy_ids !== 'string' || body.puppy_ids.length > 500)) {
      validationErrors.push('Puppy IDs field must be a string and less than 500 characters.');
    }

    if (validationErrors.length > 0) {
      return createErrorResponse('Invalid request data.', validationErrors, 400);
    }

    const id = crypto.randomUUID();
    const requested_at = new Date().toISOString();

    await env.PUPPIES_DB.prepare(
      `INSERT INTO data_deletion_requests (id, name, email, account_creation_timeframe, puppy_ids, additional_details, requested_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      body.name || null,
      body.email,
      body.account_creation_timeframe || null,
      body.puppy_ids || null,
      body.additional_details || null,
      requested_at,
      'pending'
    )
    .run();

    // Send email notification to admin
    const adminEmail = env.ADMIN_EMAIL || 'admin@example.com'; // Fallback if env var not set
    if (!env.ADMIN_EMAIL) {
      console.warn("ADMIN_EMAIL environment variable is not set. Skipping data deletion request email notification. Request ID:", id);
    }

    // Construct admin link (assuming a base URL for the admin dashboard)
    // TODO: The base URL for the admin dashboard should ideally come from an environment variable or config.
    const adminBaseUrl = env.ADMIN_DASHBOARD_URL || 'https://admin.example.com'; // Replace with actual admin URL or env var
    const adminLink = `${adminBaseUrl}/data-deletion-requests?id=${id}`;

    const emailPayload = {
      requestId: id,
      name: body.name || 'N/A',
      email: body.email,
      account_creation_timeframe: body.account_creation_timeframe || 'N/A',
      puppy_ids: body.puppy_ids || 'N/A',
      additional_details: body.additional_details || 'N/A',
      admin_link: adminLink,
    };

    // Use the new template 'admin_data_deletion_notification'
    sendTemplatedEmail(env, adminEmail, 'admin_data_deletion_notification', emailPayload)
      .then(emailResult => {
        if (emailResult.success) {
          console.log(`Admin notification email sent successfully for data deletion request ${id}`);
        } else {
          console.error(`Failed to send admin notification email for data deletion request ${id}: ${emailResult.message}`);
        }
      })
      .catch(err => {
        console.error(`Error sending admin notification email for data deletion request ${id}:`, err);
      });

    return new Response(
      JSON.stringify({ success: true, message: 'Your data deletion request has been submitted successfully. An administrator will review it shortly.', requestId: id }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error processing data deletion request:', error);
    if (error instanceof SyntaxError) {
        return createErrorResponse('Invalid JSON payload.', null, 400);
    }
    return createErrorResponse('Failed to submit data deletion request.', error.message || 'An internal error occurred.', 500);
  }
}
