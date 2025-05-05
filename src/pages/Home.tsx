
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import PuppyCard from "@/components/PuppyCard";
import TestimonialCard from "@/components/TestimonialCard";
import { PawPrint, Heart, Award, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <PuppyCard
              id="1"
              name="Bella"
              breed="Golden Retriever"
              age="8 weeks"
              gender="Female"
              imageSrc="https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
              price={1200}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <PuppyCard
              id="2"
              name="Max"
              breed="German Shepherd"
              age="10 weeks"
              gender="Male"
              imageSrc="https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
              price={1400}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <PuppyCard
              id="3"
              name="Luna"
              breed="Labrador Retriever"
              age="9 weeks"
              gender="Female"
              imageSrc="https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
              price={1100}
            />
          </motion.div>
        </div>
        
        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="rounded-full border-brand-red/30 hover:bg-brand-red/5">
            <Link to="/puppies">View All Puppies</Link>
          </Button>
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section
        title="Why Choose GDS Puppies"
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <TestimonialCard
              name="Sarah Johnson"
              location="New York, NY"
              testimonial="We adopted Bella three months ago and she has brought so much joy to our family. GDS Puppies was professional and caring throughout the entire process."
              rating={5}
              puppyName="Bella (Golden Retriever)"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <TestimonialCard
              name="Mark Wilson"
              location="Austin, TX"
              testimonial="Max is healthy, well-socialized, and everything we could have hoped for. The health guarantee gave us peace of mind with our new addition."
              rating={5}
              puppyName="Max (German Shepherd)"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <TestimonialCard
              name="Jennifer Lopez"
              location="Miami, FL"
              testimonial="The process was smooth from start to finish. Luna is a wonderful addition to our family and the ongoing support from GDS has been amazing."
              rating={4}
              puppyName="Luna (Labrador Retriever)"
            />
          </motion.div>
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
