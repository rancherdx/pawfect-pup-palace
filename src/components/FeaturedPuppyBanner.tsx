import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Heart, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface FeaturedPuppy {
  id: string;
  name: string;
  breed: string;
  price: number;
  image_urls: string[];
  banner_text: string | null;
  banner_color: string;
  status: string;
}

const FeaturedPuppyBanner: React.FC = () => {
  const { data: featuredPuppies, isLoading } = useQuery({
    queryKey: ['featured-puppies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('puppies')
        .select('id, name, breed, price, image_urls, banner_text, banner_color, status')
        .eq('is_featured', true)
        .eq('status', 'Available')
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as FeaturedPuppy[];
    },
  });

  if (isLoading || !featuredPuppies || featuredPuppies.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-6 w-6 text-primary fill-primary" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Featured Puppies
            </h2>
            <Star className="h-6 w-6 text-primary fill-primary" />
          </div>
          <p className="text-muted-foreground">
            Don't miss out on these special pups looking for their forever homes
          </p>
        </div>

        <Carousel className="w-full max-w-7xl mx-auto">
          <CarouselContent className="-ml-2 md:-ml-4">
            {featuredPuppies.map((puppy) => (
              <CarouselItem key={puppy.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <Card className="group overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-xl">
                  <div className="relative">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={puppy.image_urls[0] || '/placeholder.svg'}
                        alt={puppy.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    {/* Banner overlay */}
                    {puppy.banner_text && (
                      <div 
                        className="absolute top-4 left-4 px-3 py-1 rounded-full text-white font-bold text-sm shadow-lg animate-pulse"
                        style={{ backgroundColor: puppy.banner_color }}
                      >
                        {puppy.banner_text}
                      </div>
                    )}

                    {/* Heart icon */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {puppy.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{puppy.breed}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          Featured
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          ${puppy.price.toLocaleString()}
                        </div>
                        <Link to={`/puppy/${puppy.id}`}>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>

        <div className="text-center mt-8">
          <Link to="/puppies">
            <Button variant="outline" size="lg" className="group">
              View All Available Puppies
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPuppyBanner;