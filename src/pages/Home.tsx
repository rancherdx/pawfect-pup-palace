
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import PuppyCard from "@/components/PuppyCard";
import TestimonialCard from "@/components/TestimonialCard";
import { PawPrint, Heart, Award, CheckCircle, StarIcon } from "lucide-react";

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
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PuppyCard
            id="1"
            name="Bella"
            breed="Golden Retriever"
            age="8 weeks"
            gender="Female"
            imageSrc="https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
            price={1200}
          />
          <PuppyCard
            id="2"
            name="Max"
            breed="German Shepherd"
            age="10 weeks"
            gender="Male"
            imageSrc="https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
            price={1400}
          />
          <PuppyCard
            id="3"
            name="Luna"
            breed="Labrador Retriever"
            age="9 weeks"
            gender="Female"
            imageSrc="https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
            price={1100}
          />
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
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
          <Card className="bg-background text-center p-6 transition-transform duration-300 hover:-translate-y-1">
            <CardContent className="p-0 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Loving Care</h3>
              <p className="text-sm text-muted-foreground">
                Our puppies are raised in a loving home environment with daily socialization.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background text-center p-6 transition-transform duration-300 hover:-translate-y-1">
            <CardContent className="p-0 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Health Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                All our puppies come with a comprehensive health guarantee and full vet check.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background text-center p-6 transition-transform duration-300 hover:-translate-y-1">
            <CardContent className="p-0 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Ethical Breeding</h3>
              <p className="text-sm text-muted-foreground">
                We follow responsible breeding practices and prioritize the health of our dogs.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-background text-center p-6 transition-transform duration-300 hover:-translate-y-1">
            <CardContent className="p-0 space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <PawPrint className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Ongoing Support</h3>
              <p className="text-sm text-muted-foreground">
                We provide lifelong support and guidance for your new puppy.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section
        title="What Our Customers Say"
        subtitle="Happy families and their furry friends"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TestimonialCard
            name="Sarah Johnson"
            location="New York, NY"
            testimonial="We adopted Bella three months ago and she has brought so much joy to our family. GDS Puppies was professional and caring throughout the entire process."
            rating={5}
            puppyName="Bella (Golden Retriever)"
          />
          <TestimonialCard
            name="Mark Wilson"
            location="Austin, TX"
            testimonial="Max is healthy, well-socialized, and everything we could have hoped for. The health guarantee gave us peace of mind with our new addition."
            rating={5}
            puppyName="Max (German Shepherd)"
          />
          <TestimonialCard
            name="Jennifer Lopez"
            location="Miami, FL"
            testimonial="The process was smooth from start to finish. Luna is a wonderful addition to our family and the ongoing support from GDS has been amazing."
            rating={4}
            puppyName="Luna (Labrador Retriever)"
          />
        </div>
        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link to="/reviews">Read More Reviews</Link>
          </Button>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-brand-red text-white">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Meet Your New Best Friend?</h2>
          <p className="mb-8 text-white/90">
            Browse our available puppies or contact us to learn more about our adoption process.
            We're here to help you find the perfect puppy for your family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="default" className="bg-white text-brand-red hover:bg-gray-100">
              <Link to="/puppies">Available Puppies</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Home;
