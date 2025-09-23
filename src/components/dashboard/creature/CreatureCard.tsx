// import { useState } from "react"; // useState for showAssistant can be kept if that feature is maintained
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge"; // Not used in current simplified card
import { Button } from "@/components/ui/button";
import { PawPrint, CalendarDays, Link as LinkIcon } from "lucide-react"; // Bot icon removed for now
import { Link } from "react-router-dom"; // For navigation
import type { PuppyProfileData } from "../CreatureProfiles"; // Import the Puppy type

/**
 * @interface CreatureCardProps
 * @description Defines the props for the CreatureCard component.
 */
interface CreatureCardProps {
  /** The puppy profile data to display in the card. */
  puppy: PuppyProfileData; // Changed from 'creature' to 'puppy' for clarity
}

/**
 * Calculates a human-readable age string from a birth date.
 * @param {string | null | undefined} birthdayStr - The birth date as a string.
 * @returns {string} The formatted age string (e.g., "1 year, 2 months", "3 months", "5 days old").
 */
const calculateAge = (birthdayStr: string | null | undefined) => {
  if (!birthdayStr) return "Unknown";
  const birthday = new Date(birthdayStr);
  const today = new Date();
  
  let years = today.getFullYear() - birthday.getFullYear();
  let months = today.getMonth() - birthday.getMonth();
  
  if (months < 0 || (months === 0 && today.getDate() < birthday.getDate())) {
    years--;
    months += 12;
  }
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''}`;
  } else if (months > 0) {
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const days = Math.floor((today.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''} old`;
  }
};

/**
 * Calculates an estimated growth progress percentage based on the puppy's age.
 * @param {string | null | undefined} birthdayStr - The birth date as a string.
 * @returns {number} The estimated growth progress as a percentage (0-100).
 */
const calculateGrowthProgress = (birthdayStr: string | null | undefined): number => {
  if (!birthdayStr) return 0;
  const birthday = new Date(birthdayStr);
  const today = new Date();
  const monthsOld = (today.getFullYear() - birthday.getFullYear()) * 12 + (today.getMonth() - birthday.getMonth());
  
  // Assuming full growth around 12-18 months for simplicity in a card view
  const typicalFullGrowthMonths = 15;
  const progress = Math.min(100, Math.round((monthsOld / typicalFullGrowthMonths) * 100));
  return progress < 0 ? 0 : progress; // Ensure progress isn't negative if bday is in future
};

/**
 * @component CreatureCard
 * @description A card component that displays a summary of a user's adopted puppy ("creature").
 * @param {CreatureCardProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered creature card.
 */
const CreatureCard = ({ puppy }: CreatureCardProps) => {
  // const [showAssistant, setShowAssistant] = useState(false); // AI Assistant feature can be re-added later
  const age = calculateAge(puppy.birth_date);
  const growthProgress = calculateGrowthProgress(puppy.birth_date);

  // Use first image from image_urls or a placeholder
  const displayImage = puppy.image_urls && puppy.image_urls.length > 0
    ? puppy.image_urls[0]
    : "/placeholder.svg"; // Make sure you have a placeholder image in public folder

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-fade-in">
      <div className="md:flex">
        <div className="md:w-1/3 md:shrink-0">
          <img
            src={displayImage}
            alt={puppy.name}
            className="w-full h-48 md:h-full object-cover"
          />
        </div>
        <div className="p-6 md:w-2/3 flex flex-col justify-between">
          <div>
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-2xl font-bold text-brand-red flex items-center">
                <PawPrint className="h-6 w-6 mr-2" />
                {puppy.name}
              </CardTitle>
            </CardHeader>
            <p className="text-md text-muted-foreground mb-1">{puppy.breed_name || "Breed not specified"}</p>
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              Born: {puppy.birth_date ? new Date(puppy.birth_date).toLocaleDateString() : "Unknown"} (Age: {age})
            </div>

            {puppy.birth_date && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Puppy</span>
                  <span>Adult</span>
                </div>
                <Progress value={growthProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center mt-1">Estimated Growth: {growthProgress}%</p>
              </div>
            )}
            
            {/* Simplified content for the card. More details in PuppyProfile.tsx */}
            {puppy.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {String(puppy.description)}
                </p>
            )}
             {puppy.litter_name && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Part of the "{puppy.litter_name}" litter.
                </p>
            )}
          </div>

          <CardFooter className="p-0 mt-4">
            <Button asChild className="w-full bg-brand-red hover:bg-red-700 text-white">
              <Link to={`/dashboard/puppy/${puppy.id}`}>
                View Full Profile
                <LinkIcon className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </div>
      </div>
      {/* AI Assistant button and section removed for now to simplify card. Can be re-added. */}
    </Card>
  );
};

export default CreatureCard;
