
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { EnhancedSearch, SearchFilters } from "@/components/search/EnhancedSearch";
import { LazyImage } from "@/components/LazyImage";
import { Puppy } from "@/types/puppy";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import PuppyCard from "@/components/PuppyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/api/publicApi";
import { calculateAge } from "@/utils/dateUtils";

const Puppies = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    breed: "All Breeds",
    gender: "All", 
    status: "All",
    priceRange: [0, 5000],
    ageRange: [0, 52],
    temperament: [],
    sortBy: "name",
    sortOrder: 'asc'
  });

  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  // Get puppies with enhanced filters
  const { data: puppiesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['puppies-enhanced', filters],
    queryFn: () => {
      const params: any = {
        limit: 100
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.breed !== "All Breeds") params.breed = filters.breed;
      if (filters.gender !== "All") params.gender = filters.gender;
      if (filters.status !== "All") params.status = filters.status;
      if (filters.priceRange[0] > 0) params.minPrice = filters.priceRange[0];
      if (filters.priceRange[1] < 5000) params.maxPrice = filters.priceRange[1];
      
      return publicApi.getAllPuppies(params);
    },
    staleTime: 2 * 60 * 1000,
  });

  const puppies = puppiesData?.puppies || [];

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      breed: "All Breeds", 
      gender: "All",
      status: "All",
      priceRange: [0, 5000] as [number, number],
      ageRange: [0, 52] as [number, number],
      temperament: [],
      sortBy: "name",
      sortOrder: 'asc' as 'asc' | 'desc'
    };
    setFilters(defaultFilters);
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Available Puppies",
    "description": "Browse our available puppies from Golden Dreams Kennels. Healthy, well-socialized puppies with champion bloodlines.",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": puppies.length,
      "itemListElement": puppies.map((puppy, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": puppy.name,
          "description": `${puppy.breed} puppy - ${puppy.gender}`,
          "image": puppy.photo_url,
          "offers": {
            "@type": "Offer", 
            "price": puppy.price,
            "priceCurrency": "USD",
            "availability": puppy.status === "Available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
          }
        }
      }))
    }
  };

  return (
    <div>
      <Helmet>
        <title>Available Puppies for Sale - Browse by Breed | Golden Dreams Kennels</title>
        <meta name="description" content="Browse our available puppies for sale. Healthy, well-socialized puppies from champion bloodlines. Filter by breed, search by name, and find your perfect companion." />
        <meta name="keywords" content="puppies for sale, available puppies, puppy adoption, dog breeds, Golden Dreams Kennels puppies, healthy puppies, champion bloodlines" />
        <link rel="canonical" href="https://gdspuppies.com/puppies" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Available Puppies for Sale - Browse by Breed" />
        <meta property="og:description" content="Browse our available puppies for sale. Healthy, well-socialized puppies from champion bloodlines ready for their forever homes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gdspuppies.com/puppies" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Available Puppies for Sale - Browse by Breed" />
        <meta name="twitter:description" content="Browse our available puppies for sale. Healthy, well-socialized puppies from champion bloodlines ready for their forever homes." />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <HeroSection
        title="Available Puppies"
        subtitle="Meet our adorable puppies looking for their forever homes"
        imageSrc="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
        ctaText="Adopt Now"
        ctaLink="/adopt"
      />

      <Section>
        {/* Enhanced Search Component */}
        <EnhancedSearch 
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
          className="mb-8"
        />

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="border rounded-lg p-4 h-96">
                <Skeleton className="h-48 w-full rounded-md" />
                <div className="space-y-2 mt-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Error loading puppies</h3>
            <p className="text-muted-foreground mb-4">
              We're having trouble loading the puppies. Please try again.
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        )}

        {/* Puppies Grid */}
        {!isLoading && !isError && (
          <>
            {puppies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {puppies.map((puppy) => (
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
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No puppies found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters to see more results.
                </p>
                <Button className="mt-4" onClick={() => setFilters({
                  search: "",
                  breed: "All Breeds", 
                  gender: "All",
                  status: "All",
                  priceRange: [0, 5000],
                  ageRange: [0, 52],
                  temperament: [],
                  sortBy: "name",
                  sortOrder: 'asc'
                })}>Reset Filters</Button>
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
};

export default Puppies;
