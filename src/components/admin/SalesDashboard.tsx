import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, DollarSign } from "lucide-react";

/**
 * SalesDashboard - DISABLED
 * This component is incomplete and requires missing API methods.
 * Will be implemented in Phase 8.
 */
const SalesDashboard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Sales Dashboard - Coming Soon
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 text-muted-foreground">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <p>
            Sales analytics and invoicing features are under development. This will include payment tracking, deposit management, and revenue reports.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesDashboard;
