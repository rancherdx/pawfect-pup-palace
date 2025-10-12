import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/**
 * EnhancedTestimonialManagement - DISABLED
 * This component is incomplete and requires missing API methods.
 * Use TestimonialManagement.tsx instead.
 */
const EnhancedTestimonialManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Enhanced Testimonial Management - Coming Soon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          This feature is under development. Please use the standard Testimonial Management for now.
        </p>
      </CardContent>
    </Card>
  );
};

export default EnhancedTestimonialManagement;
