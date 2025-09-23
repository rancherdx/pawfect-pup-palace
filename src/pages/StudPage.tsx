
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import StudServiceCard from "@/components/financing/StudServiceCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarClock, PawPrint, Award, HeartHandshake } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * @component StudPage
 * @description This page showcases the available stud dogs for breeding services. It fetches
 * a list of stud dogs from the database, allows users to filter them by breed and search
 * by name, and displays the results in a card format. It also provides information
 * about the stud service process.
 *
 * @returns {JSX.Element} The rendered stud service page.
 */
const StudPage = () => {
  const [selectedBreed, setSelectedBreed] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch stud dogs from Supabase
  const { data: studDogs, isLoading, isError } = useQuery({
    queryKey: ["stud-dogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stud_dogs')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform to match expected format
      return data?.map(dog => ({
        id: dog.id,
        name: dog.name,
        breed: dog.breed_id, // This might need adjustment based on actual data structure
        age: dog.age,
        certifications: dog.certifications || [],
        temperament: dog.temperament || "",
        price: dog.stud_fee,
        image: dog.image_urls?.[0] || '/placeholder.svg'
      })) || [];
    }
  });
  
  const breeds = studDogs ? Array.from(new Set(studDogs.map(dog => dog.breed))) : [];
  
  /**
   * @constant filteredDogs
   * @description An array of stud dogs filtered based on the selected breed and search term.
   */
  const filteredDogs = studDogs?.filter(dog => {
    const matchesBreed = !selectedBreed || dog.breed === selectedBreed;
    const matchesSearch = !searchTerm || 
      dog.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      dog.breed.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBreed && matchesSearch;
  });

  if (isLoading) {
    return (
      <div>
        <HeroSection
          title="Stud Service"
          subtitle="Premium quality stud dogs with excellent genetics and temperament"
          imageSrc="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3"
          ctaText="Contact Us"
          ctaLink="/contact"
        />
        <Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </Section>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <HeroSection
          title="Stud Service"
          subtitle="Premium quality stud dogs with excellent genetics and temperament"
          imageSrc="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3"
          ctaText="Contact Us"
          ctaLink="/contact"
        />
        <Section>
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-4">Unable to load stud dogs</h3>
            <p className="text-muted-foreground mb-6">
              There was an error loading our stud dogs. Please try again later.
            </p>
            <Button asChild>
              <a href="/contact">Contact Us</a>
            </Button>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div>
      <HeroSection
        title="Stud Service"
        subtitle="Premium quality stud dogs with excellent genetics and temperament"
        imageSrc="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3"
        ctaText="Contact Us"
        ctaLink="/contact"
      />
      
      <Section>
        <div className="bg-card p-4 rounded-lg shadow mb-8 border border-brand-red/20">
          <h2 className="text-xl font-semibold mb-4">Find the Perfect Stud</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Filter by Breed</Label>
              <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                <SelectTrigger id="breed">
                  <SelectValue placeholder="All Breeds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={undefined}>All Breeds</SelectItem>
                  {breeds.map(breed => (
                    <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name or breed"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {filteredDogs && filteredDogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDogs.map(dog => (
              <StudServiceCard key={dog.id} dog={dog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <PawPrint className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No stud dogs found</h3>
            <p className="text-muted-foreground mb-4">
              {studDogs?.length === 0 
                ? "No stud dogs are currently available. Check back soon!" 
                : "Try adjusting your filters"
              }
            </p>
            <Button onClick={() => { setSelectedBreed(undefined); setSearchTerm(""); }}>
              Reset Filters
            </Button>
          </div>
        )}
      </Section>
      
      <Section className="bg-muted/50 paw-print-bg">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Our Stud Service Process</h2>
          <p className="mb-8">
            We provide high-quality stud services with proven genetic lines and health-tested dogs. 
            Each stud dog comes with comprehensive health certifications and excellent temperament.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-puppy border border-brand-red/20">
              <div className="w-12 h-12 rounded-full bg-brand-red text-white font-bold flex items-center justify-center mx-auto mb-4">
                <PawPrint className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Select a Stud</h3>
              <p className="text-sm">Browse our collection of premium stud dogs and select one that matches your needs.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-puppy border border-brand-red/20">
              <div className="w-12 h-12 rounded-full bg-brand-red text-white font-bold flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Health Verification</h3>
              <p className="text-sm">We'll verify all health certifications and ensure both dogs are a good match.</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow-puppy border border-brand-red/20">
              <div className="w-12 h-12 rounded-full bg-brand-red text-white font-bold flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Service & Support</h3>
              <p className="text-sm">Our team provides full support throughout the breeding process and beyond.</p>
            </div>
          </div>
          
          <div className="mt-12 bg-card p-6 rounded-lg shadow-lg border border-brand-red/30">
            <CalendarClock className="h-10 w-10 mx-auto text-brand-red mb-4" />
            <h3 className="font-bold text-xl mb-2">Scheduling a Stud Service</h3>
            <p className="mb-4">
              The best timing for breeding is determined by your female's heat cycle. 
              Our team can help coordinate the optimal dates for successful breeding.
            </p>
            <Button asChild size="lg" className="bg-brand-red hover:bg-red-700">
              <a href="/contact">Schedule a Consultation</a>
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default StudPage;
