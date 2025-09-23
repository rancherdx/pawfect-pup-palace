import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, PawPrint, AlertCircle, Loader2 } from "lucide-react";
import CreatureCard from "./creature/CreatureCard";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * @interface PuppyProfileData
 * @description Defines the structure for a puppy's profile data, used for display in the dashboard.
 */
export interface PuppyProfileData {
  id: string;
  name: string;
  breed_name?: string; // From joined breeds table
  litter_name?: string; // From joined litters table
  birth_date: string;
  image_urls: string[]; // Parsed JSON
  // Add other fields that might come from /api/my-puppies and are needed by CreatureCard
  // For now, CreatureCard primarily uses name, breed_name, birth_date, image_urls
  // The mock data had more detailed fields like weightHistory, etc. which are not directly on puppy from /api/my-puppies
  // These will be fetched in PuppyProfile.tsx (the detailed view)
  // For CreatureCard, we'll pass what we have and let it adapt.
  [key: string]: unknown; // Allow other properties
}

/**
 * Fetches the puppies owned by the currently authenticated user from Supabase.
 * @returns {Promise<PuppyProfileData[]>} A promise that resolves to an array of puppy profile data.
 * @throws Will throw an error if the user is not authenticated or if the database query fails.
 */
async function fetchMyPuppiesFromSupabase(): Promise<PuppyProfileData[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from('puppies')
    .select('*')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as PuppyProfileData[];
}

/**
 * @component CreatureProfiles
 * @description A component that displays a list of "creatures" (adopted puppies) owned by the user.
 * It fetches the user's pets and displays them as a list of CreatureCard components.
 * @returns {React.ReactElement} The rendered list of creature profiles.
 */
const CreatureProfiles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [creatures, setCreatures] = useState<PuppyProfileData[]>([]);
  // const [showAddForm, setShowAddForm] = useState(false); // Disabled as per instructions
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCreatures = async () => {
      if (!user) {
        setError("Not authenticated. Please log in.");
        setIsLoading(false);
        toast({ variant: "destructive", title: "Authentication Error", description: "Please log in to see your pets." });
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const fetchedPuppies = await fetchMyPuppiesFromSupabase();
        setCreatures(fetchedPuppies);
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error fetching your pets",
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadCreatures();
  }, [user, toast]);

  // Add Creature functionality is disabled for now as per instructions.
  // const handleAddCreature = (newCreature: any) => {
  //   // This would involve a POST request to a new backend endpoint if implemented
  //   // For now, it's removed.
  // };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
        <p className="ml-2">Loading your furry family...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <PawPrint className="h-6 w-6 mr-2 text-brand-red" />
          Your Fur Family
        </h2>
        
        {/* "Add Creature" button is removed/commented out as per instructions.
            Instead, a user might want to go to the adoption page.
        */}
         <Button asChild className="bg-brand-red hover:bg-red-700 text-white">
           <Link to="/adopt">
             <PlusCircle className="h-5 w-5 mr-2" />
             Adopt a Puppy
           </Link>
         </Button>
      </div>
      
      {/* {showAddForm && (
        <div className="mb-8 animate-fade-in">
          <CreatureProfileForm onSubmit={handleAddCreature} onCancel={() => setShowAddForm(false)} />
        </div>
      )} */}

      {error && (
        <div className="text-center py-10 bg-red-50 dark:bg-red-900/10 rounded-lg">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-red-600">Could Not Load Your Pets</h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          {/* Optional: Add a retry button */}
        </div>
      )}
      
      {!isLoading && !error && creatures.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <PawPrint className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold mt-4">No Adopted Pets Yet</h3>
          <p className="text-muted-foreground mb-6">Once you adopt a puppy, they will appear here.</p>
          <Button asChild className="bg-brand-red hover:bg-red-700 text-white">
            <Link to="/adopt">
              <PlusCircle className="h-5 w-5 mr-2" />
              Find a Puppy to Adopt
            </Link>
          </Button>
        </div>
      )}

      {!isLoading && !error && creatures.length > 0 && (
        <div className="space-y-8"> {/* Increased space between cards */}
          {creatures.map(creature => (
            <CreatureCard key={creature.id} puppy={creature} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatureProfiles;
