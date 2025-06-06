import React from 'react';
import Section from "@/components/Section";
import { ShieldAlert } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Section className="py-12 md:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <ShieldAlert className="h-16 w-16 mx-auto mb-4 text-brand-blue" /> {/* Assuming brand-blue or use brand-red */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
              Privacy Policy
            </h1>
          </div>

          <Card className="shadow-lg dark:border-gray-700">
            <CardContent className="p-6 md:p-8 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Your privacy is important to us. It is GDS Puppies' policy to respect your privacy regarding any information we may collect from you across our website, [Your Website URL Here], and other sites we own and operate.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">1. Information We Collect</h2>
              <p>
                Log data: When you visit our website, our servers may automatically log the standard data provided by your web browser. This may include your computer’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details. (Placeholder content)
              </p>
              <p>
                Personal Information: We may ask for personal information, such as your name, email, phone number, and address, when you fill out an adoption application, contact us, or subscribe to our newsletter. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">2. How We Use Your Information</h2>
              <p>
                We may use the information we collect to contact you, provide customer support, process transactions, and improve our services. We will not share your personal information with any third parties, other than as necessary to provide our services (e.g., payment processors) or as required by law. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">3. Security of Your Personal Information</h2>
              <p>
                We take reasonable precautions to protect your personal information from loss, misuse, unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">4. Cookies</h2>
               <p>
                We use “cookies” to collect information about you and your activity across our site. A cookie is a small piece of data that our website stores on your computer, and accesses each time you visit, so we can understand how you use our site. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">5. Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. (Placeholder content)
              </p>

              <p className="mt-8 text-sm text-muted-foreground">
                Last Updated: {lastUpdatedDate}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                If you have any questions about this Privacy Policy, please <a href="/contact" className="text-brand-blue hover:underline">contact us</a>. {/* Assuming brand-blue or use brand-red */}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
};

// Mock Card components if not globally available or imported from UI lib
const Card: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => <div className={`bg-white dark:bg-gray-800 rounded-lg ${className}`}>{children}</div>;
const CardContent: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => <div className={className}>{children}</div>;

export default PrivacyPolicyPage;
