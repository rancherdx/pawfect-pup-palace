
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface TemperamentTraitsCardProps {
  temperament: string[];
  trainability: number;
  activityLevel: number;
}

const TemperamentTraitsCard = ({ 
  temperament, 
  trainability, 
  activityLevel 
}: TemperamentTraitsCardProps) => {
  return (
    <Card className="shadow-md border-none overflow-hidden bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/20 dark:to-orange-950/20">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <Award className="h-6 w-6 mr-2 text-brand-red" />
          Temperament & Traits
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Temperament */}
          <div>
            <h3 className="font-medium mb-3">Temperament</h3>
            <div className="flex flex-wrap gap-2">
              {temperament?.map((trait, index) => (
                <Badge key={index} variant="outline" className="bg-background/80 py-1 px-3">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Trainability */}
          <div>
            <h3 className="font-medium mb-3">Trainability</h3>
            <div className="space-y-2">
              <Progress value={trainability} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Needs Guidance</span>
                <span>Highly Trainable</span>
              </div>
            </div>
          </div>
          
          {/* Activity Level */}
          <div>
            <h3 className="font-medium mb-3">Activity Level</h3>
            <div className="space-y-2">
              <Progress value={activityLevel} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Relaxed</span>
                <span>Very Active</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperamentTraitsCard;
