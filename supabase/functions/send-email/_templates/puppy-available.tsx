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

interface PuppyAvailableEmailProps {
  customerName: string;
  puppyName: string;
  puppyBreed: string;
  puppyPrice: number;
  puppyImage: string;
  puppyUrl: string;
}

export const PuppyAvailableEmail = ({
  customerName,
  puppyName,
  puppyBreed,
  puppyPrice,
  puppyImage,
  puppyUrl,
}: PuppyAvailableEmailProps) => (
  <Html>
    <Head />
    <Preview>{puppyName} is now available for adoption! Don't miss out on this adorable {puppyBreed}.</Preview>
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
        
        <Heading style={h1}>🎉 {puppyName} is Available!</Heading>
        
        <Text style={text}>Hi {customerName},</Text>
        
        <Text style={text}>
          Great news! We have an adorable {puppyBreed} puppy that just became available for adoption.
        </Text>

        <Section style={puppySection}>
          <Img
            src={puppyImage || 'https://pawfect-pup-palace.com/default-puppy.jpg'}
            width="300"
            height="200"
            alt={puppyName}
            style={puppyImage}
          />
          
          <Section style={puppyDetails}>
            <Heading style={puppyName}>{puppyName}</Heading>
            <Text style={puppyInfo}>
              <strong>Breed:</strong> {puppyBreed}<br />
              <strong>Price:</strong> ${puppyPrice.toLocaleString()}
            </Text>
          </Section>
        </Section>

        <Section style={urgencySection}>
          <Text style={urgencyText}>
            ⏰ <strong>Act quickly!</strong> Our puppies are adopted fast, and we operate on a first-come, first-served basis.
          </Text>
        </Section>

        <Section style={buttonSection}>
          <Button style={button} href={puppyUrl}>
            View {puppyName}'s Profile
          </Button>
        </Section>

        <Section style={nextSteps}>
          <Text style={nextStepsTitle}>Ready to adopt? Here's what to do next:</Text>
          <Text style={stepItem}>1. 📋 Review {puppyName}'s full profile and photos</Text>
          <Text style={stepItem}>2. 📞 Contact us to schedule a meet & greet</Text>
          <Text style={stepItem}>3. ✅ Complete our adoption application</Text>
          <Text style={stepItem}>4. 🏠 Prepare your home for your new family member</Text>
        </Section>

        <Text style={text}>
          All our puppies come with:
        </Text>
        
        <Section style={benefits}>
          <Text style={benefitItem}>✅ Up-to-date vaccinations</Text>
          <Text style={benefitItem}>✅ Health certificate from licensed vet</Text>
          <Text style={benefitItem}>✅ Microchip identification</Text>
          <Text style={benefitItem}>✅ Starter kit with food and supplies</Text>
          <Text style={benefitItem}>✅ 30-day health guarantee</Text>
          <Text style={benefitItem}>✅ Lifetime support from our team</Text>
        </Section>

        <Hr style={hr} />

        <Section style={contactSection}>
          <Text style={contactTitle}>Questions? Contact us right away!</Text>
          <Text style={contactInfo}>
            📧 Email: <Link href="mailto:info@pawfect-pup-palace.com" style={link}>info@pawfect-pup-palace.com</Link><br />
            📞 Phone: <Link href="tel:+1234567890" style={link}>(123) 456-7890</Link><br />
            💬 Text: Available 7 days a week
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Thanks for choosing Pawfect Pup Palace for your puppy adoption journey!
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

export default PuppyAvailableEmail;

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
  fontSize: '28px',
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

const puppySection = {
  backgroundColor: '#fef7f0',
  border: '2px solid #f4d7b7',
  borderRadius: '12px',
  margin: '32px',
  padding: '24px',
  textAlign: 'center' as const,
};

const puppyImage = {
  borderRadius: '8px',
  margin: '0 auto 16px',
};

const puppyDetails = {
  textAlign: 'center' as const,
};

const puppyName = {
  color: '#dc2626',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '16px 0',
};

const puppyInfo = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '8px 0',
};

const urgencySection = {
  backgroundColor: '#fef2f2',
  border: '2px solid #fecaca',
  borderRadius: '8px',
  margin: '32px',
  padding: '16px',
};

const urgencyText = {
  color: '#dc2626',
  fontSize: '16px',
  fontWeight: '500',
  textAlign: 'center' as const,
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '18px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  fontWeight: 'bold',
};

const nextSteps = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '8px',
  margin: '32px',
  padding: '24px',
};

const nextStepsTitle = {
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

const benefits = {
  margin: '16px 32px',
};

const benefitItem = {
  color: '#16a34a',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '4px 0',
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
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const contactInfo = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
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