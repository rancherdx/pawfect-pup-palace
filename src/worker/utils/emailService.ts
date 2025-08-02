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
 * @returns An object indicating success or failure, a message, and the API key used (if any).
 * Use: Record<string, unknown> or define a specific interface if known.
 */
export async function sendEmailPlaceholder(
  env: Env,
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; message: string; apiKeyUsed: string | null }> {
  const apiKey = await getSendGridApiKey(env);

  if (!apiKey) {
    return {
      success: false,
      message: "Email sending failed: SendGrid API key not configured or inactive.",
      apiKeyUsed: null,
    };
  }

  console.log(`Simulating email send to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Using SendGrid API key: ${apiKey}`);
  console.log(`Email HTML Body (first 100 chars): ${htmlBody.substring(0, 100)}...`);

  return {
    success: true,
    message: "Email sent successfully (simulated).",
    apiKeyUsed: apiKey,
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
  emailSentResult?: { success: boolean; message: string; apiKeyUsed: string | null };
}

/**
 * Fetches an email template, populates it with data, and "sends" it using sendEmailPlaceholder.
 *
 * @param env - The worker environment.
 * @param to - The recipient's email address.
 * @param templateName - The name of the email template to use.
 * @param data - An object containing data to populate placeholders in the template.
 * @returns An object indicating the outcome of the process.
 */
export async function sendTemplatedEmail(
  env: Env,
  to: string,
  templateName: string,
  data: Record<string, unknown>
): Promise<SendTemplatedEmailResult> {
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

  let populatedSubject = template.subject;
  let populatedHtmlBody = template.html_body;

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      populatedSubject = populatedSubject.replace(placeholder, String(data[key]));
      populatedHtmlBody = populatedHtmlBody.replace(placeholder, String(data[key]));
    }
  }

  const emailSentResult = await sendEmailPlaceholder(env, to, populatedSubject, populatedHtmlBody);

  return {
    success: emailSentResult.success,
    message: emailSentResult.success
      ? `Templated email "${templateName}" sent successfully to ${to} (simulated).`
      : `Failed to send templated email "${templateName}" to ${to}. Reason: ${emailSentResult.message}`,
    templateFound: true,
    emailSentResult: emailSentResult,
  };
}
