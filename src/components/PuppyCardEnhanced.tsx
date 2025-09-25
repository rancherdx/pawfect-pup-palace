import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Video, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PuppyCardEnhancedProps {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender?: string;
  imageSrc?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  price: number;
  status: 'Available' | 'Reserved' | 'Sold' | 'Not For Sale';
  bannerText?: string;
  bannerColor?: string;
  isFeatured?: boolean;
  slug?: string;
}

const PuppyCardEnhanced: React.FC<PuppyCardEnhancedProps> = ({
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
  bannerText,
  bannerColor = '#ef4444',
  isFeatured = false,
  slug,
}) => {
  // Use the first image from imageUrls, fallback to imageSrc, then placeholder
  const displayImage = imageUrls?.[0] || imageSrc || '/placeholder.svg';
  const hasMultipleImages = (imageUrls?.length || 0) > 1;
  const hasVideos = videoUrls.length > 0;

  const statusColors = {
    Available: 'bg-green-500',
    Reserved: 'bg-yellow-500',
    Sold: 'bg-red-500',
    'Not For Sale': 'bg-gray-500',
  };

  return (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-xl ${isFeatured ? 'ring-2 ring-primary/50' : ''}`}>
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <img
            src={displayImage}
            alt={`${name} - ${breed}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        
        {/* Media indicators */}
        <div className="absolute top-2 left-2 flex gap-1">
          {hasMultipleImages && (
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              {imageUrls?.length || 0}
            </div>
          )}
          {hasVideos && (
            <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-white text-xs flex items-center gap-1">
              <Video className="h-3 w-3" />
              {videoUrls?.length || 0}
            </div>
          )}
        </div>

        {/* Banner overlay */}
        {bannerText && (
          <div 
            className="absolute top-2 right-2 px-2 py-1 rounded-full text-white font-bold text-xs shadow-lg"
            style={{ backgroundColor: bannerColor }}
          >
            {bannerText}
          </div>
        )}

        {/* Featured badge */}
        {isFeatured && (
          <div className="absolute bottom-2 left-2">
            <Badge className="bg-yellow-500 text-yellow-50 hover:bg-yellow-600">
              Featured
            </Badge>
          </div>
        )}

        {/* Heart icon */}
        <div className="absolute bottom-2 right-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {breed} • {age} {gender && `• ${gender}`}
              </p>
            </div>
            <Badge 
              className={`${statusColors[status]} text-white shrink-0 ml-2`}
              variant="secondary"
            >
              {status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">
              ${price.toLocaleString()}
            </div>
            <Link to={`/puppy/${slug || id}`}>
              <Button size="sm" className="hover:scale-105 transition-transform">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppyCardEnhanced;