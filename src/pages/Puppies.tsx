
import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import PuppyCard from "@/components/PuppyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Mock data for available puppies
const puppiesData = [
  {
    id: "1",
    name: "Bella",
    breed: "Golden Retriever",
    age: "8 weeks",
    gender: "Female",
    imageSrc: "https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    price: 1200,
    available: true,
  },
  {
    id: "2",
    name: "Max",
    breed: "German Shepherd",
    age: "10 weeks",
    gender: "Male",
    imageSrc: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    price: 1400,
    available: true,
  },
  {
    id: "3",
    name: "Luna",
    breed: "Labrador Retriever",
    age: "9 weeks",
    gender: "Female",
    imageSrc: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    price: 1100,
    available: true,
  },
  {
    id: "4",
    name: "Rocky",
    breed: "Boxer",
    age: "12 weeks",
    gender: "Male",
    imageSrc: "https://images.unsplash.com/photo-1592754862816-1a21a4ea2281?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    price: 1300,
    available: false,
  },
  {
    id: "5",
    name: "Charlie",
    breed: "Beagle",
    age: "10 weeks",
    gender: "Male",
    imageSrc: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=685&q=80",
    price: 950,
    available: true,
  },
  {
    id: "6",
    name: "Daisy",
    breed: "Poodle",
    age: "11 weeks",
    gender: "Female",
    imageSrc: "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80",
    price: 1250,
    available: true,
  },
];

const breeds = ["All Breeds", "Golden Retriever", "German Shepherd", "Labrador Retriever", "Boxer", "Beagle", "Poodle"];

const Puppies = () => {
  const [selectedBreed, setSelectedBreed] = useState("All Breeds");
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [currentPuppies, setCurrentPuppies] = useState(puppiesData);

  const handleFilter = () => {
    let filtered = puppiesData;
    
    if (selectedBreed !== "All Breeds") {
      filtered = filtered.filter(puppy => puppy.breed === selectedBreed);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(puppy => 
        puppy.name.toLowerCase().includes(term) || 
        puppy.breed.toLowerCase().includes(term)
      );
    }
    
    if (showOnlyAvailable) {
      filtered = filtered.filter(puppy => puppy.available);
    }
    
    setCurrentPuppies(filtered);
  };

  const resetFilters = () => {
    setSelectedBreed("All Breeds");
    setSearchTerm("");
    setShowOnlyAvailable(false);
    setCurrentPuppies(puppiesData);
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

        {/* Puppies Grid */}
        {currentPuppies.length > 0 ? (
          <div className="puppy-card-grid">
            {currentPuppies.map((puppy) => (
              <PuppyCard
                key={puppy.id}
                id={puppy.id}
                name={puppy.name}
                breed={puppy.breed}
                age={puppy.age}
                gender={puppy.gender}
                imageSrc={puppy.imageSrc}
                price={puppy.price}
                available={puppy.available}
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
      </Section>
    </div>
  );
};

export default Puppies;
