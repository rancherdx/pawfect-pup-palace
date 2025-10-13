import React from 'npm:react@18.3.1';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22';

interface EmailConfirmationProps {
  supabase_url: string;
  email_action_type: string;
  redirect_to: string;
  token_hash: string;
}

export const EmailConfirmationEmail = ({
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
}: EmailConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Confirm your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to GDS Puppies!</Heading>
        <Text style={text}>
          Thank you for signing up. Please confirm your email address by clicking the button below:
        </Text>
        <div style={{ textAlign: 'center', margin: '32px 0' }}>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            style={button}
          >
            Confirm Email
          </Link>
        </div>
        <Text style={text}>
          Once confirmed, you'll have full access to browse our adorable puppies,
          save your favorites, and stay updated on new arrivals.
        </Text>
        <Text style={footer}>
          If you didn't create an account with GDS Puppies, you can safely ignore this email.
        </Text>
        <Text style={footer}>
          The GDS Puppies Team<br />
          <Link href="https://gdspuppies.com" style={link}>
            www.gdspuppies.com
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
);

export default EmailConfirmationEmail;

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
  margin: '16px 0',
  padding: '0 48px',
};