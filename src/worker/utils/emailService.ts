import type { Env } from '../env';

// Define the structure for the MailChannels API request
interface MailChannelsRequestBody {
  personalizations: {
    to: { email: string; name?: string }[];
    dkim_domain?: string;
    dkim_selector?: string;
    dkim_private_key?: string;
  }[];
  from: {
    email: string;
    name: string;
  };
  reply_to?: {
    email: string;
    name: string;
  };
  subject: string;
  content: {
    type: 'text/html' | 'text/plain';
    value: string;
  }[];
}

/**
 * Sends an email using the MailChannels API.
 *
 * @param env - The worker environment containing secrets.
 * @param to - The recipient's email address.
 * @param subject - The email subject.
 * @param htmlBody - The HTML content of the email.
 * @param replyTo - Optional "reply-to" email address.
 * @returns An object indicating success or failure and a message.
 */
export async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  htmlBody: string,
  replyTo?: string,
): Promise<{ success: boolean; message: string }> {
  if (!env.MAILCHANNELS_API_KEY) {
    console.error('MAILCHANNELS_API_KEY is not set.');
    return {
      success: false,
      message: 'Email sending failed: MailChannels API key not configured.',
    };
  }

  const requestBody: MailChannelsRequestBody = {
    personalizations: [
      {
        to: [{ email: to }],
      },
    ],
    from: {
      email: 'noreply@gdspuppiesdeluxe.com', // This should be a domain you are allowed to send from
      name: 'GDS Puppies',
    },
    subject: subject,
    content: [
      {
        type: 'text/html',
        value: htmlBody,
      },
    ],
  };

  if (replyTo) {
    requestBody.reply_to = {
      email: replyTo,
      name: 'GDS Puppies Support', // Or a more specific name
    };
  }

  // Add DKIM signing if the private key is available.
  if (env.DKIM_PRIVATE_KEY && env.DKIM_DOMAIN) {
    requestBody.personalizations[0].dkim_domain = env.DKIM_DOMAIN;
    requestBody.personalizations[0].dkim_selector = "mailchannels";
    requestBody.personalizations[0].dkim_private_key = env.DKIM_PRIVATE_KEY;
  }


  try {
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': env.MAILCHANNELS_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 202) {
      console.log(`Email sent successfully to: ${to}`);
      return { success: true, message: 'Email sent successfully.' };
    } else {
      const errorBody = await response.text();
      console.error(`Failed to send email. Status: ${response.status}, Body: ${errorBody}`);
      return {
        success: false,
        message: `Failed to send email. Status: ${response.status}`,
      };
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'An unexpected error occurred while sending the email.' };
  }
}


interface EmailTemplate {
    subject_template: string;
    html_body_template: string;
}

interface SendTemplatedEmailResult {
  success: boolean;
  message: string;
  templateFound: boolean;
  emailSentResult?: { success: boolean; message: string };
}

/**
 * Fetches an email template, populates it with data, and sends it using the sendEmail function.
 *
 * @param env - The worker environment.
 * @param to - The recipient's email address.
 * @param templateName - The name of the email template to use.
 * @param data - An object containing data to populate placeholders in the template.
 * @param replyTo - Optional "reply-to" email address.
 * @returns An object indicating the outcome of the process.
 */
export async function sendTemplatedEmail(
  env: Env,
  to: string,
  templateName: string,
  data: Record<string, unknown>,
  replyTo?: string,
): Promise<SendTemplatedEmailResult> {
  let template: EmailTemplate | null = null;

  try {
    const stmt = env.PUPPIES_DB.prepare(
      "SELECT subject_template, html_body_template FROM email_templates WHERE template_name = ?"
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

  let populatedSubject = template.subject_template;
  let populatedHtmlBody = template.html_body_template;

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      populatedSubject = populatedSubject.replace(placeholder, String(data[key]));
      populatedHtmlBody = populatedHtmlBody.replace(placeholder, String(data[key]));
    }
  }

  const emailSentResult = await sendEmail(env, to, populatedSubject, populatedHtmlBody, replyTo);

  return {
    success: emailSentResult.success,
    message: emailSentResult.success
      ? `Templated email "${templateName}" sent successfully to ${to}.`
      : `Failed to send templated email "${templateName}" to ${to}. Reason: ${emailSentResult.message}`,
    templateFound: true,
    emailSentResult: emailSentResult,
  };
}
