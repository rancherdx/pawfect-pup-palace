import type { Env } from '../env';

/**
 * Retrieves the SendGrid API key from the database.
 * In a real application, this function would also handle decryption of the API key.
 *
 * @param env - The worker environment containing the database binding.
 * @returns The SendGrid API key as a string, or null if not found, not active, or an error occurs.
 */
export async function getSendGridApiKey(env: Env): Promise<string | null> {
  try {
    const stmt = env.PUPPIES_DB.prepare(
      "SELECT api_key FROM third_party_integrations WHERE service_name = 'SendGrid' AND is_active = 1"
    );
    const result = await stmt.first<{ api_key: string | null }>();

    if (result && result.api_key) {
      console.log("SendGrid configuration found and active. Simulating API key retrieval.");
      return 'dummy-sendgrid-api-key-from-db';
    } else if (result && !result.api_key) {
      console.warn("SendGrid integration is active, but API key is missing in the database.");
      return null;
    } else {
      console.warn("SendGrid API key is not configured or is inactive in the database.");
      return null;
    }
  } catch (error) {
    console.error("Database error while trying to retrieve SendGrid API key:", error);
    return null;
  }
}

/**
 * Simulates sending an email.
 * In a real application, this function would make an HTTP request to the SendGrid API.
 *
 * @param env - The worker environment.
 * @param to - The recipient's email address.
 * @param subject - The email subject.
 * @param htmlBody - The HTML content of the email.
 * @returns An object indicating success or failure, a message, API key used, and a simulated message provider ID.
 */
export async function sendEmailPlaceholder(
  env: Env,
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; message: string; apiKeyUsed: string | null; messageProviderId: string | null }> {
  const apiKey = await getSendGridApiKey(env);
  const simulatedMessageId = `simulated_${crypto.randomUUID()}@placeholder.email`;

  if (!apiKey) {
    return {
      success: false,
      message: "Email sending failed: SendGrid API key not configured or inactive.",
      apiKeyUsed: null,
      messageProviderId: null,
    };
  }

  console.log(`Simulating email send to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Using SendGrid API key: ${apiKey}`);
  console.log(`Email HTML Body (first 100 chars): ${htmlBody.substring(0, 100)}...`);
  console.log(`Simulated Message Provider ID: ${simulatedMessageId}`);

  // In a real scenario, the response from the email provider (e.g., SendGrid) would contain the actual message ID.
  return {
    success: true,
    message: "Email sent successfully (simulated).",
    apiKeyUsed: apiKey,
    messageProviderId: simulatedMessageId,
  };
}

interface EmailTemplate {
  subject: string;
  html_body: string;
}

interface SendTemplatedEmailResult {
  success: boolean;
  message: string;
  templateFound: boolean;
  emailSentResult?: { success: boolean; message: string; apiKeyUsed: string | null; messageProviderId: string | null };
  dbLogResult?: { emailMessageId?: string; conversationId?: string; error?: string };
}

/**
 * Fetches an email template, populates it, sends it, and logs it to the database.
 *
 * @param env - The worker environment.
 * @param to - The recipient's email address (contact_email).
 * @param templateNameOrSubject - The name of the email template OR the actual subject if not using a template.
 * @param dataOrBodyHtml - An object for template data OR the HTML body if not using a template.
 * @param optionalParams - Optional parameters including userId, conversationId, and textBody.
 * @returns An object indicating the outcome of the process.
 */
export async function sendTemplatedEmail(
  env: Env,
  to: string, // This is the contact_email
  templateNameOrSubject: string,
  dataOrBodyHtml: Record<string, any> | string, // Data for template, or HTML body string
  optionalParams?: {
    userId?: string | null; // Associated internal user, if any
    conversationId?: string | null; // Existing conversation ID, if replying or part of a thread
    textBody?: string | null; // Plain text version of the email
    isTemplate: boolean; // Flag to differentiate template name from direct subject/body
  }
): Promise<SendTemplatedEmailResult> {
  let populatedSubject: string;
  let populatedHtmlBody: string;
  let populatedTextBody: string | null = optionalParams?.textBody || null;
  let templateFound = true; // Assume true if not using template

  if (optionalParams?.isTemplate) {
    const templateName = templateNameOrSubject;
    const data = dataOrBodyHtml as Record<string, any>;
    let template: EmailTemplate | null = null;
    try {
      const stmt = env.PUPPIES_DB.prepare(
        "SELECT subject, html_body FROM email_templates WHERE name = ?"
      );
      template = await stmt.bind(templateName).first<EmailTemplate>();
    } catch (dbError) {
      console.error(`Database error fetching email template "${templateName}":`, dbError);
      return {
        success: false,
        message: `Database error fetching template "${templateName}".`,
        templateFound: false,
      };
    }

    if (!template) {
      console.warn(`Email template "${templateName}" not found in database.`);
      return {
        success: false,
        message: `Email template "${templateName}" not found.`,
        templateFound: false,
      };
    }

    populatedSubject = template.subject;
    populatedHtmlBody = template.html_body;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        populatedSubject = populatedSubject.replace(placeholder, String(data[key]));
        populatedHtmlBody = populatedHtmlBody.replace(placeholder, String(data[key]));
        if (populatedTextBody) { // Also populate text body if provided as a template
            populatedTextBody = populatedTextBody.replace(placeholder, String(data[key]));
        }
      }
    }
  } else {
    populatedSubject = templateNameOrSubject;
    populatedHtmlBody = dataOrBodyHtml as string;
    templateFound = false; // Not using a DB template in this case
  }


  const emailSentResult = await sendEmailPlaceholder(env, to, populatedSubject, populatedHtmlBody);

  // Log to database if email sending was successful (or simulated successfully)
  let dbLogResult: { emailMessageId?: string; conversationId?: string; error?: string } = {};
  if (emailSentResult.success) {
    try {
      const db = env.PUPPIES_DB;
      const newEmailMessageId = crypto.randomUUID();
      const conversationIdToUse = optionalParams?.conversationId || crypto.randomUUID();
      const now = Math.floor(Date.now() / 1000);

      const emailMessageStmt = db.prepare(
        `INSERT INTO email_messages (id, conversation_id, user_id, contact_email, direction, subject, body_html, body_text, status, message_provider_id, sent_at, created_at)
         VALUES (?, ?, ?, ?, 'outbound', ?, ?, ?, 'sent', ?, ?, ?)`
      ).bind(
        newEmailMessageId,
        conversationIdToUse,
        optionalParams?.userId || null,
        to, // contact_email
        populatedSubject,
        populatedHtmlBody,
        populatedTextBody, // Can be null
        emailSentResult.messageProviderId,
        now, // sent_at
        now  // created_at
      );

      // Upsert logic for email_conversations table
      const conversationUpsertStmt = db.prepare(
        `INSERT INTO email_conversations (id, user_id, contact_email, last_message_at, subject, status)
         VALUES (?, ?, ?, ?, ?, 'open')
         ON CONFLICT(id) DO UPDATE SET
           last_message_at = excluded.last_message_at,
           subject = CASE WHEN status = 'closed' THEN excluded.subject ELSE subject END, -- Re-open subject if it was closed
           status = 'open'`
           // Note: More complex subject handling (e.g. "Re: old_subject") might be needed if desired.
           // D1's ON CONFLICT doesn't support complex CASE statements on subject like that directly referencing old values easily.
           // Simpler: just update subject and last_message_at. Or handle subject logic before this SQL.
      ).bind(
        conversationIdToUse,
        optionalParams?.userId || null,
        to, // contact_email
        now, // last_message_at
        populatedSubject // subject
      );

      await db.batch([emailMessageStmt, conversationUpsertStmt]);

      dbLogResult = { emailMessageId: newEmailMessageId, conversationId: conversationIdToUse };
      console.log(`Outbound email logged to DB. Message ID: ${newEmailMessageId}, Conversation ID: ${conversationIdToUse}`);

    } catch (dbError: any) {
      console.error("Failed to log sent email to database:", dbError);
      dbLogResult = { error: dbError.message };
      // Non-fatal for the email sending itself, but indicates a logging issue.
    }
  }

  const finalMessage = optionalParams?.isTemplate
    ? (emailSentResult.success ? `Templated email "${templateNameOrSubject}" sent and logged.` : `Failed to send templated email "${templateNameOrSubject}". Reason: ${emailSentResult.message}`)
    : (emailSentResult.success ? `Email sent and logged.` : `Failed to send email. Reason: ${emailSentResult.message}`);

  return {
    success: emailSentResult.success,
    message: finalMessage,
    templateFound: templateFound, // This is true if isTemplate was true and template was found
    emailSentResult: emailSentResult,
    dbLogResult: dbLogResult,
  };
}
