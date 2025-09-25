import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PuppyStatus } from "@/types";

interface PuppyCardProps {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender?: string; // Made optional as per instruction
  imageSrc?: string; // Made optional as per instruction
  imageUrls?: string[]; // New array of image URLs
  price: number;
  status: PuppyStatus;
  slug?: string; // Added for slug-based routing
}

const PuppyCard = ({
  id,
  name,
  breed,
  age,
  gender,
  imageSrc,
  imageUrls,
  price,
  status,
  slug,
}: PuppyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  // Use image_urls[0] first, then fallback to imageSrc, then placeholder
  const displayImage = imageUrls?.[0] || imageSrc || "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3";
  
  const available = status === 'Available';

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsFavorite(!isFavorite);
    
    toast({
      title: isFavorite ? `${name} removed from favorites` : `${name} added to favorites!`,
      description: isFavorite 
        ? "You can always add them back later." 
        : "Check your favorites list to see all your loved puppies.",
    });
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <img 
          src={displayImage} 
          alt={name} 
          className="w-full h-48 object-cover"
        />
        <button 
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/50 rounded-full hover:bg-white dark:hover:bg-black transition-colors"
        >
          <Heart 
            className={`h-5 w-5 ${isFavorite ? 'fill-brand-red text-brand-red' : 'text-gray-600 dark:text-gray-300'}`} 
          />
        </button>
        {status !== 'Available' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge className="bg-brand-red text-white text-lg py-1 px-3">
              {status === 'Reserved' ? 'Reserved' : status === 'Sold' ? 'Sold' : 'Not Available'}
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{name}</CardTitle>
          {gender && <Badge variant="outline" className="bg-accent">{gender}</Badge>}
        </div>
        <CardDescription>{breed}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex justify-between text-sm">
          <span>Age: {age}</span>
          <span className="font-semibold text-primary">${price}</span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          asChild 
          variant="default" 
          className="w-full bg-brand-red hover:bg-red-700 text-white"
          disabled={!available}
        >
          <Link to={`/puppy/${slug || id}`}>
            {available ? "View Details" : "Not Available"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PuppyCard;
