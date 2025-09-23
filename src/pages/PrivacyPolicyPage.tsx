import React from 'react';
import Section from "@/components/Section";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert } from 'lucide-react';

/**
 * @component PrivacyPolicyPage
 * @description A static informational page that displays the company's privacy policy.
 * It is structured with clear headings for different sections of the policy.
 * The content is currently placeholder text and should be replaced with the actual legal text.
 *
 * @returns {JSX.Element} The rendered privacy policy page.
 */
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
              <p className="mt-2">
                Usage Data and Analytics: We may also collect information about how you access and use our website. This may include information such as your IP address, browser type, operating system, referral URLs, page views, and interaction with site features. We may use third-party analytics services like Google Analytics and Facebook Pixel to help us understand this usage. (Placeholder content - REPLACE WITH YOUR ACTUAL POLICY TEXT)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">2. How We Use Your Information</h2>
              <p>
                We may use the information we collect to contact you, provide customer support, process transactions, and improve our services. We will not share your personal information with any third parties, other than as necessary to provide our services (e.g., payment processors) or as required by law. Information collected through analytics services helps us understand user behavior, improve our website and services, and measure the effectiveness of our marketing campaigns. (Placeholder content - REPLACE WITH YOUR ACTUAL POLICY TEXT)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">3. Security of Your Personal Information</h2>
              <p>
                We take reasonable precautions to protect your personal information from loss, misuse, unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">4. Cookies</h2>
               <p>
                We use “cookies” to collect information about you and your activity across our site. A cookie is a small piece of data that our website stores on your computer, and accesses each time you visit, so we can understand how you use our site. (Placeholder content)
              </p>

              {/* New Section for Analytics and Tracking Technologies */}
              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">5. Analytics and Tracking Technologies</h2>
              <p>
                [**IMPORTANT USER ACTION REQUIRED: Insert your specific text here.** This section should detail your use of analytics tools like Google Analytics, Facebook Pixel, and other similar technologies. Explain what data these tools collect, how you use that data (e.g., for site improvement, marketing analytics), and how users might opt-out if possible. Clearly state that you do not sell personal information to third parties. Example text: "We use third-party analytics services such as Google Analytics and Facebook Pixel to collect information about your use of our services and enable us to improve how our services work. The information allows us to see the overall patterns of usage on the Services, helps us record any difficulties you have with the Services, shows us whether our advertising is effective or not, and allows us to use responses to advertisements to optimize ad performance. Google Analytics and Facebook Pixel use cookies and other similar technologies to collect information about the use of our services and to report website trends to us, without identifying individual visitors to us. We do not sell your personal information to any third parties. You can learn about Google’s practices by going to www.google.com/policies/privacy/partners/, and opt-out of them by downloading the Google Analytics opt-out browser add-on, available at https://tools.google.com/dlpage/gaoptout. For Facebook Pixel, you can manage your preferences through your Facebook ad settings."] (Placeholder content - REPLACE WITH YOUR ACTUAL POLICY TEXT)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">6. Changes to This Policy</h2>
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

export default PrivacyPolicyPage;
