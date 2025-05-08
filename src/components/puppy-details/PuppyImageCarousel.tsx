
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface PuppyImageCarouselProps {
  images: string[];
  name: string;
}

const PuppyImageCarousel = ({ images, name }: PuppyImageCarouselProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="space-y-4">
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="rounded-xl overflow-hidden shadow-lg h-[400px] bg-muted">
                <img 
                  src={image} 
                  alt={`${name} ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
      
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`rounded-lg overflow-hidden h-20 ${
              index === currentImageIndex ? "ring-2 ring-brand-red" : ""
            } hover:opacity-90 transition-all`}
          >
            <img 
              src={image} 
              alt={`${name} ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PuppyImageCarousel;
