
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, PawPrint } from "lucide-react";
import CreatureProfileForm from "./CreatureProfileForm";
import CreatureCard from "./creature/CreatureCard";

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
