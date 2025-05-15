
import { useState } from "react";
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
  Calendar
} from "lucide-react";

// Sample data for litters
const litterData = [
  {
    id: "l1",
    name: "Luna & Max's Spring Litter",
    breed: "Golden Retriever",
    birthDate: "2024-01-15",
    availability: "Some Available",
    coverImage: "https://images.unsplash.com/photo-1611250282006-4484dd3fba6f?ixlib=rb-4.0.3",
    damName: "Luna",
    sireName: "Max",
    description: "A beautiful litter of golden retriever puppies with excellent temperaments and health clearances. These puppies come from champion bloodlines.",
    puppies: [
      {
        id: "p1",
        name: "Bella",
        gender: "Female",
        color: "Light Golden",
        price: 1800,
        image: "https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3",
        status: "Available",
        reservable: true
      },
      {
        id: "p2",
        name: "Charlie",
        gender: "Male",
        color: "Golden",
        price: 1800,
        image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?ixlib=rb-4.0.3",
        status: "Reserved",
        reservable: false
      },
      {
        id: "p3",
        name: "Lucy",
        gender: "Female",
        color: "Dark Golden",
        price: 1800,
        image: "https://images.unsplash.com/photo-1652531661755-f234b7fda163?ixlib=rb-4.0.3",
        status: "Available",
        reservable: true
      }
    ]
  },
  {
    id: "l2",
    name: "Bailey & Cooper's Winter Litter",
    breed: "Labrador Retriever",
    birthDate: "2023-12-10",
    availability: "Limited Availability",
    coverImage: "https://images.unsplash.com/photo-1560743641-3914f2c45636?ixlib=rb-4.0.3",
    damName: "Bailey",
    sireName: "Cooper",
    description: "Healthy and playful lab puppies with excellent genetic background. These puppies are socialized from an early age and will make wonderful family pets.",
    puppies: [
      {
        id: "p4",
        name: "Rocky",
        gender: "Male",
        color: "Chocolate",
        price: 1500,
        image: "https://images.unsplash.com/photo-1605897472359-5624cca67d4c?ixlib=rb-4.0.3",
        status: "Reserved",
        reservable: false
      },
      {
        id: "p5",
        name: "Daisy",
        gender: "Female",
        color: "Yellow",
        price: 1500,
        image: "https://images.unsplash.com/photo-1590507076166-8c0917f543c6?ixlib=rb-4.0.3",
        status: "Available",
        reservable: true
      },
      {
        id: "p6",
        name: "Buddy",
        gender: "Male",
        color: "Black",
        price: 1500,
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3",
        status: "Available",
        reservable: true
      },
      {
        id: "p7",
        name: "Molly",
        gender: "Female",
        color: "Chocolate",
        price: 1500,
        image: "https://images.unsplash.com/photo-1597237154674-1a0d2274cef4?ixlib=rb-4.0.3",
        status: "Adopted",
        reservable: false
      }
    ]
  },
  {
    id: "l3",
    name: "Rosie & Duke's Fall Litter",
    breed: "French Bulldog",
    birthDate: "2023-11-05",
    availability: "All Reserved",
    coverImage: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3",
    damName: "Rosie",
    sireName: "Duke",
    description: "Adorable Frenchie puppies with excellent structure and charming personalities. Health tested parents with AKC registration.",
    puppies: [
      {
        id: "p8",
        name: "Milo",
        gender: "Male",
        color: "Fawn",
        price: 3500,
        image: "https://images.unsplash.com/photo-1575425186775-b8de9a427e67?ixlib=rb-4.0.3",
        status: "Reserved",
        reservable: false
      },
      {
        id: "p9",
        name: "Sophie",
        gender: "Female",
        color: "Brindle",
        price: 3500,
        image: "https://images.unsplash.com/photo-1521907236370-15c67b6c0255?ixlib=rb-4.0.3",
        status: "Reserved",
        reservable: false
      },
      {
        id: "p10",
        name: "Oliver",
        gender: "Male",
        color: "Blue",
        price: 4000,
        image: "https://images.unsplash.com/photo-1541364983171-a8ba01e95cfc?ixlib=rb-4.0.3",
        status: "Reserved",
        reservable: false
      }
    ]
  }
];

// Get badge color based on status
const getStatusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "bg-green-500 hover:bg-green-600";
    case "Reserved":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "Adopted":
      return "bg-blue-500 hover:bg-blue-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

// Calculate age in weeks
const calculateAge = (birthdayStr: string) => {
  const birthday = new Date(birthdayStr);
  const today = new Date();
  
  // Calculate the time difference in milliseconds
  const diffTime = Math.abs(today.getTime() - birthday.getTime());
  
  // Calculate weeks
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  return diffWeeks;
};

const Litters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  
  // Gather all unique breeds from the data
  const allBreeds = Array.from(new Set(litterData.map(litter => litter.breed)));
  
  // Filter litters based on search and filters
  const filteredLitters = litterData.filter(litter => {
    // Search query filter
    const matchesSearch = 
      litter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      litter.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      litter.puppies.some(puppy => 
        puppy.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
    // Breed filter
    const matchesBreed = 
      selectedBreeds.length === 0 || 
      selectedBreeds.includes(litter.breed);
      
    // Check if any puppy matches the price range
    const matchesPrice = litter.puppies.some(
      puppy => puppy.price >= priceRange[0] && puppy.price <= priceRange[1]
    );
    
    // Check if litter matches availability filter
    const matchesAvailability = 
      availabilityFilter.length === 0 || 
      (
        (availabilityFilter.includes("available") && 
         litter.puppies.some(puppy => puppy.status === "Available")) ||
        (availabilityFilter.includes("reserved") && 
         litter.puppies.some(puppy => puppy.status === "Reserved")) ||
        (availabilityFilter.includes("adopted") && 
         litter.puppies.some(puppy => puppy.status === "Adopted"))
      );
    
    return matchesSearch && matchesBreed && matchesPrice && matchesAvailability;
  });
  
  // Get all puppies from all litters for the "All Puppies" tab
  const allPuppies = filteredLitters.flatMap(litter => 
    litter.puppies.map(puppy => ({
      ...puppy,
      breed: litter.breed,
      age: `${calculateAge(litter.birthDate)} weeks`,
      litterName: litter.name,
      litterid: litter.id
    }))
  );
  
  // Handle breed selection
  const toggleBreedFilter = (breed: string) => {
    if (selectedBreeds.includes(breed)) {
      setSelectedBreeds(selectedBreeds.filter(b => b !== breed));
    } else {
      setSelectedBreeds([...selectedBreeds, breed]);
    }
  };
  
  // Handle availability filter
  const toggleAvailabilityFilter = (availability: string) => {
    if (availabilityFilter.includes(availability)) {
      setAvailabilityFilter(availabilityFilter.filter(a => a !== availability));
    } else {
      setAvailabilityFilter([...availabilityFilter, availability]);
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 5000]);
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
                        checked={availabilityFilter.includes("available")}
                        onChange={() => toggleAvailabilityFilter("available")}
                        className="rounded text-green-500 focus:ring-green-500"
                      />
                      <span>Available</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availabilityFilter.includes("reserved")}
                        onChange={() => toggleAvailabilityFilter("reserved")}
                        className="rounded text-yellow-500 focus:ring-yellow-500"
                      />
                      <span>Reserved</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availabilityFilter.includes("adopted")}
                        onChange={() => toggleAvailabilityFilter("adopted")}
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                      <span>Adopted</span>
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
          {filteredLitters.length === 0 ? (
            <div className="text-center py-12">
              <PawPrint className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold mt-4">No Litters Found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters to see more results</p>
              <Button onClick={resetFilters}>
                Reset All Filters
              </Button>
            </div>
          ) : (
            filteredLitters.map((litter) => (
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
                        src={litter.coverImage} 
                        alt={litter.name} 
                        className="w-full h-full object-cover object-center" 
                      />
                    </div>
                    
                    {/* Litter Info */}
                    <div className="md:w-2/3 p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h2 className="text-2xl font-bold">{litter.name}</h2>
                        <Badge className={`
                          ${litter.availability === "All Reserved" 
                            ? "bg-yellow-500" 
                            : litter.availability === "Some Available" 
                              ? "bg-green-500" 
                              : "bg-blue-500"
                          } text-white px-3 py-1`}
                        >
                          {litter.availability}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">{litter.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <Dog className="h-4 w-4 text-brand-red" />
                          <span className="text-sm">Breed: {litter.breed}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-brand-red" />
                          <span className="text-sm">
                            Age: {calculateAge(litter.birthDate)} weeks
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4 text-brand-red" />
                          <span className="text-sm">
                            Parents: {litter.damName} & {litter.sireName}
                          </span>
                        </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                  {litter.puppies.map((puppy) => (
                    <Card 
                      key={puppy.id} 
                      className="overflow-hidden border-none shadow-puppy group hover-scale transition-all duration-300"
                    >
                      <div className="relative">
                        <img 
                          src={puppy.image} 
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
                          <span className="text-sm text-muted-foreground">{puppy.gender}</span>
                          <span className="text-sm font-medium">${puppy.price}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground mb-4">
                          <Dog className="h-3 w-3 mr-1" />
                          <span>{puppy.color} {litter.breed}</span>
                        </div>
                        
                        {puppy.reservable ? (
                          <Button 
                            asChild
                            className="w-full bg-brand-red hover:bg-red-700 text-white"
                          >
                            <Link to={`/puppies/${puppy.id}`}>
                              View Details
                            </Link>
                          </Button>
                        ) : (
                          <Button 
                            asChild
                            variant="outline" 
                            className="w-full"
                          >
                            <Link to={`/puppies/${puppy.id}`}>
                              View Profile
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* All Available Puppies Section */}
        <Section title="All Available Puppies" subtitle="Browse all our puppies in one place" className="mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allPuppies.filter(puppy => puppy.status === "Available").map((puppy) => (
              <PuppyCard
                key={puppy.id}
                id={puppy.id}
                name={puppy.name}
                breed={puppy.breed}
                age={puppy.age}
                gender={puppy.gender}
                imageSrc={puppy.image}
                price={puppy.price}
                available={puppy.status === "Available"}
              />
            ))}
          </div>
          
          {allPuppies.filter(puppy => puppy.status === "Available").length === 0 && (
            <div className="text-center py-12">
              <PawPrint className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold mt-4">No Available Puppies</h3>
              <p className="text-muted-foreground mb-6">Check back soon or contact us for upcoming litters</p>
              <Button asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          )}
        </Section>
      </Section>
    </div>
  );
};

export default Litters;
