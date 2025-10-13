import React from 'npm:react@18.3.1';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';

interface DepositPlacedEmailProps {
  customerName: string;
  puppyName: string;
  depositAmount: number;
  remainingBalance: number;
  dueDate: string;
  invoiceUrl?: string;
}

export const DepositPlacedEmail = ({
  customerName,
  puppyName,
  depositAmount,
  remainingBalance,
  dueDate,
  invoiceUrl,
}: DepositPlacedEmailProps) => (
  <Html>
    <Head />
    <Preview>Deposit received for {puppyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Deposit Received!</Heading>
        <Text style={text}>Hi {customerName},</Text>
        <Text style={text}>
          Thank you for placing your deposit on <strong>{puppyName}</strong>! 
          We're thrilled to have you join our GDS Puppies family.
        </Text>
        
        <Section style={depositBox}>
          <Text style={depositTitle}>Payment Summary</Text>
          <Text style={depositDetail}>Deposit Paid: <strong>${depositAmount.toFixed(2)}</strong></Text>
          <Text style={depositDetail}>Remaining Balance: <strong>${remainingBalance.toFixed(2)}</strong></Text>
          <Text style={depositDetail}>Balance Due By: <strong>{dueDate}</strong></Text>
        </Section>

        {invoiceUrl && (
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Link href={invoiceUrl} style={button}>
              View Invoice
            </Link>
          </Section>
        )}

        <Text style={text}>
          Your puppy is now reserved for you! The remaining balance is due by {dueDate}. 
          We'll send you reminders as the date approaches.
        </Text>

        <Text style={text}>
          If you have any questions, feel free to reply to this email or contact us directly.
        </Text>

        <Text style={footer}>
          Best regards,<br />
          The GDS Puppies Team<br />
          <Link href="https://gdspuppies.com" style={link}>
            www.gdspuppies.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default DepositPlacedEmail;

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

const h1 = {
  color: '#DC2626',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 48px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
  padding: '0 48px',
};

const depositBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 48px',
};

const depositTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px 0',
};

const depositDetail = {
  fontSize: '16px',
  color: '#333',
  margin: '8px 0',
};

const button = {
  backgroundColor: '#DC2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const link = {
  color: '#DC2626',
  textDecoration: 'underline',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '32px 0',
  padding: '0 48px',
};