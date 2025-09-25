import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, PawPrint, Dog } from "lucide-react";
import PuppyCard from "@/components/PuppyCard";
import { Helmet } from "react-helmet-async";

/**
 * @component LitterDetails
 * @description This component displays detailed information about a specific litter, identified by a slug
 * from the URL. It fetches data for the litter and the puppies within it, handling loading and error states.
 * The page is optimized for SEO with a dynamic title, meta description, and structured data.
 *
 * @returns {JSX.Element} The rendered litter details page.
 */
const LitterDetails = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: litter, isLoading: litterLoading, isError: litterError } = useQuery({
    queryKey: ['litter', slug],
    queryFn: () => slug ? publicApi.getLitterBySlug(slug) : null,
    enabled: !!slug
  });

  const { data: puppiesData, isLoading: puppiesLoading } = useQuery({
    queryKey: ['litter-puppies', litter?.id],
    queryFn: () => publicApi.getAllPuppies({ 
      litter_id: litter?.id 
    }),
    enabled: !!litter?.id
  });

  /**
   * @function formatDate
   * @description Formats a date string into a localized date format.
   * @param {string | null} dateString - The date string to format.
   * @returns {string} The formatted date string or 'Not specified'.
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * @function getStatusColor
   * @description Returns a Tailwind CSS class string for the litter status badge based on the status.
   * @param {string} status - The status of the litter.
   * @returns {string} The corresponding CSS class for the badge color.
   */
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

  if (litterLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (litterError || !litter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Litter Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The litter you're looking for could not be found.
          </p>
          <Link to="/litters">
            <Button>View All Litters</Button>
          </Link>
        </div>
      </div>
    );
  }

  const coverImage = litter.image_urls?.[0] || litter.cover_image_url;

  return (
    <>
      <Helmet>
        <title>{`${litter.name} Litter - ${litter.breed} Puppies | GDS Puppies`}</title>
        <meta 
          name="description" 
          content={`${litter.name} litter of ${litter.breed} puppies. ${litter.description || `Beautiful ${litter.breed} puppies from ${litter.dam_name} and ${litter.sire_name}.`}`} 
        />
        <meta name="keywords" content={`${litter.breed} puppies, ${litter.name}, dog litter, puppy for sale, ${litter.dam_name}, ${litter.sire_name}`} />
        <link rel="canonical" href={`/litter/${litter.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${litter.name} - ${litter.breed} Litter`} />
        <meta property="og:description" content={`${litter.description || `Beautiful ${litter.breed} puppies available for loving homes.`}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`/litter/${litter.slug}`} />
        {coverImage && <meta property="og:image" content={coverImage} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${litter.name} - ${litter.breed} Litter`} />
        <meta name="twitter:description" content={`${litter.description || `Beautiful ${litter.breed} puppies available for loving homes.`}`} />
        {coverImage && <meta name="twitter:image" content={coverImage} />}

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": `${litter.name} Litter`,
            "description": litter.description || `${litter.breed} puppies from ${litter.dam_name} and ${litter.sire_name}`,
            "category": "Pet",
            "brand": {
              "@type": "Brand",
              "name": "GDS Puppies"
            },
            ...(coverImage && {
              "image": coverImage
            })
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {litter.name}
              </h1>
              <p className="text-xl md:text-2xl mb-6 opacity-90">
                {litter.breed} Litter
              </p>
              <Badge className={`${getStatusColor(litter.status)} text-lg px-4 py-2`}>
                {litter.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Litter Information Card */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <PawPrint className="mr-3 h-6 w-6 text-brand-red" />
                Litter Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coverImage && (
                  <div className="lg:col-span-1">
                    <img 
                      src={coverImage} 
                      alt={litter.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                <div className={`space-y-4 ${coverImage ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                  {litter.description && (
                    <div>
                      <h3 className="font-semibold mb-2">About This Litter</h3>
                      <p className="text-muted-foreground">{litter.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Breed:</span>
                        <span>{litter.breed}</span>
                      </div>
                      
                      {litter.dam_name && (
                        <div className="flex justify-between">
                          <span className="font-medium">Dam (Mother):</span>
                          <span>{litter.dam_name}</span>
                        </div>
                      )}
                      
                      {litter.sire_name && (
                        <div className="flex justify-between">
                          <span className="font-medium">Sire (Father):</span>
                          <span>{litter.sire_name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {(litter.date_of_birth || litter.expected_date) && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            {litter.date_of_birth ? 'Born:' : 'Expected:'}
                          </span>
                          <span>{formatDate(litter.date_of_birth || litter.expected_date)}</span>
                        </div>
                      )}
                      
                      {litter.puppy_count && (
                        <div className="flex justify-between">
                          <span className="font-medium">Puppies:</span>
                          <span>{litter.puppy_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Puppies */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Available Puppies from This Litter</h2>
            
            {puppiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full" />
                ))}
              </div>
            ) : puppiesData?.puppies?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {puppiesData.puppies.map((puppy) => (
                  <Link 
                    key={puppy.id}
                    to={`/puppy/${puppy.slug || puppy.id}`}
                  >
                    <PuppyCard 
                      id={puppy.id}
                      name={puppy.name}
                      breed={puppy.breed}
                      age={puppy.birth_date}
                      price={puppy.price || 0}
                      imageSrc={puppy.photo_url}
                      imageUrls={puppy.image_urls}
                      status={puppy.status}
                      slug={puppy.slug}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dog className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-4">No puppies available from this litter</h3>
                <p className="text-muted-foreground mb-6">
                  All puppies from this litter may have found their homes, or they may not be ready yet.
                </p>
                <Link to="/puppies">
                  <Button>
                    <Heart className="mr-2 h-4 w-4" />
                    View All Available Puppies
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Link to="/puppies">
              <Button size="lg" className="mr-4">
                <Heart className="mr-2 h-4 w-4" />
                View All Puppies
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LitterDetails;