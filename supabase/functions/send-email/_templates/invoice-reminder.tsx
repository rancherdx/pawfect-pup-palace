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

interface InvoiceReminderEmailProps {
  customerName: string;
  puppyName: string;
  remainingBalance: number;
  dueDate: string;
  daysUntilDue: number;
  invoiceUrl?: string;
}

export const InvoiceReminderEmail = ({
  customerName,
  puppyName,
  remainingBalance,
  dueDate,
  daysUntilDue,
  invoiceUrl,
}: InvoiceReminderEmailProps) => (
  <Html>
    <Head />
    <Preview>Payment reminder for {puppyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Payment Reminder</Heading>
        <Text style={text}>Hi {customerName},</Text>
        <Text style={text}>
          This is a friendly reminder that your remaining balance for <strong>{puppyName}</strong> is 
          due {daysUntilDue > 0 ? `in ${daysUntilDue} days` : 'today'}.
        </Text>
        
        <Section style={reminderBox}>
          <Text style={reminderTitle}>Payment Details</Text>
          <Text style={reminderDetail}>Puppy: <strong>{puppyName}</strong></Text>
          <Text style={reminderDetail}>Remaining Balance: <strong>${remainingBalance.toFixed(2)}</strong></Text>
          <Text style={reminderDetail}>Due Date: <strong>{dueDate}</strong></Text>
          {daysUntilDue <= 3 && daysUntilDue > 0 && (
            <Text style={{ ...reminderDetail, color: '#f59e0b', fontWeight: 'bold' }}>
              ⚠️ Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}!
            </Text>
          )}
          {daysUntilDue <= 0 && (
            <Text style={{ ...reminderDetail, color: '#DC2626', fontWeight: 'bold' }}>
              ⚠️ Payment is due today!
            </Text>
          )}
        </Section>

        {invoiceUrl && (
          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Link href={invoiceUrl} style={button}>
              Pay Now
            </Link>
          </Section>
        )}

        <Text style={text}>
          Please ensure payment is received by {dueDate} to secure your puppy. 
          If you need to arrange a different payment schedule, please contact us as soon as possible.
        </Text>

        <Text style={text}>
          You can pay online using the button above, or contact us for alternative payment methods.
        </Text>

        <Text style={footer}>
          Thank you,<br />
          The GDS Puppies Team<br />
          <Link href="https://gdspuppies.com" style={link}>
            www.gdspuppies.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default InvoiceReminderEmail;

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

const reminderBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 48px',
  borderLeft: '4px solid #f59e0b',
};

const reminderTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 16px 0',
};

const reminderDetail = {
  fontSize: '16px',
  color: '#78350f',
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