
import { Card, CardContent } from "@/components/ui/card";
import { Pill, PawPrint } from "lucide-react";

interface HealthTabContentProps {
  puppy: {
    vaccinations: string;
    lastCheckup?: string;
    feedingNotes?: string;
    careTips?: string[];
  };
}

const HealthTabContent = ({ puppy }: HealthTabContentProps) => {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Pill className="h-5 w-5 mr-2 text-brand-red" />
          Health Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium">Vaccinations</h3>
              <p className="text-muted-foreground">{puppy.vaccinations}</p>
            </div>
            
            <div>
              <h3 className="text-md font-medium">Last Checkup</h3>
              <p className="text-muted-foreground">{puppy.lastCheckup || "No checkups yet"}</p>
            </div>
            
            <div>
              <h3 className="text-md font-medium">Feeding Notes</h3>
              <p className="text-muted-foreground">{puppy.feedingNotes || "Standard puppy diet recommended"}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Care Tips</h3>
            {puppy.careTips && puppy.careTips.length > 0 ? (
              <ul className="space-y-2">
                {puppy.careTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <PawPrint className="h-4 w-4 mr-2 text-brand-red flex-shrink-0 mt-1" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">General care guidelines will be provided</p>
            )}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            All our puppies come with a 1-year genetic health guarantee and have received appropriate vaccinations for their age.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthTabContent;
