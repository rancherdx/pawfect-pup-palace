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

interface WelcomeEmailProps {
  customerName: string;
  loginUrl: string;
}

export const WelcomeEmail = ({
  customerName,
  loginUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Pawfect Pup Palace - Your journey to finding the perfect puppy starts here!</Preview>
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
        
        <Heading style={h1}>Welcome to Pawfect Pup Palace! 🐕</Heading>
        
        <Text style={text}>Hi {customerName},</Text>
        
        <Text style={text}>
          Thank you for joining our community of dog lovers! We're thrilled to help you find your perfect furry companion.
        </Text>

        <Section style={features}>
          <Text style={featuresTitle}>What you can do with your account:</Text>
          <Text style={featureItem}>✨ Browse our available puppies</Text>
          <Text style={featureItem}>❤️ Save your favorite puppies</Text>
          <Text style={featureItem}>📞 Contact us directly about puppies</Text>
          <Text style={featureItem}>📋 Track your application status</Text>
          <Text style={featureItem}>🏠 Access adoption resources</Text>
        </Section>

        <Section style={buttonSection}>
          <Button style={button} href={loginUrl}>
            Explore Available Puppies
          </Button>
        </Section>

        <Text style={text}>
          Our puppies come from loving, responsible breeders who prioritize health and temperament. 
          Each puppy is vet-checked, vaccinated, and ready to become a cherished member of your family.
        </Text>

        <Hr style={hr} />

        <Section style={footer}>
          <Text style={footerText}>
            Questions? We're here to help! Reply to this email or visit our{' '}
            <Link href="https://pawfect-pup-palace.com/contact" style={link}>
              contact page
            </Link>
            .
          </Text>
          
          <Text style={footerText}>
            Follow us for puppy updates:
          </Text>
          
          <Section style={socialSection}>
            <Link href="#" style={socialLink}>Facebook</Link>
            <Text style={socialDivider}>•</Text>
            <Link href="#" style={socialLink}>Instagram</Link>
            <Text style={socialDivider}>•</Text>
            <Link href="#" style={socialLink}>Twitter</Link>
          </Section>
          
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

export default WelcomeEmail;

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
  padding: '32px 0',
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

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 32px',
};

const features = {
  backgroundColor: '#fef7f0',
  border: '1px solid #f4d7b7',
  borderRadius: '8px',
  margin: '32px',
  padding: '24px',
};

const featuresTitle = {
  color: '#d97706',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const featureItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '18px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  fontWeight: 'bold',
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
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#dc2626',
  textDecoration: 'underline',
};

const socialSection = {
  textAlign: 'center' as const,
  margin: '16px 0',
};

const socialLink = {
  color: '#dc2626',
  fontSize: '14px',
  textDecoration: 'none',
  margin: '0 8px',
};

const socialDivider = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 4px',
};

const footerAddress = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
};