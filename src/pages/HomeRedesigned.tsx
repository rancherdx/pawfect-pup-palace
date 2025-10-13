import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Star, Users, Award, ArrowRight, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { publicApi } from "@/api/publicApi";
import { calculateAge } from "@/utils/dateUtils";
import PuppyCard from "@/components/PuppyCard";
import TestimonialCard from "@/components/TestimonialCard";
import { PawIcon, HeartPawIcon, BoneIcon } from "@/components/PuppyIcons";
import { SplashScreen } from "@/components/SplashScreen";
import { useSplashScreen } from "@/hooks/useSplashScreen";

const HomeRedesigned = () => {
  const { showSplash, handleComplete } = useSplashScreen('welcome', { showOnce: true });

  const { data: puppiesData, isLoading: puppiesLoading } = useQuery({
    queryKey: ['featured-puppies'],
    queryFn: () => publicApi.getFeaturedPuppies(3),
    staleTime: 5 * 60 * 1000,
  });

  const { data: testimonialsData, isLoading: testimonialsLoading } = useQuery({
    queryKey: ['featured-testimonials'],
    queryFn: () => publicApi.getFeaturedTestimonials(3),
    staleTime: 5 * 60 * 1000,
  });

  const featuredPuppies = puppiesData || [];
  const testimonials = testimonialsData || [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GDS Puppies",
    "url": "https://gdspuppies.com",
    "description": "Professional dog breeder specializing in healthy, well-socialized puppies with champion bloodlines.",
  };

  const features = [
    {
      icon: Shield,
      title: "Health Guaranteed",
      description: "All puppies come with comprehensive health certificates and veterinary care",
      color: "text-accent"
    },
    {
      icon: Star,
      title: "Champion Bloodlines",
      description: "Our breeding program features champion bloodlines with excellent temperaments",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Lifetime Support",
      description: "We provide ongoing support and guidance throughout your puppy's life",
      color: "text-accent"
    },
  ];

  return (
    <>
      {showSplash && <SplashScreen type="welcome" onComplete={handleComplete} duration={2000} />}
      
      <div className="min-h-screen">
        <Helmet>
          <title>GDS Puppies - Premium Puppy Breeder | Healthy, Happy Puppies</title>
          <meta name="description" content="Welcome to GDS Puppies, where every puppy finds their perfect family. Champion bloodlines, health guarantees, and lifetime support." />
          <link rel="canonical" href="https://gdspuppies.com/" />
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Helmet>

        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden heart-paw-bg">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <HeartPawIcon className="w-20 h-20 text-accent animate-float" />
              </motion.div>

              <h1 className="text-5xl md:text-6xl ipad-pro:text-7xl font-bold mb-6 font-heading">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]">
                  Welcome to GDS Puppies
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-display">
                Where every puppy finds their perfect family and every family finds their perfect companion
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="group relative overflow-hidden">
                  <Link to="/puppies" className="flex items-center gap-2">
                    <PawIcon className="w-5 h-5 group-hover:animate-bounce-gentle" />
                    View Available Puppies
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="group">
                  <Link to="/contact" className="flex items-center gap-2">
                    Contact Us
                  </Link>
                </Button>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 flex justify-center gap-8"
              >
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  >
                    <PawIcon className="w-6 h-6 text-accent/30" />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-24 bone-pattern-bg">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading flex items-center justify-center gap-3">
                <BoneIcon className="w-8 h-8 text-accent" />
                Why Choose Us?
                <BoneIcon className="w-8 h-8 text-accent rotate-180" />
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're passionate about raising healthy, happy puppies
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Card className="h-full hover:shadow-glow transition-all duration-300 group border-border/50 hover:border-accent/50">
                      <CardHeader className="text-center">
                        <div className="mx-auto mb-4 relative">
                          <Icon className={`h-12 w-12 ${feature.color} group-hover:scale-110 transition-transform`} />
                          <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <CardTitle className="font-heading">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-center">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Puppies */}
        <section className="py-16 md:py-24 bg-secondary/20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
                Featured Puppies
              </h2>
              <p className="text-lg text-muted-foreground">
                Meet some of our adorable puppies looking for their forever homes
              </p>
            </motion.div>

            {puppiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 ipad-pro:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted h-64 rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 ipad-pro:grid-cols-3 gap-6 mb-8"
              >
                {featuredPuppies.map((puppy: any, index: number) => (
                  <motion.div
                    key={puppy.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PuppyCard
                      id={puppy.id}
                      name={puppy.name}
                      breed={puppy.breed}
                      age={calculateAge(puppy.birth_date)}
                      gender={puppy.gender}
                      imageSrc={puppy.photo_url}
                      imageUrls={puppy.image_urls}
                      price={puppy.price}
                      status={puppy.status}
                      slug={puppy.slug}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <div className="text-center">
              <Button asChild size="lg" className="group">
                <Link to="/puppies" className="flex items-center gap-2">
                  View All Puppies
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
                Happy Families
              </h2>
              <p className="text-lg text-muted-foreground">
                Here's what our families have to say
              </p>
            </motion.div>

            {testimonialsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 ipad-pro:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted h-32 rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 ipad-pro:grid-cols-3 gap-6 mb-8">
                {testimonials.map((testimonial: any) => (
                  <TestimonialCard
                    key={testimonial.id}
                    name={testimonial.name}
                    location=""
                    testimonial={testimonial.content}
                    rating={5}
                  />
                ))}
              </div>
            )}

            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link to="/reviews">View All Reviews</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-accent to-primary bg-[length:200%_200%] animate-gradient-shift text-primary-foreground">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Award className="h-16 w-16 mx-auto mb-6 animate-float" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">
                Ready to Find Your Perfect Companion?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Browse our available puppies or get in touch to learn more
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="group">
                  <Link to="/puppies" className="flex items-center gap-2">
                    <PawIcon className="w-5 h-5" />
                    Browse Puppies
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomeRedesigned;
