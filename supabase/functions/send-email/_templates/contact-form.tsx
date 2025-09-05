import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface ContactFormEmailProps {
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export const ContactFormEmail = ({
  name,
  email,
  subject,
  message,
  submittedAt,
}: ContactFormEmailProps) => (
  <Html>
    <Head />
    <Preview>New contact form submission from {name}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://pawfect-pup-palace.com/logo.png"
            width="60"
            height="60"
            alt="Pawfect Pup Palace"
            style={logo}
          />
        </Section>
        
        <Heading style={h1}>📧 New Contact Form Submission</Heading>
        
        <Section style={alertSection}>
          <Text style={alertText}>
            You have received a new message through your website contact form.
          </Text>
        </Section>

        <Section style={detailsSection}>
          <Text style={detailsTitle}>Contact Details</Text>
          <Hr style={detailsHr} />
          
          <Section style={detailRow}>
            <Text style={detailLabel}>Name:</Text>
            <Text style={detailValue}>{name}</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailLabel}>Email:</Text>
            <Text style={detailValue}>{email}</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailLabel}>Subject:</Text>
            <Text style={detailValue}>{subject}</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailLabel}>Submitted:</Text>
            <Text style={detailValue}>{new Date(submittedAt).toLocaleString()}</Text>
          </Section>
        </Section>

        <Section style={messageSection}>
          <Text style={messageTitle}>Message</Text>
          <Hr style={messageHr} />
          <Text style={messageContent}>{message}</Text>
        </Section>

        <Section style={actionSection}>
          <Text style={actionTitle}>Recommended Actions</Text>
          <Text style={actionItem}>
            ✅ <strong>Reply promptly</strong> - Respond within 24 hours for best customer experience
          </Text>
          <Text style={actionItem}>
            📞 <strong>Follow up with a call</strong> - Consider calling for urgent inquiries
          </Text>
          <Text style={actionItem}>
            📝 <strong>Log the inquiry</strong> - Add to your CRM or customer database
          </Text>
          <Text style={actionItem}>
            🏷️ <strong>Categorize</strong> - Tag this inquiry for reporting and follow-up
          </Text>
        </Section>

        <Section style={responseTemplateSection}>
          <Text style={responseTitle}>Quick Response Template</Text>
          <Section style={templateBox}>
            <Text style={templateText}>
              Hi {name},
              <br /><br />
              Thank you for contacting Pawfect Pup Palace! We received your message about "{subject}" and appreciate your interest.
              <br /><br />
              [Your personalized response here]
              <br /><br />
              If you have any immediate questions, feel free to call us at (123) 456-7890.
              <br /><br />
              Best regards,<br />
              [Your Name]<br />
              Pawfect Pup Palace Team
            </Text>
          </Section>
        </Section>

        <Hr style={hr} />

        <Section style={footer}>
          <Text style={footerText}>
            This message was sent through the contact form on your Pawfect Pup Palace website.
          </Text>
          
          <Text style={footerText}>
            <strong>Reply-To:</strong> {email}<br />
            <strong>Time:</strong> {new Date(submittedAt).toLocaleString()}<br />
            <strong>IP:</strong> [IP tracking not implemented]
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ContactFormEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const logoSection = {
  padding: '32px 0 16px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const alertSection = {
  backgroundColor: '#dbeafe',
  border: '2px solid #93c5fd',
  borderRadius: '8px',
  margin: '32px',
  padding: '16px',
};

const alertText = {
  color: '#1e40af',
  fontSize: '16px',
  fontWeight: '500',
  textAlign: 'center' as const,
  margin: '0',
};

const detailsSection = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  margin: '32px',
  padding: '24px',
};

const detailsTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const detailsHr = {
  borderColor: '#e2e8f0',
  margin: '0 0 16px',
};

const detailRow = {
  display: 'flex',
  margin: '12px 0',
  alignItems: 'flex-start',
};

const detailLabel = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  width: '25%',
  minWidth: '80px',
};

const detailValue = {
  color: '#333',
  fontSize: '14px',
  margin: '0',
  width: '75%',
  wordBreak: 'break-word' as const,
};

const messageSection = {
  backgroundColor: '#fefefe',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  margin: '32px',
  padding: '24px',
};

const messageTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const messageHr = {
  borderColor: '#e5e7eb',
  margin: '0 0 16px',
};

const messageContent = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
};

const actionSection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  margin: '32px',
  padding: '24px',
};

const actionTitle = {
  color: '#0369a1',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const actionItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const responseTemplateSection = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  margin: '32px',
  padding: '24px',
};

const responseTitle = {
  color: '#d97706',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const templateBox = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
  padding: '16px',
};

const templateText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  fontFamily: 'monospace',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  margin: '32px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '8px 0',
  textAlign: 'center' as const,
};