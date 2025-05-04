
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  location: string;
  testimonial: string;
  rating: number;
  imageSrc?: string;
  puppyName?: string;
}

const TestimonialCard = ({
  name,
  location,
  testimonial,
  rating,
  imageSrc,
  puppyName,
}: TestimonialCardProps) => {
  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="pb-4 flex-row items-center gap-4">
        {imageSrc && (
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={imageSrc}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground">{location}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm italic">"{testimonial}"</p>
        {puppyName && (
          <p className="text-sm mt-2">
            <span className="text-muted-foreground">Adopted: </span>
            {puppyName}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TestimonialCard;
