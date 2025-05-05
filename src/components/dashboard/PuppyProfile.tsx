
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PawPrint, 
  Calendar, 
  Dog, 
  Bone, 
  Heart, 
  Pill, 
  FileText, 
  MessageSquare,
  Clock,
  ChevronRight,
  ArrowUpRight
} from "lucide-react";
import { 
  ChartContainer, 
  ChartLegend, 
  ChartTooltip, 
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

// Sample data for the puppy profile
const samplePuppyData = {
  id: "p1",
  name: "Bella",
  breed: "Golden Retriever",
  birthDate: "2024-01-15",
  image: "https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3",
  color: "Golden",
  weight: "15 lbs",
  weightHistory: [
    { month: 1, weight: 3.5 },
    { month: 2, weight: 8.2 },
    { month: 3, weight: 15.0 },
    { month: 4, weight: 22.4 },
  ],
  heightHistory: [
    { month: 1, height: 7.5 },
    { month: 2, height: 12.2 },
    { month: 3, height: 16.0 },
    { month: 4, height: 19.4 },
  ],
  status: "With Owner",
  microchipped: true,
  temperament: ["Friendly", "Playful", "Gentle"],
  vaccinations: [
    { name: "DHPP", date: "2024-02-15", due: "2024-05-15" },
    { name: "Rabies", date: "2024-03-10", due: "2025-03-10" },
    { name: "Bordetella", date: "2024-02-28", due: "2024-08-28" }
  ],
  documents: [
    { name: "Adoption Agreement", date: "2024-03-20", type: "legal" },
    { name: "AKC Registration", date: "2024-03-25", type: "registration" },
    { name: "Health Certificate", date: "2024-03-18", type: "health" },
    { name: "Microchip Registration", date: "2024-03-22", type: "registration" }
  ],
  feedingNotes: "3 cups of premium puppy food daily, divided into morning and evening meals. Transition to adult food at 12 months.",
  healthTips: [
    "Regular grooming every 2 weeks",
    "Daily exercise of at least 30 minutes",
    "Schedule dental check at 6 months",
    "Maintain tick and flea prevention monthly"
  ],
  milestones: {
    firstVet: true,
    microchip: true,
    spayNeuter: false,
    basicTraining: true,
    advancedTraining: false
  },
  parentInfo: {
    dam: {
      name: "Luna",
      image: "https://images.unsplash.com/photo-1611250282006-4484dd3fba6f"
    },
    sire: {
      name: "Max",
      image: "https://images.unsplash.com/photo-1565708097881-9300cc0f2997"
    }
  },
  breeder: {
    name: "Golden Days Kennel",
    contact: "contact@goldendayskennel.com"
  },
  messages: [
    {
      sender: "Breeder",
      timestamp: "2024-04-20T14:30:00Z",
      content: "Hi there! Just checking in to see how Bella is doing with her new family."
    },
    {
      sender: "Owner",
      timestamp: "2024-04-20T16:45:00Z",
      content: "She's doing great! Already learning basic commands and loves her new toy."
    },
    {
      sender: "Breeder",
      timestamp: "2024-04-21T10:15:00Z",
      content: "That's wonderful to hear! Remember to schedule her next vet visit in about 2 weeks."
    }
  ]
};

// Calculate age in weeks or months
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

// Calculate growth percentage
const calculateGrowthProgress = (birthdayStr: string, breed: string) => {
  // Estimate when puppy is fully grown based on breed (simplified)
  let fullGrowthMonths = 12; // Default for medium-sized dogs
  
  if (breed.toLowerCase().includes("retriever") || breed.toLowerCase().includes("shepherd")) {
    fullGrowthMonths = 18; // Large breeds
  } else if (breed.toLowerCase().includes("chihuahua") || breed.toLowerCase().includes("terrier")) {
    fullGrowthMonths = 9; // Small breeds
  }
  
  const birthday = new Date(birthdayStr);
  const today = new Date();
  
  // Calculate months since birth
  const diffMonths = (today.getFullYear() - birthday.getFullYear()) * 12 + 
                     today.getMonth() - birthday.getMonth();
  
  // Calculate growth percentage
  let growthPercentage = Math.min(100, Math.round((diffMonths / fullGrowthMonths) * 100));
  
  // For adult dogs, show 100%
  if (diffMonths >= fullGrowthMonths) {
    return 100;
  }
  
  return growthPercentage;
};

const PuppyProfile = () => {
  const [puppy, setPuppy] = useState(samplePuppyData);
  const [growthAnimation, setGrowthAnimation] = useState(0);
  const [newMessage, setNewMessage] = useState("");
  
  // Set up growth animation
  useState(() => {
    setTimeout(() => {
      setGrowthAnimation(calculateGrowthProgress(puppy.birthDate, puppy.breed));
    }, 500);
  });
  
  const age = calculateAge(puppy.birthDate);
  
  // Calculate milestone progress
  const completedMilestones = Object.values(puppy.milestones).filter(Boolean).length;
  const totalMilestones = Object.values(puppy.milestones).length;
  const milestoneProgress = Math.round((completedMilestones / totalMilestones) * 100);
  
  // Setup chart config
  const chartConfig = {
    weight: { color: "#ef4444", label: "Weight (lbs)" },
    height: { color: "#3b82f6", label: "Height (in)" },
  };
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const updatedPuppy = {
      ...puppy,
      messages: [
        ...puppy.messages,
        {
          sender: "Owner",
          timestamp: new Date().toISOString(),
          content: newMessage
        }
      ]
    };
    
    setPuppy(updatedPuppy);
    setNewMessage("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Puppy Profile */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden shadow-puppy bg-card border-none">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={puppy.image} 
                alt={puppy.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-brand-red text-white px-3 py-1">
                  {puppy.status}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl flex items-center">
                <span className="mr-2">{puppy.name}</span>
                <PawPrint className="h-5 w-5 text-brand-red animate-pulse" />
              </CardTitle>
              <CardDescription>{puppy.breed}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-brand-red" />
                  <span className="text-sm">Age: {age}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Dog className="h-4 w-4 text-brand-red" />
                  <span className="text-sm">Weight: {puppy.weight}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bone className="h-4 w-4 text-brand-red" />
                  <span className="text-sm">Color: {puppy.color}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-brand-red" />
                  <span className="text-sm">
                    {puppy.microchipped ? "Microchipped" : "Not Microchipped"}
                  </span>
                </div>
              </div>
              
              {/* Growth Progress */}
              <div className="pt-2">
                <div className="text-sm mb-1">Growth Progress</div>
                <div className="flex justify-between mb-1 text-xs">
                  <span>Puppy</span>
                  <span>Adult Dog</span>
                </div>
                <div className="relative">
                  <Progress value={growthAnimation} className="h-3" />
                  <div 
                    className="absolute top-0 h-full w-[3px] bg-yellow-400 transition-all duration-1000"
                    style={{ left: `${growthAnimation}%` }}
                  />
                </div>
                <div className="text-xs text-center mt-1">
                  {growthAnimation}% Grown
                </div>
              </div>
              
              {/* Temperament */}
              <div>
                <div className="text-sm mb-2">Temperament</div>
                <div className="flex flex-wrap gap-2">
                  {puppy.temperament.map((trait, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="bg-red-50 dark:bg-red-950/20 text-xs"
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Milestones */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Development Milestones</span>
                  <span className="text-xs">{completedMilestones}/{totalMilestones}</span>
                </div>
                <Progress value={milestoneProgress} className="h-2 mb-3" />
                <ul className="space-y-1 text-xs">
                  {Object.entries(puppy.milestones).map(([key, completed]) => (
                    <li key={key} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className={completed ? 'text-foreground' : 'text-muted-foreground'}>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            
            <CardFooter className="pt-0">
              <Button 
                asChild 
                variant="ghost" 
                className="w-full border border-dashed text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Link to={`/puppies/${puppy.id}`}>
                  View Full Puppy Profile <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          {/* Parents Card */}
          <Card className="mt-6 shadow-puppy border-none">
            <CardHeader>
              <CardTitle className="text-md">Family Tree</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-brand-red/20">
                  <img 
                    src={puppy.parentInfo.dam.image} 
                    alt={puppy.parentInfo.dam.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2 font-medium">Mom: {puppy.parentInfo.dam.name}</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border-2 border-brand-red/20">
                  <img 
                    src={puppy.parentInfo.sire.image} 
                    alt={puppy.parentInfo.sire.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-2 font-medium">Dad: {puppy.parentInfo.sire.name}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Tabs for Details, Health, etc. */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="development" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="development" className="data-[state=active]:bg-brand-red data-[state=active]:text-white">
                <Dog className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Development</span>
                <span className="sm:hidden">Growth</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="data-[state=active]:bg-brand-red data-[state=active]:text-white">
                <Pill className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Health</span>
                <span className="sm:hidden">Health</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-brand-red data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Documents</span>
                <span className="sm:hidden">Docs</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-brand-red data-[state=active]:text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Messages</span>
                <span className="sm:hidden">Chat</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Development Tab */}
            <TabsContent value="development" className="mt-0 animate-fade-in">
              <Card className="shadow-puppy border-none">
                <CardHeader>
                  <CardTitle>Growth & Development</CardTitle>
                  <CardDescription>
                    Track {puppy.name}'s growth over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Growth Chart */}
                  <div className="h-64">
                    <ChartContainer config={chartConfig}>
                      <LineChart data={puppy.weightHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="month" 
                          label={{ value: "Age (months)", position: "insideBottomRight", offset: -5 }} 
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          name="weight" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="height" 
                          name="height" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          activeDot={{ r: 6 }}
                        />
                        <ChartLegend />
                      </LineChart>
                    </ChartContainer>
                  </div>
                  
                  {/* Feeding Guidelines */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <Bone className="h-4 w-4 text-brand-red mr-2" />
                      Feeding Guidelines
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {puppy.feedingNotes}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Health Tab */}
            <TabsContent value="health" className="mt-0 animate-fade-in">
              <Card className="shadow-puppy border-none">
                <CardHeader>
                  <CardTitle>Health Dashboard</CardTitle>
                  <CardDescription>
                    Vaccinations, checkups, and health records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Vaccinations */}
                  <div>
                    <h3 className="text-sm font-medium flex items-center mb-4">
                      <Pill className="h-4 w-4 text-brand-red mr-2" />
                      Vaccination Records
                    </h3>
                    <div className="space-y-3">
                      {puppy.vaccinations.map((vax, index) => (
                        <div key={index} className="flex justify-between p-2 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{vax.name}</p>
                            <p className="text-xs text-muted-foreground">Given: {new Date(vax.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                            <span className="text-xs">Due: {new Date(vax.due).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Health Tips */}
                  <div>
                    <h3 className="text-sm font-medium flex items-center mb-4">
                      <PawPrint className="h-4 w-4 text-brand-red mr-2" />
                      Care Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {puppy.healthTips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-5 h-5 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <PawPrint className="h-3 w-3 text-brand-red" />
                          </div>
                          <span className="ml-2 text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-0 animate-fade-in">
              <Card className="shadow-puppy border-none">
                <CardHeader>
                  <CardTitle>Document Library</CardTitle>
                  <CardDescription>
                    Access all documents related to {puppy.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {puppy.documents.map((doc, index) => (
                      <div key={index} className="group border rounded-lg p-4 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="w-10 h-10 bg-brand-red/10 rounded-lg flex items-center justify-center mr-3">
                              <FileText className="h-5 w-5 text-brand-red" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(doc.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-red transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Download All Documents
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Messages Tab */}
            <TabsContent value="messages" className="mt-0 animate-fade-in">
              <Card className="shadow-puppy border-none">
                <CardHeader>
                  <CardTitle>Breeder Communication</CardTitle>
                  <CardDescription>
                    Chat with {puppy.breeder.name} about {puppy.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4 h-[350px]">
                    <div className="flex-1 overflow-y-auto space-y-4 p-3 bg-muted/30 rounded-lg">
                      {puppy.messages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`flex ${message.sender === "Owner" ? "justify-end" : "justify-start"}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === "Owner" 
                                ? "bg-brand-red text-white" 
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-xs font-medium mb-1">{message.sender}</p>
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 text-right mt-1">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        className="bg-brand-red hover:bg-red-700"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Request Video Call
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PuppyProfile;
