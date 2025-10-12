import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/**
 * ParentDetailView - DISABLED
 * This component requires refactoring to match ParentForm props.
 * Will be re-implemented in Phase 5.
 */
const ParentDetailView = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Parent Detail View - Coming Soon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This feature is being refactored. Please use the standard parent management for now.
        </p>
      </CardContent>
    </Card>
  );
};

export default ParentDetailView;
