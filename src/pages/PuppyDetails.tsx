
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Share2, Calendar, PawPrint, Info, Clipboard } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import Section from "@/components/Section";

// Mock data for puppy details
const puppiesData = [
  {
    id: "1",
    name: "Bella",
    breed: "Golden Retriever",
    age: "8 weeks",
    gender: "Female",
    images: [
      "https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=736&q=80",
      "https://images.unsplash.com/photo-1652531661755-f234b7fda163?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
    ],
    price: 1200,
    available: true,
    description: "Bella is a beautiful Golden Retriever puppy with a playful personality. She loves to cuddle and play fetch. She's well-socialized with children and other pets.",
    parents: {
      dad: {
        name: "Max",
        age: "3 years",
        weight: "70 lbs",
        image: "https://images.unsplash.com/photo-1565708097881-9300cc0f2997?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
      },
      mom: {
        name: "Lucy",
        age: "2 years",
        weight: "65 lbs",
        image: "https://images.unsplash.com/photo-1611250282006-4484dd3fba6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
      }
    },
    birthDate: "March 15, 2023",
    weight: "7 lbs",
    color: "Golden",
    vaccinations: "First round completed",
    microchipped: true
  },
  // Add more puppies as needed...
];

const PuppyDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Find the puppy based on the ID from the URL
  const puppy = puppiesData.find(p => p.id === id);

  // If puppy is not found, show a message
  if (!puppy) {
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

  const handleFavorite = () => {
    toast({
      title: `${puppy.name} added to favorites!`,
      description: "Check your favorites list to see all your loved puppies."
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied to clipboard!",
      description: "Share this puppy with your friends and family."
    });
  };

  return (
    <div>
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Puppy Images */}
          <div>
            <div className="rounded-lg overflow-hidden shadow-lg mb-4 h-80 bg-muted">
              <img 
                src={puppy.images[currentImageIndex]} 
                alt={puppy.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {puppy.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`rounded overflow-hidden h-20 ${
                    index === currentImageIndex ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <img 
                    src={image} 
                    alt={`${puppy.name} ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Puppy Info */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{puppy.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-muted-foreground">{puppy.breed}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{puppy.age}</span>
                </div>
              </div>
              <Badge className={puppy.available ? "bg-green-500" : "bg-gray-500"}>
                {puppy.available ? "Available" : "Reserved"}
              </Badge>
            </div>

            <div className="text-2xl font-semibold mb-4 text-primary">${puppy.price}</div>

            <p className="mb-6">{puppy.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Birth Date</div>
                  <div className="font-medium">{puppy.birthDate}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Gender</div>
                  <div className="font-medium">{puppy.gender}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <PawPrint className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Color</div>
                  <div className="font-medium">{puppy.color}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {puppy.available ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-red hover:bg-red-700 text-white"
                >
                  <Link to={`/adopt?puppy=${puppy.id}`}>
                    Start Adoption Process
                  </Link>
                </Button>
              ) : (
                <Button disabled size="lg">
                  Already Reserved
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleFavorite}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  <span>Save</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Additional Information */}
        <div className="mt-8">
          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="parents" className="flex-1">Parents</TabsTrigger>
              <TabsTrigger value="health" className="flex-1">Health</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">About {puppy.name}</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <h3 className="text-sm text-muted-foreground">Breed</h3>
                    <p className="font-medium">{puppy.breed}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground">Age</h3>
                    <p className="font-medium">{puppy.age}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground">Gender</h3>
                    <p className="font-medium">{puppy.gender}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground">Weight</h3>
                    <p className="font-medium">{puppy.weight}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground">Color</h3>
                    <p className="font-medium">{puppy.color}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground">Birth Date</h3>
                    <p className="font-medium">{puppy.birthDate}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="parents" className="mt-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Parents</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Dad */}
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={puppy.parents.dad.image} 
                        alt={puppy.parents.dad.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">Dad: {puppy.parents.dad.name}</h3>
                      <p className="text-sm text-muted-foreground">Age: {puppy.parents.dad.age}</p>
                      <p className="text-sm text-muted-foreground">Weight: {puppy.parents.dad.weight}</p>
                    </div>
                  </div>

                  {/* Mom */}
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={puppy.parents.mom.image} 
                        alt={puppy.parents.mom.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">Mom: {puppy.parents.mom.name}</h3>
                      <p className="text-sm text-muted-foreground">Age: {puppy.parents.mom.age}</p>
                      <p className="text-sm text-muted-foreground">Weight: {puppy.parents.mom.weight}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="health" className="mt-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Health Information</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm text-muted-foreground">Vaccinations</h3>
                    <p className="font-medium">{puppy.vaccinations}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground">Microchipped</h3>
                    <p className="font-medium">{puppy.microchipped ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground">Health Guarantee</h3>
                    <p className="font-medium">All our puppies come with a 1-year genetic health guarantee.</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-muted-foreground">Veterinary Check</h3>
                    <p className="font-medium">Complete health check done on April 25, 2023</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Section>
    </div>
  );
};

export default PuppyDetails;
