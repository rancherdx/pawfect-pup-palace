import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * NotificationCenter - DISABLED
 * This component is incomplete and requires missing API methods.
 * Will be implemented in Phase 7.
 */
const NotificationCenter = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Center
          <Badge variant="outline">Coming Soon</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-2 text-muted-foreground">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <p>
            The notification system is under development. Form submissions and system alerts will be tracked here once implemented.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
