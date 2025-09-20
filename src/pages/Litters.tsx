import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { LazyImage } from "@/components/LazyImage";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PawPrint, Calendar, Heart, Dog } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const Litters = () => {
  const { data: litters, isLoading, isError } = useQuery({
    queryKey: ['litters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('litters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Puppy Litters",
    "description": "View our current and upcoming puppy litters from Golden Dreams Kennels. Quality breeding with champion bloodlines.",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": litters?.length || 0,
      "itemListElement": (litters || []).map((litter, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": litter.name,
          "description": `${litter.breed} litter - ${litter.sire_name} x ${litter.dam_name}`,
          "image": litter.cover_image_url
        }
      }))
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Available Soon':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'All Reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'All Sold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Archived':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Puppy Litters - Current & Upcoming | Golden Dreams Kennels</title>
          <meta name="description" content="View our current and upcoming puppy litters from Golden Dreams Kennels. Quality breeding with champion bloodlines and health guarantees." />
          <link rel="canonical" href="https://gdspuppies.com/litters" />
        </Helmet>
        <HeroSection
          title="Our Litters"
          subtitle="Discover our current and upcoming litters of beautiful, healthy puppies"
          imageSrc="https://images.unsplash.com/photo-1583337130417-3346a1be7dee"
          ctaText="View Puppies"
          ctaLink="/puppies"
        />
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <HeroSection
          title="Our Litters"
          subtitle="Discover our current and upcoming litters of beautiful, healthy puppies"
          imageSrc="https://images.unsplash.com/photo-1583337130417-3346a1be7dee"
          ctaText="View Puppies"
          ctaLink="/puppies"
        />
        <Section>
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-4">Unable to load litters</h3>
            <p className="text-muted-foreground">Please try again later.</p>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Puppy Litters - Current & Upcoming | Golden Dreams Kennels</title>
        <meta name="description" content="View our current and upcoming puppy litters from Golden Dreams Kennels. Quality breeding with champion bloodlines and health guarantees." />
        <meta name="keywords" content="puppy litters, dog breeding, upcoming litters, current litters, Golden Dreams Kennels, champion bloodlines, quality breeding" />
        <link rel="canonical" href="https://gdspuppies.com/litters" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Puppy Litters - Current & Upcoming" />
        <meta property="og:description" content="View our current and upcoming puppy litters from Golden Dreams Kennels. Quality breeding with champion bloodlines and health guarantees." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gdspuppies.com/litters" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Puppy Litters - Current & Upcoming" />
        <meta name="twitter:description" content="View our current and upcoming puppy litters from Golden Dreams Kennels. Quality breeding with champion bloodlines and health guarantees." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <HeroSection
        title="Our Litters"
        subtitle="Discover our current and upcoming litters of beautiful, healthy puppies"
        imageSrc="https://images.unsplash.com/photo-1583337130417-3346a1be7dee"
        ctaText="View Available Puppies"
        ctaLink="/puppies"
      />
      
      <Section>
        {litters.length === 0 ? (
          <div className="text-center py-12">
            <Dog className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-4">No litters available</h3>
            <p className="text-muted-foreground mb-6">
              Check back soon for upcoming litters or browse our available puppies.
            </p>
            <Link to="/puppies">
              <Button>View Available Puppies</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {litters.map((litter) => (
              <Card key={litter.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {litter.cover_image_url && (
                  <div className="aspect-video overflow-hidden">
                    <LazyImage
                      src={litter.cover_image_url} 
                      alt={litter.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold flex items-center">
                      <PawPrint className="mr-2 h-5 w-5 text-brand-red" />
                      {litter.name}
                    </CardTitle>
                    <Badge className={getStatusColor(litter.status)}>
                      {litter.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {litter.breed}
                  </p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {litter.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {litter.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {litter.dam_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dam:</span>
                        <span className="font-medium">{litter.dam_name}</span>
                      </div>
                    )}
                    
                    {litter.sire_name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sire:</span>
                        <span className="font-medium">{litter.sire_name}</span>
                      </div>
                    )}
                    
                    {(litter.date_of_birth || litter.expected_date) && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {litter.date_of_birth ? 'Born:' : 'Expected:'}
                        </span>
                        <span className="font-medium">
                          {formatDate(litter.date_of_birth || litter.expected_date)}
                        </span>
                      </div>
                    )}
                    
                    {litter.puppy_count && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Puppies:</span>
                        <span className="font-medium">{litter.puppy_count}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 flex gap-2">
                    {litter.status === 'Active' && (
                      <Link to={`/puppies?litter=${litter.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Heart className="mr-1 h-3 w-3" />
                          View Puppies
                        </Button>
                      </Link>
                    )}
                    
                    <Link to={`/litter/${litter.slug || litter.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
};

export default Litters;