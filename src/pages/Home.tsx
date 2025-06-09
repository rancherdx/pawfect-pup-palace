
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import PuppyCard from "@/components/PuppyCard";
import TestimonialCard from "@/components/TestimonialCard";
import { PawPrint, Heart, Award, CheckCircle, Loader2, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { motion } from "framer-motion";
import { puppiesApi, testimonialApi } from "@/api";
import { calculateAge } from "@/utils/dateUtils";
import { Puppy, PublicPuppyListResponse } from "@/types";

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(229, 62, 62, 0.2), 0 8px 10px -6px rgba(229, 62, 62, 0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-background text-center p-6 h-full border-border/50">
        <CardContent className="p-0 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Home = () => {
  // Fetch featured puppies from API
  const { data: publicPuppiesData, isLoading, error } = useQuery<PublicPuppyListResponse, Error>({
    queryKey: ["featuredPuppies"],
    queryFn: () => puppiesApi.getAll({ limit: 3 }),
  });
  const featuredPuppies: Puppy[] = publicPuppiesData?.data || [];

  // Fetch testimonials
  const {
    data: testimonialsData,
    isLoading: isLoadingTestimonials,
    error: testimonialsError
  } = useQuery({
    queryKey: ['publicTestimonials'],
    queryFn: () => testimonialApi.getAllPublic({ limit: 3 }), // Fetch top 3 for homepage
    // staleTime: 1000 * 60 * 10 // Optional: 10 minutes stale time
  });
  const testimonials = testimonialsData || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Find Your Perfect Puppy Companion"
        subtitle="Healthy, happy puppies raised with love. Browse our available puppies and bring home your new best friend today."
        imageSrc="https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80"
        ctaText="View Available Puppies"
        ctaLink="/puppies"
      />

      {/* Featured Puppies */}
      <Section 
        title="Featured Puppies" 
        subtitle="Meet some of our adorable puppies looking for their forever homes"
        withPawPrintBg
        curved
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">Unable to load puppies</h3>
            <p className="text-muted-foreground mb-4">
              We're having trouble loading the puppies right now. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPuppies.map((puppy: Puppy, index) => (
              <motion.div
                key={puppy.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <PuppyCard
                  id={puppy.id.toString()}
                  name={puppy.name}
                  breed={puppy.breed}
                  age={calculateAge(puppy.birthDate)} // Use birthDate
                  gender={puppy.gender}
                  imageSrc={puppy.photoUrl || "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3"} // Use photoUrl
                  price={puppy.price}
                  available={puppy.status === 'Available'}
                  status={puppy.status} // Pass status for PuppyCard
                />
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="rounded-full border-brand-red/30 hover:bg-brand-red/5">
            <Link to="/puppies">View All Puppies</Link>
          </Button>
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section
        title="Why Choose Our Puppies"
        subtitle="We take pride in our responsible breeding practices and the care we provide to our puppies"
        className="bg-secondary"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={Heart}
            title="Loving Care"
            description="Our puppies are raised in a loving home environment with daily socialization."
          />
          
          <FeatureCard
            icon={Award}
            title="Health Guarantee"
            description="All our puppies come with a comprehensive health guarantee and full vet check."
          />
          
          <FeatureCard
            icon={CheckCircle}
            title="Ethical Breeding"
            description="We follow responsible breeding practices and prioritize the health of our dogs."
          />
          
          <FeatureCard
            icon={PawPrint}
            title="Ongoing Support"
            description="We provide lifelong support and guidance for your new puppy."
          />
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section
        title="What Our Customers Say"
        subtitle="Happy families and their furry friends"
        withPawPrintBg
        curved
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoadingTestimonials ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-background p-6 rounded-lg shadow-md animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4 mb-4"></div>
                <div className="h-20 bg-muted rounded mb-4"></div>
                <div className="flex items-center">
                  {/* Simplified skeleton for stars */}
                  <div className="h-5 w-20 bg-muted rounded"></div>
                </div>
              </div>
            ))
          ) : testimonialsError ? (
            <div className="col-span-full text-center py-8 text-red-600 bg-red-50 p-4 rounded-md">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <p>Could not load testimonials at this time.</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <p>No testimonials yet. Check back soon!</p>
            </div>
          ) : (
            testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id} // Use testimonial.id from API
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <TestimonialCard
                  name={testimonial.name}
                  location={testimonial.location}
                  testimonial={testimonial.testimonial_text} // Assuming API returns testimonial_text
                  rating={testimonial.rating}
                  puppyName={testimonial.puppy_name} // Assuming API returns puppy_name
                  // imageUrl={testimonial.image_url} // If TestimonialCard supports image_url
                />
              </motion.div>
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="rounded-full border-brand-red/30 hover:bg-brand-red/5">
            <Link to="/reviews">Read More Reviews</Link>
          </Button>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-brand-red text-white">
        <motion.div 
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Meet Your New Best Friend?</h2>
          <p className="mb-8 text-white/90">
            Browse our available puppies or contact us to learn more about our adoption process.
            We're here to help you find the perfect puppy for your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="default" className="bg-white text-brand-red hover:bg-gray-100 rounded-full">
              <Link to="/puppies">Available Puppies</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/20 rounded-full">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </motion.div>
      </Section>
      
      {/* Paw Print Trail Animation */}
      <div className="relative h-24 overflow-hidden">
        <motion.div
          className="absolute"
          initial={{ left: "-100px", bottom: "20px" }}
          animate={{ left: "calc(100% + 100px)" }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <div className="flex space-x-8">
            {[...Array(8)].map((_, i) => (
              <PawPrint key={i} className="h-8 w-8 text-brand-red opacity-20" />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
