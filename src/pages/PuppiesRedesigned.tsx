import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { EnhancedSearch, SearchFilters } from "@/components/search/EnhancedSearch";
import { Puppy } from "@/types/api";
import Section from "@/components/Section";
import PuppyCard from "@/components/PuppyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { publicApi } from "@/api/publicApi";
import { calculateAge } from "@/utils/dateUtils";
import { PawIcon, BoneIcon } from "@/components/PuppyIcons";
import { SplashScreen } from "@/components/SplashScreen";
import { useSplashScreen } from "@/hooks/useSplashScreen";
import { Filter, X } from "lucide-react";

const PuppiesRedesigned = () => {
  const { showSplash, handleComplete } = useSplashScreen('puppies', { showOnce: false });
  const [showFilters, setShowFilters] = useState(false);
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

  const { data: puppiesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['puppies-enhanced', filters],
    queryFn: () => {
      const params: any = { limit: 100 };
      
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
    "description": "Browse our available puppies from GDS Puppies. Healthy, well-socialized puppies with champion bloodlines.",
  };

  return (
    <>
      {showSplash && <SplashScreen type="puppies" onComplete={handleComplete} duration={1500} />}
      
      <div className="min-h-screen paw-print-bg">
        <Helmet>
          <title>Available Puppies for Sale - Browse by Breed | GDS Puppies</title>
          <meta name="description" content="Browse our available puppies for sale. Healthy, well-socialized puppies from champion bloodlines." />
          <link rel="canonical" href="https://gdspuppies.com/puppies" />
          <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Helmet>

        {/* Hero Header */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <PawIcon className="w-16 h-16 text-accent animate-bounce-gentle" />
              </motion.div>

              <h1 className="text-4xl md:text-5xl ipad-pro:text-6xl font-bold mb-4 font-heading">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Available Puppies
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-display">
                Meet our adorable puppies looking for their forever homes
              </p>

              <div className="mt-8 flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                  >
                    <BoneIcon className="w-5 h-5 text-accent/20" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <Section>
          {/* Mobile Filter Toggle */}
          <div className="laptop:hidden mb-6">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full gap-2"
              variant={showFilters ? "default" : "outline"}
            >
              {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>

          {/* Filters */}
          <motion.div
            initial={false}
            animate={{ height: showFilters || window.innerWidth >= 1024 ? "auto" : 0 }}
            className="overflow-hidden laptop:!h-auto"
          >
            <EnhancedSearch 
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
              className="mb-8"
            />
          </motion.div>

          {/* Results Count */}
          {!isLoading && !isError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex items-center justify-between flex-wrap gap-4"
            >
              <p className="text-muted-foreground flex items-center gap-2">
                <PawIcon className="w-5 h-5 text-accent" />
                Found <span className="font-semibold text-foreground">{puppies.length}</span> puppies
              </p>
              {(filters.search || filters.breed !== "All Breeds" || filters.gender !== "All") && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 ipad-pro:grid-cols-3 gap-6">
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <PawIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error loading puppies</h3>
              <p className="text-muted-foreground mb-4">
                We're having trouble loading the puppies. Please try again.
              </p>
              <Button onClick={() => refetch()}>Retry</Button>
            </motion.div>
          )}

          {/* Puppies Grid */}
          {!isLoading && !isError && (
            <>
              {puppies.length > 0 ? (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.1 }
                    }
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 ipad-pro:grid-cols-3 gap-6"
                >
                  {puppies.map((puppy, index) => (
                    <motion.div
                      key={puppy.id}
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: { opacity: 1, y: 0 }
                      }}
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
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <PawIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No puppies found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search filters to see more results.
                  </p>
                  <Button className="mt-4" onClick={resetFilters}>Reset Filters</Button>
                </motion.div>
              )}
            </>
          )}
        </Section>
      </div>
    </>
  );
};

export default PuppiesRedesigned;
