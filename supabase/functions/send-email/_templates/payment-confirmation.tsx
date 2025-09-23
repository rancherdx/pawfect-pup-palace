import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

/**
 * @interface PaymentConfirmationEmailProps
 * @description Defines the props for the PaymentConfirmationEmail component.
 */
interface PaymentConfirmationEmailProps {
  customerName: string;
  puppyName: string;
  amount: number;
  transactionId: string;
  nextSteps: string[];
}

/**
 * @component PaymentConfirmationEmail
 * @description Renders the email template for a payment confirmation. This email is sent to the
 * customer after a successful payment, confirming their puppy reservation and providing
 * important next steps.
 * @param {PaymentConfirmationEmailProps} props - The props for the component.
 * @returns {JSX.Element} The rendered email template.
 */
export const PaymentConfirmationEmail = ({
  customerName,
  puppyName,
  amount,
  transactionId,
  nextSteps = [],
}: PaymentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Payment confirmed! Your reservation for {puppyName} is secure.</Preview>
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
        
        <Section style={successBanner}>
          <Text style={successIcon}>✅</Text>
          <Heading style={h1}>Payment Confirmed!</Heading>
        </Section>
        
        <Text style={text}>Hi {customerName},</Text>
        
        <Text style={text}>
          Congratulations! Your payment has been successfully processed and your reservation 
          for <strong>{puppyName}</strong> is now secure.
        </Text>

        <Section style={paymentDetails}>
          <Text style={paymentTitle}>Payment Details</Text>
          <Hr style={paymentHr} />
          
          <Section style={paymentRow}>
            <Text style={paymentLabel}>Puppy:</Text>
            <Text style={paymentValue}>{puppyName}</Text>
          </Section>
          
          <Section style={paymentRow}>
            <Text style={paymentLabel}>Amount Paid:</Text>
            <Text style={paymentValue}>${amount.toLocaleString()}</Text>
          </Section>
          
          <Section style={paymentRow}>
            <Text style={paymentLabel}>Transaction ID:</Text>
            <Text style={paymentValueMono}>{transactionId}</Text>
          </Section>
          
          <Section style={paymentRow}>
            <Text style={paymentLabel}>Date:</Text>
            <Text style={paymentValue}>{new Date().toLocaleDateString()}</Text>
          </Section>
        </Section>

        <Section style={celebrationSection}>
          <Text style={celebrationText}>
            🎉 Welcome to the Pawfect Pup Palace family! {puppyName} can't wait to meet you!
          </Text>
        </Section>

        {nextSteps.length > 0 && (
          <Section style={stepsSection}>
            <Text style={stepsTitle}>What Happens Next?</Text>
            {nextSteps.map((step, index) => (
              <Text key={index} style={stepItem}>
                {index + 1}. {step}
              </Text>
            ))}
          </Section>
        )}

        <Section style={importantSection}>
          <Text style={importantTitle}>📋 Important Information</Text>
          <Text style={importantItem}>• Keep this email as your receipt</Text>
          <Text style={importantItem}>• We'll contact you within 24 hours to schedule pickup</Text>
          <Text style={importantItem}>• Your puppy comes with a 30-day health guarantee</Text>
          <Text style={importantItem}>• All vaccinations and health records will be provided</Text>
        </Section>

        <Section style={buttonSection}>
          <Button style={button} href="https://pawfect-pup-palace.com/dashboard">
            View Your Dashboard
          </Button>
        </Section>

        <Text style={text}>
          If you have any questions or concerns, please don't hesitate to reach out to us. 
          We're here to make this transition as smooth as possible for both you and {puppyName}.
        </Text>

        <Hr style={hr} />

        <Section style={contactSection}>
          <Text style={contactTitle}>Need Help? We're Here!</Text>
          <Text style={contactInfo}>
            📧 Email: <Link href="mailto:support@pawfect-pup-palace.com" style={link}>support@pawfect-pup-palace.com</Link><br />
            📞 Phone: <Link href="tel:+1234567890" style={link}>(123) 456-7890</Link><br />
            🕒 Hours: Monday-Sunday 8AM-8PM
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Thank you for choosing Pawfect Pup Palace. We can't wait to see you and {puppyName} together!
          </Text>
          
          <Text style={footerAddress}>
            Pawfect Pup Palace<br />
            123 Puppy Lane<br />
            Dog City, DC 12345
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default PaymentConfirmationEmail;

/**
 * @description A collection of style objects used for inline styling of the email components.
 * This approach is used for maximum compatibility across different email clients.
 */
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

const successBanner = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #bbf7d0',
  borderRadius: '12px',
  margin: '16px 32px 32px',
  padding: '24px',
  textAlign: 'center' as const,
};

const successIcon = {
  fontSize: '48px',
  margin: '0 0 16px',
};

const h1 = {
  color: '#16a34a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 32px',
};

const paymentDetails = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  margin: '32px',
  padding: '24px',
};

const paymentTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const paymentHr = {
  borderColor: '#e2e8f0',
  margin: '0 0 16px',
};

const paymentRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '8px 0',
};

const paymentLabel = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
  width: '40%',
};

const paymentValue = {
  color: '#333',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
  textAlign: 'right' as const,
  width: '60%',
};

const paymentValueMono = {
  ...paymentValue,
  fontFamily: 'monospace',
  fontSize: '12px',
};

const celebrationSection = {
  backgroundColor: '#fef7f0',
  border: '2px solid #fed7aa',
  borderRadius: '8px',
  margin: '32px',
  padding: '20px',
};

const celebrationText = {
  color: '#ea580c',
  fontSize: '18px',
  fontWeight: '500',
  textAlign: 'center' as const,
  margin: '0',
};

const stepsSection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  margin: '32px',
  padding: '24px',
};

const stepsTitle = {
  color: '#0369a1',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const stepItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
};

const importantSection = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  margin: '32px',
  padding: '24px',
};

const importantTitle = {
  color: '#d97706',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const importantItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '6px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  fontWeight: 'bold',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const contactSection = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  margin: '32px',
  padding: '24px',
  textAlign: 'center' as const,
};

const contactTitle = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const contactInfo = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const link = {
  color: '#dc2626',
  textDecoration: 'underline',
};

const footer = {
  margin: '32px',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const footerAddress = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
};