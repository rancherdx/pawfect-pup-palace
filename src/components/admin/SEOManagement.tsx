import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Search } from "lucide-react";

/**
 * SEOManagement - DISABLED
 * This component is incomplete and requires missing API methods.
 * Use SEOManager.tsx instead.
 */
const SEOManagement = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          SEO Management - Coming Soon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 text-muted-foreground">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <p>
            This feature is under development. Please use the standard SEO Manager for now.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOManagement;
