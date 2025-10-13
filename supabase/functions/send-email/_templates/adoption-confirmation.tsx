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

interface AdoptionConfirmationEmailProps {
  customerName: string;
  puppyName: string;
  breed: string;
  pickupDate: string;
  totalPaid: number;
}

export const AdoptionConfirmationEmail = ({
  customerName,
  puppyName,
  breed,
  pickupDate,
  totalPaid,
}: AdoptionConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Congratulations on adopting {puppyName}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Congratulations!</Heading>
        <Text style={text}>Dear {customerName},</Text>
        <Text style={text}>
          We're excited to confirm that <strong>{puppyName}</strong> is officially yours! 
          Your full payment has been received, and your new {breed} puppy is ready to join your family.
        </Text>
        
        <Section style={infoBox}>
          <Text style={infoTitle}>Adoption Details</Text>
          <Text style={infoDetail}>Puppy Name: <strong>{puppyName}</strong></Text>
          <Text style={infoDetail}>Breed: <strong>{breed}</strong></Text>
          <Text style={infoDetail}>Pickup Date: <strong>{pickupDate}</strong></Text>
          <Text style={infoDetail}>Total Paid: <strong>${totalPaid.toFixed(2)}</strong></Text>
        </Section>

        <Section style={checklistBox}>
          <Text style={checklistTitle}>Before Pickup - What to Bring:</Text>
          <Text style={checklistItem}>✓ Valid photo ID</Text>
          <Text style={checklistItem}>✓ Carrier or crate for safe transport</Text>
          <Text style={checklistItem}>✓ Blanket or comfort item</Text>
          <Text style={checklistItem}>✓ Any questions you'd like to discuss</Text>
        </Section>

        <Text style={text}>
          We'll provide you with {puppyName}'s health records, vaccination history, 
          microchip information, and care instructions at pickup.
        </Text>

        <Text style={text}>
          Please confirm your pickup time by replying to this email. We can't wait to 
          see you and help {puppyName} transition to their forever home!
        </Text>

        <Text style={footer}>
          With excitement,<br />
          The GDS Puppies Team<br />
          <Link href="https://gdspuppies.com" style={link}>
            www.gdspuppies.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AdoptionConfirmationEmail;

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

const infoBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 48px',
};

const infoTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: '0 0 16px 0',
};

const infoDetail = {
  fontSize: '16px',
  color: '#333',
  margin: '8px 0',
};

const checklistBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 48px',
  borderLeft: '4px solid #f59e0b',
};

const checklistTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#92400e',
  margin: '0 0 12px 0',
};

const checklistItem = {
  fontSize: '16px',
  color: '#78350f',
  margin: '6px 0',
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