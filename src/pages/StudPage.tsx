
import React, { useState } from "react";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import StudServiceCard from "@/components/financing/StudServiceCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CalendarClock, PawPrint, Award, HeartHandshake } from "lucide-react";

const STUD_DOGS = [
  {
    id: "stud1",
    name: "Zeus",
    breed: "German Shepherd",
    age: 4,
    certifications: ["AKC Certified", "OFA Hip Good", "OFA Elbow Normal"],
    temperament: "Confident, alert and fearless with a strong territorial instinct",
    price: 1800,
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3"
  },
  {
    id: "stud2",
    name: "Apollo",
    breed: "Golden Retriever",
    age: 3,
    certifications: ["AKC Certified", "OFA Heart Clear", "CERF Clear"],
    temperament: "Friendly, reliable, and trustworthy with an eager-to-please attitude",
    price: 1600,
    image: "https://images.unsplash.com/photo-1561298169-9db0d83ab716?ixlib=rb-4.0.3"
  },
  {
    id: "stud3",
    name: "Thor",
    breed: "Labrador Retriever",
    age: 4,
    certifications: ["AKC Certified", "OFA Hip Excellent", "OFA Elbows Normal", "EIC Clear"],
    temperament: "Kind, outgoing, and eager to please with strong retrieving instincts",
    price: 1700,
    image: "https://images.unsplash.com/photo-1600804340584-c7db2eacf0bf?ixlib=rb-4.0.3"
  },
  {
    id: "stud4",
    name: "Rocky",
    breed: "French Bulldog",
    age: 3,
    certifications: ["AKC Certified", "BAER Hearing Test", "Cardiac Clear"],
    temperament: "Playful, alert, adaptable with a sweet and affectionate nature",
    price: 2200,
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3"
  }
];

const StudPage = () => {
  const [selectedBreed, setSelectedBreed] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Simulate fetching stud dogs from API
  const { data: studDogs, isLoading } = useQuery({
    queryKey: ["stud-dogs"],
    queryFn: async () => {
      // In a real app, this would fetch from an API
      // For now, just return the mock data with a slight delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return STUD_DOGS;
    }
  });
  
  const breeds = Array.from(new Set(STUD_DOGS.map(dog => dog.breed)));
  
  // Filter stud dogs based on selected filters
  const filteredDogs = studDogs?.filter(dog => {
    const matchesBreed = !selectedBreed || dog.breed === selectedBreed;
    const matchesSearch = !searchTerm || 
      dog.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      dog.breed.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBreed && matchesSearch;
  });

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
        
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDogs && filteredDogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDogs.map(dog => (
              <StudServiceCard key={dog.id} dog={dog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No stud dogs found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
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
