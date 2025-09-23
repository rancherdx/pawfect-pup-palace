import React from 'react';
import Section from "@/components/Section";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw } from 'lucide-react'; // Icon for refunds/returns

/**
 * @component RefundPolicyPage
 * @description A static informational page that displays the company's refund policy.
 * It is structured with clear headings for different sections of the policy, such as deposits
 * and health guarantees. The content is currently placeholder text and should be replaced
 * with the actual legal text.
 *
 * @returns {JSX.Element} The rendered refund policy page.
 */
const RefundPolicyPage: React.FC = () => {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Section className="py-12 md:py-20 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 dark:from-gray-900 dark:via-gray-800 dark:to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <RotateCcw className="h-16 w-16 mx-auto mb-4 text-brand-teal" /> {/* Assuming brand-teal or use brand-red */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
              Refund Policy
            </h1>
          </div>

          <Card className="shadow-lg dark:border-gray-700">
            <CardContent className="p-6 md:p-8 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                At GDS Puppies, we strive for transparency and satisfaction in our adoption process. Please read our refund policy carefully.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">1. Deposits</h2>
              <p>
                Deposits made to reserve a puppy are generally non-refundable. This is because reserving a puppy means we take that puppy off the market for other interested families. Exceptions may be considered under specific circumstances at our sole discretion. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">2. Health Guarantee & Returns</h2>
              <p>
                Our puppies come with a health guarantee, the terms of which are outlined in your adoption contract and on our <a href="/health" className="text-brand-teal hover:underline">Health Guarantee</a> page. If a puppy is found to have a life-threatening congenital defect as defined in our guarantee, options may include a refund or a replacement puppy, subject to the terms of the guarantee. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">3. Cancellations by Adopter</h2>
              <p>
                If you decide to cancel your adoption after making a deposit but before taking possession of the puppy, your deposit will typically be forfeited. Any further payments made beyond the deposit may be partially refundable on a case-by-case basis, depending on the circumstances and our ability to find another suitable home for the puppy in a timely manner. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">4. Cancellations by GDS Puppies</h2>
               <p>
                In the unlikely event that GDS Puppies must cancel an adoption (e.g., due to unforeseen health issues with the puppy), any deposits or payments made by the adopter will be fully refunded. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">5. Process for Requesting a Refund</h2>
              <p>
                All refund requests must be made in writing and will be considered based on the terms outlined herein and in your adoption agreement. Please contact us directly to discuss any concerns. (Placeholder content)
              </p>

              <p className="mt-8 text-sm text-muted-foreground">
                Last Updated: {lastUpdatedDate}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                For any questions regarding our Refund Policy, please <a href="/contact" className="text-brand-teal hover:underline">contact us</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
};

export default RefundPolicyPage;
