import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Section from "@/components/Section"; // Assuming Section component is used for consistent page layout
import { PawPrint, HelpCircle } from 'lucide-react'; // Optional icons

const faqData = [
  {
    id: "faq-1",
    question: "What is the adoption process?",
    answer: (
      <>
        <p className="mb-2">Our adoption process is designed to ensure each puppy finds a loving and suitable home. It typically involves these steps:</p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li><strong>Application:</strong> Fill out our online adoption application form with details about your lifestyle and experience with pets.</li>
          <li><strong>Review:</strong> Our team reviews your application (usually within 2-3 business days).</li>
          <li><strong>Interview:</strong> We may schedule a brief call or video chat to discuss your application further and answer your questions.</li>
          <li><strong>Meet & Greet (if applicable):</strong> Depending on location and litter availability, we may arrange a visit.</li>
          <li><strong>Deposit & Contract:</strong> If approved, a non-refundable deposit is required to reserve your puppy, and you'll sign an adoption agreement.</li>
          <li><strong>Preparation:</strong> We'll provide guidance on preparing for your new puppy.</li>
          <li><strong>Go-Home Day:</strong> Schedule a time to pick up your puppy, or arrange for delivery if applicable. Final payment is typically due at this time.</li>
        </ol>
        <p className="mt-2">Please visit our <a href="/adopt" className="text-brand-red hover:underline">Adoption Page</a> for more details and to start your application.</p>
      </>
    )
  },
  {
    id: "faq-2",
    question: "Are the puppies vaccinated and dewormed?",
    answer: (
      <p>
        Yes, all our puppies receive age-appropriate vaccinations and deworming treatments before they go to their new homes.
        You will receive a detailed health record for your puppy, outlining all treatments administered.
        Please see our <a href="/health" className="text-brand-red hover:underline">Health Guarantee</a> page for more information on our health protocols.
      </p>
    )
  },
  {
    id: "faq-3",
    question: "Can I visit the puppies and their parents?",
    answer: (
      <p>
        We understand you're excited to meet our puppies! We schedule visits for approved applicants when puppies are old enough and it's safe for their health (typically after their first vaccinations).
        The health and safety of our puppies and parent dogs are our top priority. Please contact us to discuss visitation policies for specific litters.
      </p>
    )
  },
  {
    id: "faq-4",
    question: "What kind of food do you recommend for my new puppy?",
    answer: (
      <p>
        Your puppy will come with a small supply of the high-quality puppy food they are currently eating. We provide detailed feeding guidelines and recommendations for transitioning to a new food if you choose to switch.
        We generally recommend premium, age-appropriate puppy food that meets AAFCO standards. Specific brand recommendations may be discussed during the adoption process.
      </p>
    )
  },
  {
    id: "faq-5",
    question: "Do you offer shipping or delivery for puppies?",
    answer: (
      <p>
        We prefer new owners to pick up their puppy in person to ensure a smooth transition. However, we understand this isn't always possible.
        We may offer delivery options or work with trusted pet transport services on a case-by-case basis, at the buyer's expense. Please <a href="/contact" className="text-brand-red hover:underline">contact us</a> to discuss your specific situation.
      </p>
    )
  },
  {
    id: "faq-6",
    question: "What is included with my puppy when I take them home?",
    answer: (
      <>
        <p className="mb-2">Each GDS Puppy comes with a comprehensive take-home package, typically including:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Health record (vaccinations, deworming, vet checks).</li>
          <li>Registration papers (if applicable for the breed).</li>
          <li>Microchip information.</li>
          <li>A small supply of their current puppy food.</li>
          <li>A blanket or toy with their littermates' scent to help them transition.</li>
          <li>Our detailed puppy care guide and health guarantee.</li>
          <li>Lifetime breeder support.</li>
        </ul>
      </>
    )
  },
  {
    id: "faq-7",
    question: "How do I prepare my home for a new puppy?",
    answer: (
      <p>
        Preparing your home is crucial for a safe and happy puppy. Key steps include puppy-proofing (removing hazards, securing cords), setting up a designated potty area, creating a comfortable den (crate), and having essential supplies like food/water bowls, leash, collar, toys, and grooming tools. We provide a detailed checklist to all our new puppy owners.
      </p>
    )
  }
];

const FAQPage: React.FC = () => {
  return (
    <Section className="py-12 md:py-20 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <HelpCircle className="h-16 w-16 mx-auto mb-4 text-brand-red" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Have questions about our puppies or the adoption process? We've compiled answers to some common inquiries below.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto shadow-xl dark:border-gray-700">
          <CardContent className="p-6 md:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq) => (
                <AccordionItem value={faq.id} key={faq.id} className="border-b dark:border-gray-700">
                  <AccordionTrigger className="text-left text-base md:text-lg font-medium hover:text-brand-red dark:hover:text-brand-red/90 py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm md:text-base pt-2 pb-4 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
            <p className="text-muted-foreground">
                Can't find the answer you're looking for?
            </p>
            <Button variant="link" asChild className="text-brand-red text-lg hover:underline">
                <a href="/contact">Contact Us Directly</a>
            </Button>
        </div>
      </div>
    </Section>
  );
};

export default FAQPage;
