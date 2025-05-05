
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PawPrint, DollarSign, Calendar, Award } from "lucide-react";

interface StudDog {
  id: string;
  name: string;
  breed: string;
  age: number;
  certifications: string[];
  temperament: string;
  price: number;
  image: string;
}

interface StudServiceCardProps {
  dog: StudDog;
}

const StudServiceCard = ({ dog }: StudServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="overflow-hidden border-2 border-brand-red/20 transition-all duration-300 shadow-puppy"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden h-48">
        <img 
          src={dog.image} 
          alt={dog.name} 
          className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`} 
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-brand-red font-semibold">
            <Award className="h-3 w-3 mr-1" /> Stud
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-5">
        <h3 className="text-xl font-bold mb-1 flex items-center">
          {dog.name}
          <span className="ml-2 text-brand-red">
            <PawPrint className="h-5 w-5" />
          </span>
        </h3>
        
        <div className="text-sm text-muted-foreground mb-3">
          {dog.breed} • <Calendar className="inline h-3 w-3" /> {dog.age} years old
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="font-medium mb-1">Temperament:</div>
            <p className="text-sm">{dog.temperament}</p>
          </div>
          
          <div>
            <div className="font-medium mb-1">Health Certifications:</div>
            <div className="flex flex-wrap gap-1">
              {dog.certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center font-bold text-lg">
            <DollarSign className="h-4 w-4 text-green-600" />
            ${dog.price}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-secondary/50 p-4">
        <Button className="w-full bg-brand-red hover:bg-red-700 text-white">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudServiceCard;
