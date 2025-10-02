import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class AdminErrorBoundaryClass extends Component<Props & { navigate: (path: string) => void }, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV] Admin Error Boundary caught:', error, errorInfo);
    }
  }

  private handleGoHome = () => {
    this.props.navigate('/');
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Alert className="max-w-2xl border-destructive">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertTitle className="text-xl font-semibold">Admin Dashboard Error</AlertTitle>
            <AlertDescription className="mt-4 space-y-4">
              <p className="text-muted-foreground">
                An error occurred in the admin dashboard. This could be due to:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Data formatting issues</li>
                <li>Network connectivity problems</li>
                <li>Insufficient permissions</li>
              </ul>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-2 mt-6">
                <Button onClick={this.handleGoHome} variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
                <Button onClick={this.handleReload} size="sm">
                  Reload Dashboard
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export const AdminErrorBoundary: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  return <AdminErrorBoundaryClass navigate={navigate}>{children}</AdminErrorBoundaryClass>;
};
