
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Heart } from "lucide-react";

interface PuppyData {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  price: number;
  image: string;
}

interface PuppyConfirmationProps {
  puppy: PuppyData | undefined;
  onNext: () => void;
}

const PuppyConfirmation = ({ puppy, onNext }: PuppyConfirmationProps) => {
  if (!puppy) {
    return (
      <div className="text-center p-8">
        <p>Puppy not found. Please go back and select a puppy.</p>
        <Button className="mt-4" onClick={() => window.history.back()}>
          Back to Puppies
        </Button>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={puppy.image} 
            alt={puppy.name}
            className="w-full h-full object-cover" 
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{puppy.name}</h2>
            <div className="text-2xl font-bold text-brand-red">${puppy.price}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm text-muted-foreground">Breed</h3>
              <p>{puppy.breed}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Age</h3>
              <p>{puppy.age}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground">Gender</h3>
              <p>{puppy.gender}</p>
            </div>
          </div>
          
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-2">About {puppy.name}</h3>
            <p className="text-gray-600">
              {puppy.name} is a loving and playful {puppy.breed}. {puppy.gender === "Male" ? "He" : "She"} is 
              full of energy and loves to play. {puppy.gender === "Male" ? "He" : "She"} has been 
              socialized with other dogs and people from an early age. {puppy.name} will make a 
              wonderful addition to your family!
            </p>
          </div>
          
          <div className="bg-brand-red/10 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <Heart className="text-brand-red h-5 w-5 mt-1 mr-2" />
              <div>
                <h3 className="font-semibold">Getting Ready for {puppy.name}</h3>
                <p className="text-sm">
                  Please complete the following steps to begin your adoption journey with {puppy.name}.
                  We'll ask you a few questions about your home environment and prepare everything you need.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={onNext}
              className="bg-brand-red hover:bg-red-700 text-white"
            >
              Begin Adoption <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PuppyConfirmation;
