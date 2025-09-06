import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateAge } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PuppyImageCarousel from "@/components/puppy-details/PuppyImageCarousel";
import PuppyInfoSection from "@/components/puppy-details/PuppyInfoSection";
import TemperamentTraitsCard from "@/components/puppy-details/TemperamentTraitsCard";
import DetailsTabs from "@/components/puppy-details/DetailsTabs";

const PuppyDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: puppy, isLoading, isError } = useQuery({
    queryKey: ['puppy', id],
    queryFn: async () => {
      if (!id) throw new Error('No puppy ID provided');
      
      const { data, error } = await supabase
        .from('puppies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section with Background Pattern */}
      <div 
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
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
            puppy={{...puppy, birthDate: puppy.birth_date}}
          />
        </div>
      </div>
    </div>
  );
};

export default PuppyDetails;