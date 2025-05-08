
import { Card, CardContent } from "@/components/ui/card";

interface DetailsTabContentProps {
  puppy: {
    breed: string;
    age: string;
    gender: string;
    weight: string;
    color: string;
    birthDate: string;
    sizeMaturity?: string;
    microchipped?: boolean;
  };
}

const DetailsTabContent = ({ puppy }: DetailsTabContentProps) => {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">About {puppy.breed}</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <h3 className="text-sm text-muted-foreground">Breed</h3>
            <p className="font-medium">{puppy.breed}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Age</h3>
            <p className="font-medium">{puppy.age}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Gender</h3>
            <p className="font-medium">{puppy.gender}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Weight</h3>
            <p className="font-medium">{puppy.weight}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Color</h3>
            <p className="font-medium">{puppy.color}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Birth Date</h3>
            <p className="font-medium">{puppy.birthDate}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Size at Maturity</h3>
            <p className="font-medium">{puppy.sizeMaturity || "Average"}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground">Microchipped</h3>
            <p className="font-medium">{puppy.microchipped ? "Yes" : "No"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailsTabContent;
