import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Heart, Share2, Calendar, PawPrint, Info, Clipboard, Dog, Award, Pill } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Section from "@/components/Section";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
    status: "Available",
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
    microchipped: true,
    temperament: ["Friendly", "Playful", "Gentle"],
    trainability: 80,
    activityLevel: 70,
    sizeMaturity: "Large",
    feedingNotes: "3 meals daily of high-quality puppy food",
    careTips: [
      "Regular grooming required",
      "Daily exercise needed",
      "Socialization important at this age"
    ],
    lastCheckup: "April 10, 2023",
    growthProgress: 15
  },
  // Add more puppies as needed...
];

// Calculate age in a fun way 
const calculateAge = (birthdayStr: string) => {
  const birthday = new Date(birthdayStr);
  const today = new Date();
  
  // Calculate the time difference in milliseconds
  const diffTime = Math.abs(today.getTime() - birthday.getTime());
  
  // Calculate years, months, weeks
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
  const diffWeeks = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24 * 7));
  
  let ageDisplay = "";
  
  if (diffYears > 0) {
    ageDisplay += `${diffYears} year${diffYears > 1 ? 's' : ''}`;
    if (diffMonths > 0) {
      ageDisplay += ` ${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
  } else if (diffMonths > 0) {
    ageDisplay += `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    if (diffWeeks > 0) {
      ageDisplay += ` ${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
    }
  } else {
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    ageDisplay = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
  
  return ageDisplay;
};

// Get status badge color
const getStatusColor = (status: string) => {
  switch (status) {
    case "Available":
      return "bg-green-500 hover:bg-green-600";
    case "Pending":
      return "bg-yellow-500 hover:bg-yellow-600";
    case "Adopted":
      return "bg-blue-500 hover:bg-blue-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

const PuppyDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [growthAnimation, setGrowthAnimation] = useState(0);
  
  // Find the puppy based on the ID from the URL
  const puppy = puppiesData.find(p => p.id === id);

  // Animation effect for growth progress
  useEffect(() => {
    if (puppy) {
      const timer = setTimeout(() => {
        setGrowthAnimation(puppy.growthProgress || 0);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [puppy]);

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

  // Calculate the puppy's actual age
  const puppyAge = calculateAge(puppy.birthDate);

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
    <div className="bg-background/50 relative">
      <div className="absolute inset-0 paw-print-bg opacity-5 pointer-events-none"></div>
      
      <Section>
        <div className="max-w-7xl mx-auto">
          {/* Puppy Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Puppy Images Carousel */}
            <div className="space-y-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {puppy.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="rounded-xl overflow-hidden shadow-lg h-[400px] bg-muted">
                        <img 
                          src={image} 
                          alt={`${puppy.name} ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
              
              <div className="grid grid-cols-4 gap-2">
                {puppy.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`rounded-lg overflow-hidden h-20 ${
                      index === currentImageIndex ? "ring-2 ring-brand-red" : ""
                    } hover:opacity-90 transition-all`}
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
                  <h1 className="text-3xl md:text-4xl font-bold relative inline-block">
                    {puppy.name}
                    <span className="absolute -bottom-1 left-0 right-0 h-1 bg-brand-red/50 rounded-full"></span>
                  </h1>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-muted-foreground">{puppy.breed}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{puppy.gender}</span>
                  </div>
                </div>
                <Badge className={`${getStatusColor(puppy.status)} text-white px-3 py-1`}>
                  {puppy.status}
                </Badge>
              </div>

              <div className="text-2xl font-semibold mb-4 text-brand-red">${puppy.price}</div>

              <p className="mb-6 text-lg">{puppy.description}</p>

              {/* Growth Progress */}
              <Card className="mb-6 overflow-hidden border-none shadow-md bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/20 dark:to-orange-950/20">
                <CardContent className="p-4">
                  <div className="flex justify-between mb-1 text-sm">
                    <span className="font-medium flex items-center">
                      <PawPrint className="h-4 w-4 mr-1 text-brand-red" /> Puppy
                    </span>
                    <span className="font-medium flex items-center">
                      Adult Dog <Dog className="h-4 w-4 ml-1" />
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={growthAnimation} className="h-3" />
                    <div 
                      className="absolute top-0 h-full w-[3px] bg-yellow-400 transition-all duration-300"
                      style={{ left: `${growthAnimation}%` }}
                    />
                  </div>
                  <div className="text-xs text-center mt-1">Growth: {growthAnimation}%</div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-muted/30 rounded-lg p-3 flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-brand-red" />
                  <div>
                    <div className="text-sm text-muted-foreground">Age</div>
                    <div className="font-medium">{puppyAge}</div>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 flex items-center space-x-3">
                  <PawPrint className="h-5 w-5 text-brand-red" />
                  <div>
                    <div className="text-sm text-muted-foreground">Weight</div>
                    <div className="font-medium">{puppy.weight}</div>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 flex items-center space-x-3">
                  <Info className="h-5 w-5 text-brand-red" />
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
                    className="w-full hover:bg-red-100 dark:hover:bg-red-900/20"
                    onClick={handleFavorite}
                  >
                    <Heart className="h-5 w-5 mr-2 text-brand-red" />
                    <span>Save</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full hover:bg-red-100 dark:hover:bg-red-900/20"
                    onClick={handleShare}
                  >
                    <Share2 className="h-5 w-5 mr-2 text-brand-red" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Temperament & Traits Card */}
          <div className="mt-8 mb-12">
            <Card className="shadow-md border-none overflow-hidden bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/20 dark:to-orange-950/20">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-brand-red" />
                  Temperament & Traits
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Temperament */}
                  <div>
                    <h3 className="font-medium mb-3">Temperament</h3>
                    <div className="flex flex-wrap gap-2">
                      {puppy.temperament?.map((trait, index) => (
                        <Badge key={index} variant="outline" className="bg-background/80 py-1 px-3">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Trainability */}
                  <div>
                    <h3 className="font-medium mb-3">Trainability</h3>
                    <div className="space-y-2">
                      <Progress value={puppy.trainability} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Needs Guidance</span>
                        <span>Highly Trainable</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Activity Level */}
                  <div>
                    <h3 className="font-medium mb-3">Activity Level</h3>
                    <div className="space-y-2">
                      <Progress value={puppy.activityLevel} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Relaxed</span>
                        <span>Very Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Additional Information */}
          <div className="mt-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-3 mb-6">
                <TabsTrigger value="details" className="data-[state=active]:text-brand-red data-[state=active]:border-b-2 data-[state=active]:border-brand-red">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="health" className="data-[state=active]:text-brand-red data-[state=active]:border-b-2 data-[state=active]:border-brand-red">
                  <Pill className="h-4 w-4 mr-2" />
                  Health
                </TabsTrigger>
                <TabsTrigger value="parents" className="data-[state=active]:text-brand-red data-[state=active]:border-b-2 data-[state=active]:border-brand-red">
                  <Dog className="h-4 w-4 mr-2" />
                  Parents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 animate-fade-in">
                <Card className="shadow-md">
                  <CardContent className="p-6">
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
                      <div>
                        <h3 className="text-sm text-muted-foreground">Size at Maturity</h3>
                        <p className="font-medium">{puppy.sizeMaturity || "Average"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm text-muted-foreground">Microchipped</h3>
                        <p className="font-medium">{puppy.microchipped ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="health" className="mt-4 animate-fade-in">
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Pill className="h-5 w-5 mr-2 text-brand-red" />
                      Health Dashboard
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-md font-medium">Vaccinations</h3>
                          <p className="text-muted-foreground">{puppy.vaccinations}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-md font-medium">Last Checkup</h3>
                          <p className="text-muted-foreground">{puppy.lastCheckup || "No checkups yet"}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-md font-medium">Feeding Notes</h3>
                          <p className="text-muted-foreground">{puppy.feedingNotes || "Standard puppy diet recommended"}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium mb-2">Care Tips</h3>
                        {puppy.careTips && puppy.careTips.length > 0 ? (
                          <ul className="space-y-2">
                            {puppy.careTips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <PawPrint className="h-4 w-4 mr-2 text-brand-red flex-shrink-0 mt-1" />
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground">General care guidelines will be provided</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        All our puppies come with a 1-year genetic health guarantee and have received appropriate vaccinations for their age.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="parents" className="mt-4 animate-fade-in">
                <Card className="shadow-md">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Meet the Parents</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Dad */}
                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex space-x-4">
                          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand-red/20">
                            <img 
                              src={puppy.parents?.dad?.image} 
                              alt={puppy.parents?.dad?.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Dad: {puppy.parents?.dad?.name}</h3>
                            <p className="text-sm text-muted-foreground">Age: {puppy.parents?.dad?.age}</p>
                            <p className="text-sm text-muted-foreground">Weight: {puppy.parents?.dad?.weight}</p>
                          </div>
                        </div>
                      </div>

                      {/* Mom */}
                      <div className="bg-muted/30 rounded-xl p-4">
                        <div className="flex space-x-4">
                          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand-red/20">
                            <img 
                              src={puppy.parents?.mom?.image} 
                              alt={puppy.parents?.mom?.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">Mom: {puppy.parents?.mom?.name}</h3>
                            <p className="text-sm text-muted-foreground">Age: {puppy.parents?.mom?.age}</p>
                            <p className="text-sm text-muted-foreground">Weight: {puppy.parents?.mom?.weight}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default PuppyDetails;
