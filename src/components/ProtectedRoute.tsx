
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user, authStatus } = useAuth();
  const location = useLocation();

  // Show different loading states based on auth status
  if (isLoading) {
    const getLoadingContent = () => {
      switch (authStatus) {
        case 'loading':
          return (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading user data...</p>
            </>
          );
        case 'timeout':
          return (
            <>
              <Clock className="h-8 w-8 text-yellow-500 mb-4" />
              <p className="text-muted-foreground">Authentication is taking longer than expected...</p>
              <p className="text-sm text-muted-foreground mt-2">Please wait or refresh the page</p>
            </>
          );
        case 'error':
          return (
            <>
              <AlertCircle className="h-8 w-8 text-destructive mb-4" />
              <p className="text-muted-foreground">There was an error loading your profile</p>
              <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page</p>
            </>
          );
        default:
          return (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Initializing...</p>
            </>
          );
      }
    };

    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            {getLoadingContent()}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location, message: "You must be logged in to view this page." }} />;
  }

  // If a specific role is required, check for permission
  if (requiredRole) {
    const userRoles = user?.roles || [];
    let hasPermission = userRoles.includes(requiredRole);

    // If admin is required, super-admin also has permission
    if (requiredRole === 'admin' && userRoles.includes('super-admin')) {
      hasPermission = true;
    }

    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-8 w-8 text-yellow-500 mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-4">
                You need {requiredRole} privileges to access this area.
              </p>
              <p className="text-sm text-muted-foreground">
                Current roles: {userRoles.join(', ') || 'none'}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
