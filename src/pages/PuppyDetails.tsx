
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Section from "@/components/Section";
import PuppyImageCarousel from "@/components/puppy-details/PuppyImageCarousel";
import PuppyInfoSection from "@/components/puppy-details/PuppyInfoSection";
import TemperamentTraitsCard from "@/components/puppy-details/TemperamentTraitsCard";
import DetailsTabs from "@/components/puppy-details/DetailsTabs";
import usePuppyDetails from "@/hooks/usePuppyDetails";
import { Skeleton } from "@/components/ui/skeleton";

const PuppyDetails = () => {
  const { id } = useParams();
  const { puppy, puppyAge, isLoading, error } = usePuppyDetails(id);
  
  // If loading, show skeleton
  if (isLoading) {
    return (
      <Section>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-[400px] bg-muted rounded-xl animate-pulse"></div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  // If error, show error message
  if (error || !puppy) {
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Puppy Not Found</h1>
          <p className="mb-6">Sorry, we couldn't find the puppy you're looking for.</p>
          <Button asChild>
            <Link to="/puppies">View All Puppies</Link>
          </Button>
        </div>
      </Section>
    );
  }

  return (
    <div className="bg-background/50 relative">
      <div className="absolute inset-0 paw-print-bg opacity-5 pointer-events-none"></div>
      
      <Section>
        <div className="max-w-7xl mx-auto">
          {/* Puppy Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Puppy Images Carousel */}
            <PuppyImageCarousel 
              images={puppy.photoUrl ? [puppy.photoUrl] : []} 
              name={puppy.name} 
            />

            {/* Puppy Info */}
            <PuppyInfoSection 
              puppy={{
                ...puppy,
                growthProgress: 75, // Default value
                age: puppyAge,
                weight: puppy.weight?.toString() || 'N/A',
                color: puppy.color || 'N/A',
                available: puppy.status === 'Available',
                gender: puppy.gender || 'Unknown'
              }} 
              puppyAge={puppyAge} 
            />
          </div>

          {/* Temperament & Traits Card */}
          <div className="mt-8 mb-12">
            <TemperamentTraitsCard 
              temperament={Array.isArray(puppy.temperament) ? puppy.temperament : puppy.temperament ? [puppy.temperament] : ['Friendly']}
              trainability={75} // Default value since not in puppy type
              activityLevel={75} // Default value since not in puppy type
            />
          </div>

          {/* Tabs for Additional Information */}
          <div className="mt-8">
            <DetailsTabs puppy={puppy} />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default PuppyDetails;
