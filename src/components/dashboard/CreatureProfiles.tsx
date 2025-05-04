
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, PawPrint, Bot } from "lucide-react";
import { 
  ChartContainer, 
  ChartLegend, 
  ChartTooltip, 
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import CreatureProfileForm from "./CreatureProfileForm";

// Mock data for creature profiles
const mockCreatures = [
  {
    id: "1",
    name: "Luna",
    breed: "Golden Retriever",
    birthday: "2022-06-15",
    image: "https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3",
    weightHistory: [
      { month: 1, weight: 4.5 },
      { month: 2, weight: 7.8 },
      { month: 3, weight: 12.3 },
      { month: 4, weight: 18.5 },
      { month: 5, weight: 24.1 },
      { month: 6, weight: 29.8 },
    ],
    heightHistory: [
      { month: 1, height: 8.2 },
      { month: 2, height: 12.4 },
      { month: 3, height: 16.8 },
      { month: 4, height: 19.5 },
      { month: 5, height: 21.7 },
      { month: 6, height: 22.8 },
    ],
    feedingNotes: "Luna enjoys Royal Canin puppy food, 3 cups daily split into two meals.",
    documents: [
      { name: "Vaccination Record", date: "2023-01-15" },
      { name: "Microchip Certificate", date: "2022-06-22" },
    ],
    milestones: {
      walking: true,
      sitting: true,
      fetch: true,
      stay: false,
      rollOver: false,
    }
  },
  {
    id: "2",
    name: "Buddy",
    breed: "Labrador Retriever",
    birthday: "2021-08-10",
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3",
    weightHistory: [
      { month: 1, weight: 5.2 },
      { month: 3, weight: 14.1 },
      { month: 6, weight: 22.5 },
      { month: 9, weight: 28.7 },
      { month: 12, weight: 32.4 },
      { month: 18, weight: 34.9 },
    ],
    heightHistory: [
      { month: 1, height: 9.1 },
      { month: 3, height: 17.5 },
      { month: 6, height: 22.3 },
      { month: 9, height: 23.1 },
      { month: 12, height: 23.8 },
      { month: 18, height: 24.2 },
    ],
    feedingNotes: "Buddy is on a grain-free diet with 2 cups of food in the morning and 2 cups in the evening.",
    documents: [
      { name: "Vaccination Record", date: "2022-08-15" },
      { name: "Health Certificate", date: "2021-08-12" },
    ],
    milestones: {
      walking: true,
      sitting: true,
      fetch: true,
      stay: true,
      rollOver: true,
    }
  }
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

// Calculate the growth progress
const calculateGrowthProgress = (birthdayStr: string, breed: string) => {
  // Estimate when puppy is fully grown based on breed (simplified)
  let fullGrowthMonths = 12; // Default for medium-sized dogs
  
  if (breed.toLowerCase().includes("retriever") || breed.toLowerCase().includes("german shepherd")) {
    fullGrowthMonths = 18; // Large breeds
  } else if (breed.toLowerCase().includes("chihuahua") || breed.toLowerCase().includes("yorkie")) {
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

const CreatureCard = ({ creature }: { creature: any }) => {
  const [showAssistant, setShowAssistant] = useState(false);
  const age = calculateAge(creature.birthday);
  const growthProgress = calculateGrowthProgress(creature.birthday, creature.breed);

  const chartConfig = {
    weight: { color: "#ef4444", label: "Weight (lbs)" },
    height: { color: "#3b82f6", label: "Height (in)" },
  };

  const completedMilestones = Object.values(creature.milestones).filter(Boolean).length;
  const totalMilestones = Object.values(creature.milestones).length;
  const milestoneProgress = Math.round((completedMilestones / totalMilestones) * 100);

  return (
    <div className="mb-10 animate-fade-in">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6 rounded-xl shadow-md relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 opacity-5">
          <PawPrint className="h-48 w-48" />
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <div className="rounded-lg overflow-hidden mb-4 border-4 border-white shadow-lg">
              <img 
                src={creature.image} 
                alt={creature.name} 
                className="w-full h-60 object-cover"
              />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-bold">{creature.name}</h3>
              <p className="text-muted-foreground">{creature.breed}</p>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">🎂 Birthday:</span>
                <span>{new Date(creature.birthday).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">🐾 Age:</span>
                <span>{age}</span>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between mb-1 text-xs">
                  <span>Puppy</span>
                  <span>Adult Dog</span>
                </div>
                <div className="relative">
                  <Progress value={growthProgress} className="h-3" />
                  <div 
                    className={`absolute top-0 h-full w-[3px] bg-yellow-400 transition-all duration-300`}
                    style={{ left: `${growthProgress}%` }}
                  />
                </div>
                <div className="text-xs text-center mt-1">Growth: {growthProgress}%</div>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Weight and Height Chart */}
              <Card className="col-span-1 lg:col-span-2">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-4">Growth Chart</h4>
                  <div className="h-64">
                    <ChartContainer
                      config={chartConfig}
                    >
                      <LineChart data={creature.weightHistory}>
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
                </CardContent>
              </Card>
              
              {/* Feeding Notes */}
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Feeding Notes</h4>
                  <p className="text-muted-foreground text-sm">{creature.feedingNotes}</p>
                </CardContent>
              </Card>
              
              {/* Training Milestones */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Training Milestones</h4>
                    <span className="text-sm">{completedMilestones}/{totalMilestones}</span>
                  </div>
                  <Progress value={milestoneProgress} className="h-2 mb-4" />
                  <ul className="space-y-2">
                    {Object.entries(creature.milestones).map(([key, value]) => (
                      <li key={key} className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={`text-sm ${value ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Documents Section */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Documents</h4>
                <ul className="divide-y">
                  {creature.documents.map((doc: any, index: number) => (
                    <li key={index} className="py-2 flex justify-between">
                      <span>{doc.name}</span>
                      <span className="text-sm text-muted-foreground">{new Date(doc.date).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* AI Assistant */}
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center"
                onClick={() => setShowAssistant(!showAssistant)}
              >
                <Bot className="h-4 w-4 mr-2" />
                {showAssistant ? "Hide AI Furry Friend" : "Ask AI Furry Friend"}
              </Button>
              
              {showAssistant && (
                <div className="mt-3 p-4 bg-background rounded-lg border animate-fade-in">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm">
                        Hi there! I'm {creature.name}'s virtual companion. Based on {creature.name}'s 
                        growth chart, {creature.name} is developing at a healthy rate for a {creature.breed}. 
                        For the next stage of training, you might want to focus on the "{Object.entries(creature.milestones)
                          .find(([_, value]) => !value)?.[0]?.replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase()) || "advanced tricks"}" skill!
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: This is a placeholder for future AI assistant integration
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreatureProfiles = () => {
  const [creatures, setCreatures] = useState(mockCreatures);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddCreature = (newCreature: any) => {
    setCreatures([...creatures, {
      ...newCreature,
      id: (creatures.length + 1).toString(),
      weightHistory: [],
      heightHistory: [],
      documents: [],
      milestones: {
        walking: false,
        sitting: false,
        fetch: false,
        stay: false,
        rollOver: false,
      }
    }]);
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <PawPrint className="h-6 w-6 mr-2 text-brand-red" />
          Your Fur Family
        </h2>
        
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-red hover:bg-red-700 text-white"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          {showAddForm ? "Cancel" : "Add Creature"}
        </Button>
      </div>
      
      {showAddForm && (
        <div className="mb-8 animate-fade-in">
          <CreatureProfileForm onSubmit={handleAddCreature} onCancel={() => setShowAddForm(false)} />
        </div>
      )}
      
      <div className="space-y-6">
        {creatures.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <PawPrint className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold mt-4">No Creatures Yet</h3>
            <p className="text-muted-foreground mb-6">Add your first pet to get started</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-brand-red hover:bg-red-700 text-white"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Add Your First Creature
            </Button>
          </div>
        ) : (
          creatures.map(creature => (
            <CreatureCard key={creature.id} creature={creature} />
          ))
        )}
      </div>
    </div>
  );
};

export default CreatureProfiles;
