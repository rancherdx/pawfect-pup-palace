
import { Card, CardContent } from "@/components/ui/card";

interface ParentsTabContentProps {
  parents: {
    dad: {
      name: string;
      age: string;
      weight: string;
      image: string;
    };
    mom: {
      name: string;
      age: string;
      weight: string;
      image: string;
    };
  };
}

const ParentsTabContent = ({ parents }: ParentsTabContentProps) => {
  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-6">Meet the Parents</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Dad */}
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex space-x-4">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand-red/20">
                <img 
                  src={parents?.dad?.image} 
                  alt={parents?.dad?.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Dad: {parents?.dad?.name}</h3>
                <p className="text-sm text-muted-foreground">Age: {parents?.dad?.age}</p>
                <p className="text-sm text-muted-foreground">Weight: {parents?.dad?.weight}</p>
              </div>
            </div>
          </div>

          {/* Mom */}
          <div className="bg-muted/30 rounded-xl p-4">
            <div className="flex space-x-4">
              <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-brand-red/20">
                <img 
                  src={parents?.mom?.image} 
                  alt={parents?.mom?.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Mom: {parents?.mom?.name}</h3>
                <p className="text-sm text-muted-foreground">Age: {parents?.mom?.age}</p>
                <p className="text-sm text-muted-foreground">Weight: {parents?.mom?.weight}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentsTabContent;
