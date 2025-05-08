
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, PawPrint, Info, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GrowthProgressBar from "./GrowthProgressBar";

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

interface PuppyInfoSectionProps {
  puppy: {
    id: string;
    name: string;
    breed: string;
    gender: string;
    status: string;
    price: number;
    description: string;
    growthProgress: number;
    age: string;
    weight: string;
    color: string;
    available: boolean;
  };
  puppyAge: string;
}

const PuppyInfoSection = ({ puppy, puppyAge }: PuppyInfoSectionProps) => {
  const { toast } = useToast();

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

      <GrowthProgressBar growthPercentage={puppy.growthProgress} />

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
  );
};

export default PuppyInfoSection;
