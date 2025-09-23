import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import TestimonialCard from "@/components/TestimonialCard";
import PuppyCard from "@/components/PuppyCard";
import FeaturedPuppyBanner from "@/components/FeaturedPuppyBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Users, Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { publicApi } from "@/api/publicApi";
import { calculateAge } from "@/utils/dateUtils";

/**
 * @component Home
 * @description The main landing page of the website. It serves as the central hub, showcasing
 * featured puppies, testimonials from happy families, and key reasons to choose the kennel.
 * The component fetches data for puppies and testimonials using React Query, handles loading states,
 * and is optimized for SEO with dynamic titles, meta descriptions, and structured data (JSON-LD).
 *
 * @returns {JSX.Element} The rendered home page.
 */
const Home = () => {
  const { data: puppiesData, isLoading: puppiesLoading } = useQuery({
    queryKey: ['featured-puppies'],
    queryFn: () => publicApi.getFeaturedPuppies(3),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: testimonialsData, isLoading: testimonialsLoading } = useQuery({
    queryKey: ['featured-testimonials'],
    queryFn: () => publicApi.getFeaturedTestimonials(3),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const featuredPuppies = puppiesData || [];
  const testimonials = testimonialsData || [];

  /**
   * @constant structuredData
   * @description JSON-LD structured data for the organization, conforming to Schema.org standards.
   * This provides detailed information about the business to search engines, which can be
   * used to generate rich snippets in search results.
   */
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Golden Dreams Kennels",
    "alternateName": "GDS Puppies",
    "url": "https://gdspuppies.com",
    "logo": "https://gdspuppies.com/logo.jpg",
    "description": "Professional dog breeder specializing in healthy, well-socialized puppies. Champion bloodlines with health guarantees and lifetime support.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Puppy Lane",
      "addressLocality": "Dogtown", 
      "addressRegion": "CA",
      "postalCode": "90210",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-123-4567",
      "contactType": "customer service",
      "email": "woof@gdspuppies.com"
    },
    "sameAs": [
      "https://www.instagram.com/gdspuppies",
      "https://www.facebook.com/gdspuppies",
      "https://twitter.com/gdspuppies"
    ]
  };

  return (
    <div>
      <Helmet>
        <title>Golden Dreams Kennels - Premium Puppy Breeder | Healthy, Happy Puppies</title>
        <meta name="description" content="Welcome to Golden Dreams Kennels, where every puppy finds their perfect family. Champion bloodlines, health guarantees, and lifetime support. Browse available puppies today." />
        <meta name="keywords" content="puppy breeder, dog breeder, puppies for sale, champion bloodlines, healthy puppies, Golden Dreams Kennels, GDS Puppies" />
        <link rel="canonical" href="https://gdspuppies.com/" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Golden Dreams Kennels - Premium Puppy Breeder" />
        <meta property="og:description" content="Where every puppy finds their perfect family and every family finds their perfect companion. Champion bloodlines with health guarantees." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gdspuppies.com/" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630" />
        <meta property="og:site_name" content="Golden Dreams Kennels" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Golden Dreams Kennels - Premium Puppy Breeder" />
        <meta name="twitter:description" content="Where every puppy finds their perfect family. Champion bloodlines, health guarantees, and lifetime support." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <HeroSection
        title="Welcome to Golden Dreams Kennels"
        subtitle="Where every puppy finds their perfect family and every family finds their perfect companion"
        imageSrc="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
        ctaText="View Available Puppies"
        ctaLink="/puppies"
      />

      {/* Featured Puppies Banner */}
      <FeaturedPuppyBanner />

      {/* Why Choose Us Section */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Golden Dreams Kennels?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're passionate about raising healthy, happy puppies and connecting them with loving families
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Heart className="h-12 w-12 text-brand-red mx-auto mb-4" />
              <CardTitle>Health Guaranteed</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All our puppies come with health certificates and are vet-checked before going to their new homes
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Star className="h-12 w-12 text-brand-red mx-auto mb-4" />
              <CardTitle>Champion Bloodlines</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Our breeding program features champion bloodlines with excellent temperaments and conformation
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-brand-red mx-auto mb-4" />
              <CardTitle>Lifetime Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                We provide ongoing support and guidance throughout your puppy's life - we're always here to help
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Featured Puppies Section */}
      <Section className="bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Puppies</h2>
          <p className="text-lg text-muted-foreground">
            Meet some of our adorable puppies looking for their forever homes
          </p>
        </div>
        
        {puppiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {featuredPuppies.map((puppy: any) => (
              <PuppyCard
                key={puppy.id}
                id={puppy.id}
                name={puppy.name}
                breed={puppy.breed}
                age={calculateAge(puppy.birth_date)}
                gender={puppy.gender}
                imageSrc={puppy.photo_url || "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3"}
                price={puppy.price}
                status={puppy.status}
              />
            ))}
          </div>
        )}
        
        <div className="text-center">
          <Button asChild size="lg" className="bg-brand-red hover:bg-red-700">
            <Link to="/puppies">
              View All Puppies <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Happy Families</h2>
          <p className="text-lg text-muted-foreground">
            Here's what our families have to say about their experience with us
          </p>
        </div>
        
        {testimonialsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {testimonials.map((testimonial: any) => (
              <TestimonialCard key={testimonial.id} name={testimonial.name} location={""} testimonial={testimonial.content} rating={5} />
            ))}
          </div>
        )}
        
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/reviews">View All Reviews</Link>
          </Button>
        </div>
      </Section>

      {/* CTA Section */}
      <Section className="bg-brand-red text-white">
        <div className="text-center">
          <Award className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Companion?</h2>
          <p className="text-xl mb-8 opacity-90">
            Browse our available puppies or get in touch to learn more about our breeding program
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/puppies">Browse Puppies</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-brand-red">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Home;
