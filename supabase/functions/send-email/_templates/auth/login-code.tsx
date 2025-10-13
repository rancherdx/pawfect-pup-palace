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

interface LoginCodeEmailProps {
  token: string;
}

export const LoginCodeEmail = ({ token }: LoginCodeEmailProps) => (
  <Html>
    <Head />
    <Preview>Your login code for GDS Puppies</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your Login Code</Heading>
        <Text style={text}>
          Use the code below to log in to your GDS Puppies account:
        </Text>
        <code style={code}>{token}</code>
        <Text style={text}>
          This code will expire in 15 minutes for security reasons.
        </Text>
        <Text style={footer}>
          If you didn't request this code, you can safely ignore this email.
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

export default LoginCodeEmail;

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
  textAlign: 'center' as const,
};

const code = {
  display: 'block',
  padding: '24px',
  margin: '32px 48px',
  backgroundColor: '#DC2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '48px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  letterSpacing: '8px',
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
  textAlign: 'center' as const,
};