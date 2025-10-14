import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/api";
import { calculateAge } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PuppyImageCarousel from "@/components/puppy-details/PuppyImageCarousel";
import PuppyInfoSection from "@/components/puppy-details/PuppyInfoSection";
import TemperamentTraitsCard from "@/components/puppy-details/TemperamentTraitsCard";
import DetailsTabs from "@/components/puppy-details/DetailsTabs";
import { Helmet } from "react-helmet-async";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { useNavigate } from "react-router-dom";

/**
 * @component PuppyDetails
 * @description This component displays a detailed page for a single puppy, identified by a slug
 * from the URL. It fetches the puppy's data and presents it in a structured layout with an
 * image carousel, information sections, and tabs for more details. The page is optimized for
 * SEO with a dynamic title, meta description, and structured data for the specific puppy (product).
 *
 * @returns {JSX.Element} The rendered puppy details page.
 */
const PuppyDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: puppy, isLoading, isError } = useQuery({
    queryKey: ['puppy', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      // Try fetching by slug first
      try {
        const puppyData = await publicApi.getPuppyBySlug(slug);
        return puppyData;
      } catch (error) {
        // If slug fetch fails, try by ID (backward compatibility)
        try {
          const puppyById = await publicApi.getPuppyById(slug);
          if (puppyById && puppyById.slug) {
            // Redirect to correct slug URL
            navigate(`/puppy/${puppyById.slug}`, { replace: true });
            return puppyById;
          }
        } catch (idError) {
          // Both failed
          return null;
        }
      }
      return null;
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !puppy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Puppy Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The puppy you're looking for could not be found.
          </p>
          <Link to="/puppies">
            <Button>View All Puppies</Button>
          </Link>
        </div>
      </div>
    );
  }

  const age = puppy.birth_date ? calculateAge(puppy.birth_date) : null;
  const formattedWeight = puppy.weight ? `${puppy.weight} lbs` : null;
  const displayColor = puppy.color || "Not specified";

  const imageUrls = puppy.image_urls && puppy.image_urls.length > 0 
    ? puppy.image_urls 
    : puppy.photo_url 
    ? [puppy.photo_url] 
    : ['/placeholder.svg'];

  return (
    <>
      <Helmet>
        <title>{`${puppy.name} - ${puppy.breed} Puppy | GDS Puppies`}</title>
        <meta 
          name="description" 
          content={`Meet ${puppy.name}, a beautiful ${puppy.breed} puppy ${puppy.status === 'Available' ? 'available for adoption' : 'from our breeding program'}. ${puppy.description || ''}`} 
        />
        <meta name="keywords" content={`${puppy.breed} puppy, ${puppy.name}, dog for sale, puppy adoption, ${puppy.breed} breeder`} />
        <link rel="canonical" href={`/puppy/${puppy.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${puppy.name} - ${puppy.breed} Puppy`} />
        <meta property="og:description" content={`Meet ${puppy.name}, a beautiful ${puppy.breed} puppy. ${puppy.description || ''}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`/puppy/${puppy.slug}`} />
        {imageUrls[0] && <meta property="og:image" content={imageUrls[0]} />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${puppy.name} - ${puppy.breed} Puppy`} />
        <meta name="twitter:description" content={`Meet ${puppy.name}, a beautiful ${puppy.breed} puppy.`} />
        {imageUrls[0] && <meta name="twitter:image" content={imageUrls[0]} />}

        {/*
          Structured Data (JSON-LD) for the puppy, treated as a Product.
          This helps search engines understand the page content and can lead to rich snippets.
        */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": `${puppy.name} - ${puppy.breed} Puppy`,
            "description": puppy.description || `Beautiful ${puppy.breed} puppy available for loving home`,
            "category": "Pet",
            "brand": {
              "@type": "Brand",
              "name": "GDS Puppies"
            },
            "offers": puppy.price ? {
              "@type": "Offer",
              "price": puppy.price,
              "priceCurrency": "USD",
              "availability": puppy.status === 'Available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            } : undefined,
            ...(imageUrls[0] && {
              "image": imageUrls[0]
            })
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div 
          className="relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
          <div className="relative container mx-auto px-4 py-12">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Image Carousel */}
              <div className="space-y-4">
                <PuppyImageCarousel 
                  images={imageUrls}
                  name={puppy.name}
                />
              </div>

              {/* Puppy Information */}
              <div className="space-y-6">
                <PuppyInfoSection 
                  puppy={{
                    id: puppy.id,
                    name: puppy.name,
                    breed: puppy.breed,
                    gender: puppy.gender || "Not specified",
                    status: puppy.status,
                    price: puppy.price || 0,
                    description: puppy.description || "",
                    growthProgress: 75,
                    age: age || "Unknown",
                    weight: formattedWeight || "Not specified",
                    color: displayColor,
                    available: puppy.status === 'Available'
                  }}
                  puppyAge={age || "Unknown"}
                />
              {/* Social Share Buttons */}
              <div className="mt-6">
                <SocialShareButtons
                  title={`${puppy.name} - ${puppy.breed} Puppy`}
                  description={puppy.description || `Meet ${puppy.name}, a beautiful ${puppy.breed} puppy`}
                  imageUrl={imageUrls[0]}
                />
              </div>
            </div>
            </div>

            {/* Temperament & Traits Card */}
            {puppy.temperament && (
              <div className="mb-8">
                <TemperamentTraitsCard 
                  temperament={puppy.temperament || []}
                  trainability={80}
                  activityLevel={70}
                />
              </div>
            )}

            {/* Detailed Information Tabs */}
            <DetailsTabs 
              puppy={puppy}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PuppyDetails;