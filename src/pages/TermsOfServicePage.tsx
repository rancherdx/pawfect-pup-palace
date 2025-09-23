import React from 'react';
import Section from "@/components/Section"; // Assuming this component provides consistent padding and layout
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from 'lucide-react'; // Optional icon

/**
 * @component TermsOfServicePage
 * @description A static informational page that displays the company's terms of service.
 * It is structured with clear headings for different sections of the terms. The content
 * is currently placeholder text and should be replaced with the actual legal text.
 *
 * @returns {JSX.Element} The rendered terms of service page.
 */
const TermsOfServicePage: React.FC = () => {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Section className="py-12 md:py-20 bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-gray-900 dark:via-gray-800 dark:to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <FileText className="h-16 w-16 mx-auto mb-4 text-brand-red" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
              Terms of Service
            </h1>
          </div>

          <Card className="shadow-lg dark:border-gray-700">
            <CardContent className="p-6 md:p-8 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Welcome to GDS Puppies! These terms and conditions outline the rules and regulations for the use of GDS Puppies' Website, located at [Your Website URL Here].
              </p>
              <p>
                By accessing this website we assume you accept these terms and conditions. Do not continue to use GDS Puppies if you do not agree to take all of the terms and conditions stated on this page.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">1. Introduction</h2>
              <p>
                Content for this section is coming soon. Please check back later or contact us for more information regarding our terms of service. We appreciate your patience as we develop this content to provide comprehensive guidelines for our users and customers.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">2. Intellectual Property Rights</h2>
              <p>
                Placeholder content for intellectual property rights. This section will detail ownership of content, trademarks, and other intellectual property related to GDS Puppies.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">3. Restrictions</h2>
              <p>
                You are specifically restricted from all of the following: publishing any Website material in any other media; selling, sublicensing and/or otherwise commercializing any Website material; publicly performing and/or showing any Website material... (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">4. Your Content</h2>
               <p>
                In these Website Standard Terms and Conditions, “Your Content” shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant GDS Puppies a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">5. Limitation of Liability</h2>
              <p>
                In no event shall GDS Puppies, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. (Placeholder content)
              </p>

              <p className="mt-8 text-sm text-muted-foreground">
                Last Updated: {lastUpdatedDate}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                For any questions regarding these Terms of Service, please <a href="/contact" className="text-brand-red hover:underline">contact us</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
};

export default TermsOfServicePage;
