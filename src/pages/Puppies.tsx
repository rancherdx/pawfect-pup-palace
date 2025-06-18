
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import PuppyCard from "@/components/PuppyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { puppiesApi } from "@/api";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateAge } from "@/utils/dateUtils";

const Puppies = () => {
  const [selectedBreed, setSelectedBreed] = useState("All Breeds");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [breeds, setBreeds] = useState<string[]>([]);
  
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['puppies'],
    queryFn: () => puppiesApi.getAllPuppies(),
  });

  const [filteredPuppies, setFilteredPuppies] = useState<any[]>([]);

  useEffect(() => {
    if (data?.puppies) {
      const uniqueBreeds = Array.from(new Set(
        data.puppies
          .map((puppy: any) => {
            const breed = puppy.breed || puppy.breed_name;
            return typeof breed === 'string' ? breed : '';
          })
          .filter((breed: string) => breed.length > 0)
      )) as string[];
      setBreeds(["All Breeds", ...uniqueBreeds]);
      setFilteredPuppies(data.puppies);
    }
  }, [data]);

  const handleFilter = () => {
    if (!data?.puppies) return;
    
    let filtered = data.puppies;
    
    if (selectedBreed !== "All Breeds") {
      filtered = filtered.filter((puppy: any) => {
        const puppyBreed = typeof puppy.breed === 'string' ? puppy.breed : '';
        return puppyBreed === selectedBreed;
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((puppy: any) => 
        puppy.name?.toLowerCase().includes(term) || 
        (typeof puppy.breed === 'string' && puppy.breed.toLowerCase().includes(term))
      );
    }
    
    if (showOnlyAvailable) {
      filtered = filtered.filter((puppy: any) => puppy.status === 'Available');
    }
    
    setFilteredPuppies(filtered);
  };

  const resetFilters = () => {
    setSelectedBreed("All Breeds");
    setSearchTerm("");
    setShowOnlyAvailable(false);
    if (data?.puppies) {
      setFilteredPuppies(data.puppies);
    }
  };

  return (
    <div>
      <HeroSection
        title="Available Puppies"
        subtitle="Meet our adorable puppies looking for their forever homes"
        imageSrc="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
        ctaText="Adopt Now"
        ctaLink="/adopt"
      />

      <Section>
        {/* Filter Section */}
        <div className="bg-card p-4 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter Puppies</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Select value={selectedBreed} onValueChange={setSelectedBreed}>
                <SelectTrigger id="breed">
                  <SelectValue placeholder="Select breed" />
                </SelectTrigger>
                <SelectContent>
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="available" 
                  checked={showOnlyAvailable}
                  onCheckedChange={(checked) => setShowOnlyAvailable(checked === true)}
                />
                <Label htmlFor="available">Show only available</Label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={resetFilters}>Reset</Button>
            <Button onClick={handleFilter}>Apply Filters</Button>
          </div>
        </div>

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
            {filteredPuppies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPuppies.map((puppy) => (
                  <PuppyCard
                    key={puppy.id}
                    id={puppy.id.toString()}
                    name={puppy.name}
                    breed={typeof puppy.breed === 'string' ? puppy.breed : ''}
                    age={calculateAge(puppy.birthDate)}
                    gender={puppy.gender}
                    imageSrc={puppy.photoUrl || "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3"}
                    price={puppy.price}
                    status={puppy.status || 'Available'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No puppies found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters to see more results.
                </p>
                <Button className="mt-4" onClick={resetFilters}>Reset Filters</Button>
              </div>
            )}
          </>
        )}
      </Section>
    </div>
  );
};

export default Puppies;
