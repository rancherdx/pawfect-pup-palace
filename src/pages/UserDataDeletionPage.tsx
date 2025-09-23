import React from 'react';
import Section from "@/components/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from 'lucide-react';

/**
 * @component UserDataDeletionPage
 * @description A static informational page that explains the process for users to request
 * the deletion of their personal data. It outlines what data is held, how to make a request,
 * the verification process, and any exceptions to the deletion policy.
 *
 * @returns {JSX.Element} The rendered user data deletion page.
 */
const UserDataDeletionPage: React.FC = () => {
  const lastUpdatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Section className="py-12 md:py-20 bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Trash2 className="h-16 w-16 mx-auto mb-4 text-brand-red" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
              User Data Deletion Request
            </h1>
          </div>

          <Card className="shadow-lg dark:border-gray-700">
            <CardContent className="p-6 md:p-8 space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                At GDS Puppies, we respect your right to control your personal information. This page outlines how you can request the deletion of your user data from our systems.
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">1. What Data We Hold</h2>
              <p>
                If you have created an account with us, applied for adoption, or made a purchase, we may hold information such as your name, contact details (email, phone, address), application details, communication history, and transaction records. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">2. How to Request Deletion</h2>
              <p>
                To request the deletion of your personal data, please send an email to our Data Privacy Officer at <a href="mailto:privacy@gdspuppies.example.com" className="text-brand-red hover:underline">privacy@gdspuppies.example.com</a> with the subject line "User Data Deletion Request".
                Please include your full name and the email address associated with your account or interactions with us so we can locate your data. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">3. Verification Process</h2>
              <p>
                For security reasons, and to ensure we are deleting data for the correct individual, we will need to verify your identity before processing your request. We may contact you to ask for further information to confirm your identity. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">4. Data Retention & Exceptions</h2>
               <p>
                Please note that some data may not be eligible for immediate deletion due to legal, contractual, or legitimate business obligations (e.g., financial transaction records that we are required to keep for accounting or tax purposes, health records for puppies adopted). We will inform you if any such exceptions apply to your request. Data that is not subject to such exceptions will be deleted within [e.g., 30-60 days] of verifying your request. (Placeholder content)
              </p>

              <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">5. Contact Us</h2>
              <p>
                If you have any questions about our data deletion process or how we handle your data, please do not hesitate to <a href="/contact" className="text-brand-red hover:underline">contact us</a> or email our privacy officer directly.
              </p>

              <p className="mt-8 text-sm text-muted-foreground">
                Policy Last Updated: {lastUpdatedDate}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
};

export default UserDataDeletionPage;
