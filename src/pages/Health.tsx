
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";

const Health = () => {
  // FAQ items
  const faqs = [
    {
      question: "What does the health guarantee cover?",
      answer: "Our health guarantee covers genetic and congenital health conditions for a period of one year from the date of adoption. This includes but is not limited to hip dysplasia, elbow dysplasia, certain heart conditions, and eye disorders that are known to be hereditary."
    },
    {
      question: "What happens if my puppy develops a genetic condition?",
      answer: "If your puppy is diagnosed with a covered genetic condition within the guarantee period, we will either offer a replacement puppy of equal value or reimburse veterinary costs up to the purchase price of your puppy, depending on the specific situation and severity of the condition."
    },
    {
      question: "Do you provide a health record for each puppy?",
      answer: "Yes, each puppy comes with a comprehensive health record that includes vaccination history, deworming schedule, veterinary check-ups, and any other relevant health information. This document is essential for continuing proper healthcare with your own veterinarian."
    },
    {
      question: "Are your puppies vaccinated before they go home?",
      answer: "All our puppies receive age-appropriate vaccinations before going to their new homes. This typically includes the first round of core vaccines. We provide a detailed vaccination schedule to continue with your veterinarian."
    },
    {
      question: "What health testing do you perform on parent dogs?",
      answer: "Our parent dogs undergo comprehensive health testing specific to their breed before entering our breeding program. This may include OFA hip and elbow evaluations, cardiac examinations, eye clearances, and genetic testing for breed-specific conditions."
    },
    {
      question: "Do your puppies come microchipped?",
      answer: "Yes, all our puppies are microchipped before they go to their new homes. The microchip registration will be transferred to you during the adoption process."
    },
    {
      question: "What should I do if my puppy gets sick after coming home?",
      answer: "If your puppy shows any signs of illness within the first 72 hours after coming home, contact us immediately and take your puppy to a veterinarian. Our guarantee covers certain conditions if diagnosed within this period, and we want to ensure your puppy receives prompt care."
    },
    {
      question: "Do you provide ongoing support for health concerns?",
      answer: "Absolutely. We are always available to answer questions and provide guidance throughout your puppy's life. While the formal health guarantee has a time limit, our commitment to our puppies is lifelong."
    },
  ];

  return (
    <div>
      <HeroSection
        title="Health Guarantee"
        subtitle="We take pride in the health and well-being of all our puppies"
        imageSrc="https://images.unsplash.com/photo-1625316708582-7c38734be31d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
        ctaText="Contact Us"
        ctaLink="/contact"
      />

      <Section title="Our Commitment to Health" withPawPrintBg>
        <div className="max-w-3xl mx-auto text-center">
          <p className="mb-8">
            At GDS Puppies, the health and well-being of our puppies is our top priority. We are committed to ethical 
            breeding practices that prioritize health, temperament, and genetic diversity. Our comprehensive health 
            guarantee reflects our confidence in the quality of our puppies and our dedication to supporting you 
            throughout your journey with your new family member.
          </p>
          
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Every GDS Puppy Comes With:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Comprehensive 1-year genetic health guarantee</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Age-appropriate vaccinations</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Deworming treatment</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Veterinary health check</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Microchip identification</span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Health record and care instructions</span>
              </div>
            </div>
          </Card>

          <p>
            Our health guarantee is designed to give you peace of mind knowing that we stand behind our puppies and 
            are committed to ensuring they have the best possible start in life. We encourage all potential adopters 
            to review our health guarantee thoroughly and ask any questions before adopting a puppy.
          </p>
        </div>
      </Section>

      <Section title="Health Guarantee Details" className="bg-secondary">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Coverage Period</h3>
            <p>
              Our health guarantee covers genetic and congenital health conditions for a period of one (1) year 
              from the date of adoption. Additionally, we provide a 72-hour guarantee against infectious diseases 
              that may have been present but not apparent at the time of adoption.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Covered Conditions</h3>
            <p>
              The guarantee covers hereditary and congenital defects that adversely affect the health of your puppy, 
              including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Hip or elbow dysplasia</li>
              <li>Cardiac conditions (including murmurs graded 3/6 or higher)</li>
              <li>Eye disorders (PRA, cataracts, etc.)</li>
              <li>Genetic disorders specific to the breed</li>
              <li>Certain liver and kidney conditions determined to be congenital</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Required Care</h3>
            <p>
              To maintain the validity of the health guarantee, the puppy must receive proper care, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Continued vaccinations according to the schedule provided</li>
              <li>Regular veterinary check-ups</li>
              <li>Proper nutrition with premium quality food</li>
              <li>Adequate exercise appropriate for age and breed</li>
              <li>Protection from hazardous conditions and neglect</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Claims Process</h3>
            <p>
              If your puppy develops a condition that may be covered by our health guarantee:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact us immediately to report the issue.</li>
              <li>Provide documentation from a licensed veterinarian confirming the diagnosis.</li>
              <li>For genetic conditions, we may request a second opinion from a veterinarian of our choosing.</li>
              <li>Once a claim is verified, we will work with you to determine the most appropriate resolution.</li>
            </ol>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Remedies</h3>
            <p>
              If a covered condition is confirmed, we offer the following remedies at our discretion:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Replacement with another puppy of equal value when available</li>
              <li>Reimbursement of veterinary costs related to the condition, up to the original purchase price</li>
              <li>Partial refund to help with ongoing treatment costs</li>
            </ul>
            <p className="mt-4">
              Our goal is to ensure the health and happiness of both you and your puppy. We will work with you to find 
              the most appropriate solution based on your specific situation.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Health Guarantee FAQ">
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>
    </div>
  );
};

export default Health;
