import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/**
 * PuppyFormEnhanced - DISABLED
 * This component uses fields not in the current database schema.
 * Use PuppyForm.tsx instead.
 */
const PuppyFormEnhanced = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Enhanced Puppy Form - Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This enhanced form is currently disabled. Please use the standard puppy form.
        </p>
      </CardContent>
    </Card>
  );
};

export default PuppyFormEnhanced;
