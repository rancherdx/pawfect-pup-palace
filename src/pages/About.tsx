
import { PawPrint } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";

const About = () => {
  return (
    <div>
      <HeroSection
        title="About GDS Puppies"
        subtitle="Learn about our story, our breeding practices, and our commitment to raising happy, healthy puppies"
        imageSrc="https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80"
        ctaText="Contact Us"
        ctaLink="/contact"
      />

      <Section title="Our Story" withPawPrintBg>
        <div className="max-w-3xl mx-auto">
          <p className="mb-6">
            GDS Puppies was founded in 2010 by the Davis family, who have been passionate about dogs for generations. 
            What started as a small family breeding program has grown into a respected establishment known for 
            raising well-socialized, healthy puppies that bring joy to families across the country.
          </p>
          <p className="mb-6">
            Our mission is to breed puppies that are not only beautiful but also healthy, well-tempered, and well-socialized, 
            ready to become cherished members of your family. We pride ourselves on our ethical breeding practices and 
            the loving environment we provide for all our dogs.
          </p>
          <div className="flex justify-center my-8">
            <PawPrint className="h-20 w-20 text-brand-red animate-bounce" />
          </div>
          <p>
            Each puppy at GDS is raised with love and attention, ensuring they are well-adjusted and ready 
            for their forever homes. We believe in transparency and education, and we're committed to helping 
            you find the perfect puppy match and supporting you throughout your journey together.
          </p>
        </div>
      </Section>

      <Section title="Meet Our Team" className="bg-secondary">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Team Member 1 */}
          <div className="text-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                alt="John Davis" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold mb-1">John Davis</h3>
            <p className="text-sm text-muted-foreground mb-3">Founder & Head Breeder</p>
            <p className="text-sm">
              With over 20 years of experience, John ensures that all our breeding practices are ethical and prioritize the health of our dogs.
            </p>
          </div>

          {/* Team Member 2 */}
          <div className="text-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                alt="Sarah Davis" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold mb-1">Sarah Davis</h3>
            <p className="text-sm text-muted-foreground mb-3">Puppy Care Specialist</p>
            <p className="text-sm">
              Sarah oversees the daily care and socialization of our puppies, ensuring they are happy, healthy, and well-adjusted.
            </p>
          </div>

          {/* Team Member 3 */}
          <div className="text-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                alt="Michael Johnson" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold mb-1">Dr. Michael Johnson</h3>
            <p className="text-sm text-muted-foreground mb-3">Veterinarian</p>
            <p className="text-sm">
              Dr. Johnson provides comprehensive healthcare for all our dogs and puppies, performing regular check-ups and vaccinations.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Our Facilities">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
              alt="GDS Puppies Facilities" 
              className="rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4">A Home-Like Environment</h3>
            <p className="mb-4">
              Our puppies are raised in a clean, spacious, home-like environment, not in cages or kennels. 
              This allows them to develop proper social skills and behaviors from an early age.
            </p>
            <p className="mb-4">
              We have dedicated play areas both indoors and outdoors, where puppies can explore, 
              exercise, and interact with each other and our team members.
            </p>
            <p>
              Regular veterinary visits and health screenings are conducted in our on-site clinic 
              to ensure all our puppies are in excellent health before going to their forever homes.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default About;
