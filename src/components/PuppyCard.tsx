import { Heart, Video, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PuppyStatus } from "@/types";
import { cn } from "@/lib/utils";

// Consolidating all props from both components
interface PuppyCardProps {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender?: string;
  imageSrc?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  price: number;
  status: PuppyStatus;
  slug?: string;
  bannerText?: string;
  bannerColor?: string;
  isFeatured?: boolean;
  variant?: 'default' | 'enhanced'; // To switch between layouts
}

const PuppyCard = ({
  id,
  name,
  breed,
  age,
  gender,
  imageSrc,
  imageUrls = [],
  videoUrls = [],
  price,
  status,
  slug,
  bannerText,
  bannerColor = '#ef4444',
  isFeatured = false,
  variant = 'default',
}: PuppyCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  const displayImage = imageUrls?.[0] || imageSrc || "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3";
  const available = status === 'Available';

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? `${name} removed from favorites` : `${name} added to favorites!`,
      description: isFavorite ? "You can always add them back later." : "Check your favorites list.",
    });
  };

  const hasMultipleImages = imageUrls.length > 1;
  const hasVideos = videoUrls.length > 0;

  const statusColors: { [key in PuppyStatus]: string } = {
    Available: 'bg-green-500',
    Reserved: 'bg-yellow-500',
    Sold: 'bg-red-500',
    'Not For Sale': 'bg-gray-500',
  };

  // Default Variant: The original PuppyCard layout
  if (variant === 'default') {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
        <div className="relative">
          <Link to={`/puppy/${slug || id}`} className="block">
            <img src={displayImage} alt={name} className="w-full h-48 object-cover" />
          </Link>
          <button
            onClick={toggleFavorite}
            aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
            className="absolute top-3 right-3 p-3 bg-white/80 dark:bg-black/50 rounded-full hover:bg-white dark:hover:bg-black transition-colors"
          >
            <Heart className={cn('h-5 w-5', isFavorite ? 'fill-brand-red text-brand-red' : 'text-gray-600 dark:text-gray-300')} aria-hidden="true" />
          </button>
          {!available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="bg-brand-red text-white text-lg py-1 px-3">
                {status}
              </Badge>
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{name}</CardTitle>
            {gender && <Badge variant="outline">{gender}</Badge>}
          </div>
          <CardDescription>{breed}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between text-sm">
            <span>Age: {age}</span>
            <span className="font-semibold text-primary">${price}</span>
          </div>
        </CardContent>
        <CardFooter className="mt-auto">
          <Button asChild variant="default" className="w-full bg-brand-red hover:bg-red-700 text-white" disabled={!available}>
            <Link to={`/puppy/${slug || id}`}>
              {available ? "View Details" : "Not Available"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Enhanced Variant: The PuppyCardEnhanced layout
  return (
    <Card className={cn('group overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col', isFeatured ? 'ring-2 ring-primary/50' : '')}>
      <div className="relative">
        <Link to={`/puppy/${slug || id}`} className="block aspect-square overflow-hidden">
            <img src={displayImage} alt={`${name} - ${breed}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        </Link>
        <div className="absolute top-2 left-2 flex gap-1">
          {hasMultipleImages && (
            <div role="status" aria-label={`${imageUrls.length} images available`} className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs flex items-center gap-1">
              <ImageIcon className="h-3 w-3" aria-hidden="true" />
              {imageUrls.length}
            </div>
          )}
          {hasVideos && (
            <div role="status" aria-label={`${videoUrls.length} videos available`} className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs flex items-center gap-1">
              <Video className="h-3 w-3" aria-hidden="true" />
              {videoUrls.length}
            </div>
          )}
        </div>
        {bannerText && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-white font-bold text-xs shadow-lg" style={{ backgroundColor: bannerColor }}>
            {bannerText}
          </div>
        )}
        {isFeatured && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-yellow-500 text-yellow-50 hover:bg-yellow-600">Featured</Badge>
          </div>
        )}
        <button
          onClick={toggleFavorite}
          aria-label={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
          className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className={cn('h-4 w-4', isFavorite ? 'fill-primary text-primary' : 'text-primary' )} aria-hidden="true" />
        </button>
      </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="space-y-3 flex-grow">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">{name}</h3>
              <p className="text-sm text-muted-foreground">{breed} • {age} {gender && `• ${gender}`}</p>
            </div>
            <Badge className={cn(statusColors[status], "text-white shrink-0 ml-2")} variant="secondary">{status}</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
            <div className="text-2xl font-bold text-primary">${price.toLocaleString()}</div>
            <Button asChild size="sm" className="hover:scale-105 transition-transform" disabled={!available}>
              <Link to={`/puppy/${slug || id}`}>
                {available ? "View Details" : "Not Available"}
              </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppyCard;