
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { PawPrint, Dog } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GrowthProgressBarProps {
  growthPercentage: number;
}

const GrowthProgressBar = ({ growthPercentage }: GrowthProgressBarProps) => {
  const [growthAnimation, setGrowthAnimation] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGrowthAnimation(growthPercentage);
    }, 500);
    return () => clearTimeout(timer);
  }, [growthPercentage]);

  return (
    <Card className="mb-6 overflow-hidden border-none shadow-md bg-gradient-to-r from-red-50/80 to-orange-50/80 dark:from-red-950/20 dark:to-orange-950/20">
      <CardContent className="p-4">
        <div className="flex justify-between mb-1 text-sm">
          <span className="font-medium flex items-center">
            <PawPrint className="h-4 w-4 mr-1 text-brand-red" /> Puppy
          </span>
          <span className="font-medium flex items-center">
            Adult Dog <Dog className="h-4 w-4 ml-1" />
          </span>
        </div>
        <div className="relative">
          <Progress value={growthAnimation} className="h-3" />
          <div 
            className="absolute top-0 h-full w-[3px] bg-yellow-400 transition-all duration-300"
            style={{ left: `${growthAnimation}%` }}
          />
        </div>
        <div className="text-xs text-center mt-1">Growth: {growthAnimation}%</div>
      </CardContent>
    </Card>
  );
};

export default GrowthProgressBar;
