
import { useState, useMemo } from "react"; // Added useMemo
import { Link } from "react-router-dom";
import Section from "@/components/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PuppyCard from "@/components/PuppyCard";
import { 
  Search, 
  PawPrint, 
  Filter, 
  ChevronDown, 
  Dog, 
  Heart, 
  Calendar,
  Loader2, // Added
  AlertTriangle // Added
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { littersApi } from "@/api";
import { Litter, LitterListResponse, Puppy, PuppyStatus } from "@/types";


// Get badge color based on status
const getStatusColor = (status: PuppyStatus | string) => { // Accept PuppyStatus or string
  switch (status) {
    case "Available":
      return "bg-green-500 hover:bg-green-600";
    case "Reserved":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "Sold": // Updated to match PuppyStatus
      return "bg-blue-500 hover:bg-blue-600";
    default: // For 'Not For Sale' or any other status
      return "bg-gray-500 hover:bg-gray-600";
  }
};

// Calculate age (more detailed: days, months, years)
const calculateAge = (birthdayStr: string): string => {
  if (!birthdayStr) return "N/A";
  const birthday = new Date(birthdayStr);
  const today = new Date();
  let ageMonths = (today.getFullYear() - birthday.getFullYear()) * 12;
  ageMonths -= birthday.getMonth();
  ageMonths += today.getMonth();

  if (ageMonths < 0) ageMonths = 0;

  if (ageMonths < 1) {
    const diffDays = Math.floor((today.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  }
  if (ageMonths < 12) {
    return `${ageMonths} month${ageMonths === 1 ? '' : 's'}`;
  }
  const ageYears = Math.floor(ageMonths / 12);
  const remainingMonths = ageMonths % 12;
  if (remainingMonths > 0) {
    return `${ageYears} year${ageYears === 1 ? '' : 's'}, ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`;
  }
  return `${ageYears} year${ageYears === 1 ? '' : 's'}`;
};


const Litters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string[]>([]); // Stores "Available", "Reserved", "Sold"
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const { data: littersResponse, isLoading, isError, error } = useQuery<LitterListResponse, Error>({
    queryKey: ['publicLitters'],
    queryFn: () => littersApi.getAll({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });
  const rawLitters: Litter[] = littersResponse?.litters || [];

  const allBreeds = useMemo(() => Array.from(new Set(rawLitters.map(litter => litter.breed))), [rawLitters]);
  
  const filteredLitters = useMemo(() => {
    return rawLitters.filter(litter => {
      const puppiesInLitter = litter.puppies || [];
      const matchesSearch =
        litter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        litter.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        puppiesInLitter.some(puppy =>
          puppy.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesBreed =
        selectedBreeds.length === 0 ||
        selectedBreeds.includes(litter.breed);

      const matchesPrice = puppiesInLitter.length > 0 ? puppiesInLitter.some(
        puppy => puppy.price >= priceRange[0] && puppy.price <= priceRange[1]
      ) : true; // If no puppies, don't filter out by price
      
      const matchesAvailability =
        availabilityFilter.length === 0 ||
        (
          (availabilityFilter.includes("Available") &&
           puppiesInLitter.some(puppy => puppy.status === "Available")) ||
          (availabilityFilter.includes("Reserved") &&
           puppiesInLitter.some(puppy => puppy.status === "Reserved")) ||
          (availabilityFilter.includes("Sold") &&
           puppiesInLitter.some(puppy => puppy.status === "Sold"))
        );
      
      return matchesSearch && matchesBreed && matchesPrice && matchesAvailability;
    });
  }, [rawLitters, searchQuery, selectedBreeds, priceRange, availabilityFilter]);
  
  const allPuppiesForDisplay = useMemo(() => {
    return filteredLitters.flatMap(litter =>
      (litter.puppies || []).map(puppy => ({
        ...puppy,
        breed: litter.breed,
        age: calculateAge(puppy.birthDate || litter.dateOfBirth), // Use puppy's birthDate if available, else litter's
        litterName: litter.name,
        litterId: litter.id,
        imageSrc: puppy.photoUrl,
      }))
    );
  }, [filteredLitters]);
  
  const toggleBreedFilter = (breed: string) => {
    setSelectedBreeds(prev =>
      prev.includes(breed) ? prev.filter(b => b !== breed) : [...prev, breed]
    );
  };
  
  const toggleAvailabilityFilter = (availabilityValue: string) => { // e.g., "Available", "Reserved"
    setAvailabilityFilter(prev =>
      prev.includes(availabilityValue) ? prev.filter(a => a !== availabilityValue) : [...prev, availabilityValue]
    );
  };
  
  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 5000]); // Reset to default max
    setSelectedBreeds([]);
    setAvailabilityFilter([]);
  };

  return (
    <div>
      <Section 
        title="Our Litters" 
        subtitle="Browse our current and past litters to find your perfect puppy companion"
        variant="litter"
        withPawPrintBg
      >
        {/* Search and Filters */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by breed, litter name, or puppy name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${filterMenuOpen ? 'rotate-180' : ''}`} />
            </Button>
          </div>
          
          {filterMenuOpen && (
            <div className="bg-card p-6 rounded-lg shadow-md mb-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Breed Filter */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center">
                    <Dog className="h-4 w-4 mr-2 text-brand-red" />
                    Breed
                  </h3>
                  <div className="space-y-2">
                    {allBreeds.map((breed) => (
                      <label key={breed} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBreeds.includes(breed)}
                          onChange={() => toggleBreedFilter(breed)}
                          className="rounded text-brand-red focus:ring-brand-red"
                        />
                        <span>{breed}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center">
                    <span className="mr-2">$</span>
                    Price Range
                  </h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      min={0}
                      max={5000}
                      step={100}
                      onValueChange={setPriceRange}
                      className="my-5"
                    />
                    <div className="flex justify-between text-sm">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
                
                {/* Availability Filter */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center">
                    <PawPrint className="h-4 w-4 mr-2 text-brand-red" />
                    Availability
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availabilityFilter.includes("Available")}
                        onChange={() => toggleAvailabilityFilter("Available")}
                        className="rounded text-green-500 focus:ring-green-500"
                      />
                      <span>Available</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availabilityFilter.includes("Reserved")}
                        onChange={() => toggleAvailabilityFilter("Reserved")}
                        className="rounded text-yellow-500 focus:ring-yellow-500"
                      />
                      <span>Reserved</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availabilityFilter.includes("Sold")}
                        onChange={() => toggleAvailabilityFilter("Sold")}
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                      <span>Sold</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={resetFilters} className="mr-2">
                  Reset Filters
                </Button>
                <Button 
                  onClick={() => setFilterMenuOpen(false)}
                  className="bg-brand-red hover:bg-red-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>
        
        {/* Litters Display */}
        <div className="space-y-12">
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-brand-red" />
            </div>
          )}
          {isError && (
            <div className="text-center py-20 bg-red-50 p-6 rounded-md">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-red-700">Error Loading Litters</h3>
              <p className="text-muted-foreground mb-4">{error?.message || "An unknown error occurred."}</p>
              {/* Optional: Add a retry button here */}
            </div>
          )}
          {!isLoading && !isError && filteredLitters.length === 0 && (
            <div className="text-center py-12">
              <PawPrint className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold mt-4">
                {rawLitters.length === 0 ? "No Litters Currently Available" : "No Litters Match Your Filters"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {rawLitters.length === 0 ? "Please check back later or contact us." : "Try adjusting your filters to see more results."}
              </p>
              <Button onClick={resetFilters}>
                Reset All Filters
              </Button>
            </div>
          )}
          {!isLoading && !isError && filteredLitters.length > 0 && (
            filteredLitters.map((litter: Litter) => (
              <div key={litter.id} className="animate-fade-in">
                {/* Litter Card */}
                <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/20 dark:to-orange-950/20 rounded-xl overflow-hidden shadow-md mb-6 relative">
                  <div className="absolute -bottom-8 -right-8 opacity-5">
                    <PawPrint className="h-48 w-48" />
                  </div>
                  
                  <div className="md:flex">
                    {/* Litter Image */}
                    <div className="md:w-1/3 h-64 md:h-auto">
                      <img 
                        src={litter.coverImageUrl || "https://via.placeholder.com/400x300?text=Litter+Image"}
                        alt={litter.name} 
                        className="w-full h-full object-cover object-center" 
                      />
                    </div>
                    
                    {/* Litter Info */}
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h2 className="text-2xl font-bold">{litter.name}</h2>
                        <Badge className={`
                          ${litter.status === "All Reserved"
                            ? "bg-yellow-500" 
                            : litter.status === "Active" || litter.status === "Available Soon" || (litter.puppies || []).some(p => p.status === 'Available')
                              ? "bg-green-500" 
                              : "bg-blue-500" // For All Sold or Archived
                          } text-white px-3 py-1`}
                        >
                          {litter.status} {/* Display litter status, or derive a custom one */}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{litter.description || "No description available."}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <Dog className="h-4 w-4 text-brand-red" />
                          <span className="text-sm">Breed: {litter.breed}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-brand-red" />
                          <span className="text-sm">
                            Born: {new Date(litter.dateOfBirth).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-brand-red" />
                          <span className="text-sm">
                            Parents: {litter.damName} & {litter.sireName}
                          </span>
                        </div>
                         {litter.puppyCount !== undefined && (
                          <div className="flex items-center space-x-2">
                            <PawPrint className="h-4 w-4 text-brand-red" />
                            <span className="text-sm">Puppies: {litter.puppyCount}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        className="bg-brand-red hover:bg-red-700 text-white mt-4"
                        asChild
                      >
                        <Link to={`/litters/${litter.id}`}>
                          View Full Litter Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Puppies Grid */}
                {(litter.puppies && litter.puppies.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                    {(litter.puppies || []).map((puppy: Puppy) => (
                      <Card
                        key={puppy.id}
                        className="overflow-hidden border-none shadow-puppy group hover-scale transition-all duration-300"
                      >
                        <div className="relative">
                          <img
                            src={puppy.photoUrl || "https://via.placeholder.com/300x200?text=Puppy+Image"}
                            alt={puppy.name}
                            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <Badge className={`
                            absolute top-3 right-3 ${getStatusColor(puppy.status)} text-white px-3 py-1`}
                          >
                            {puppy.status}
                          </Badge>
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-1">{puppy.name}</h3>
                          <div className="flex justify-between mb-3">
                            <span className="text-sm text-muted-foreground">{puppy.gender || "N/A"}</span>
                            <span className="text-sm font-medium">${puppy.price}</span>
                          </div>

                          <div className="flex items-center text-sm text-muted-foreground mb-4">
                            <Dog className="h-3 w-3 mr-1" />
                            <span>{puppy.color || ""} {litter.breed}</span>
                          </div>

                          <Button 
                              asChild
                              className="w-full bg-brand-red hover:bg-red-700 text-white"
                              disabled={puppy.status !== "Available"}
                            >
                              <Link to={`/puppies/${puppy.id}`}>
                                {puppy.status === "Available" ? "View Details" : puppy.status}
                              </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                 {(!litter.puppies || litter.puppies.length === 0) && (
                  <p className="text-center text-muted-foreground mt-4">No individual puppy information available for this litter yet.</p>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* All Available Puppies Section */}
        <Section title="All Available Puppies" subtitle="Browse all our puppies in one place" className="mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allPuppiesForDisplay.filter(puppy => puppy.status === "Available").map((puppy) => (
              <PuppyCard
                key={puppy.id}
                id={puppy.id}
                name={puppy.name}
                breed={puppy.breed}
                age={puppy.age as string}
                gender={puppy.gender}
                imageSrc={puppy.imageSrc || "https://via.placeholder.com/300x200?text=Puppy"}
                price={puppy.price}
                status={puppy.status as PuppyStatus}
              />
            ))}
          </div>
          
          {!isLoading && !isError && allPuppiesForDisplay.filter(puppy => puppy.status === "Available").length === 0 && (
            <div className="text-center py-12">
              <PawPrint className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold mt-4">No Available Puppies</h3>
              <p className="text-muted-foreground mb-6">Check back soon or contact us for upcoming litters</p>
              <Button asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          )}
           {isLoading && ( // Loading indicator for "All Available Puppies" section as well
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-brand-red" />
            </div>
          )}
        </Section>
      </Section>
    </div>
  );
};

export default Litters;
