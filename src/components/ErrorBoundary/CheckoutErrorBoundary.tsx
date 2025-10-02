import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class CheckoutErrorBoundaryClass extends Component<Props & { navigate: (path: string) => void }, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[DEV] Checkout Error Boundary caught:', error, errorInfo);
    }
  }

  private handleGoToPuppies = () => {
    this.props.navigate('/puppies');
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
            <AlertTitle className="text-xl font-semibold">Checkout Error</AlertTitle>
            <AlertDescription className="mt-4 space-y-4">
              <p className="text-muted-foreground">
                We encountered an error processing your checkout. Your payment has not been processed.
              </p>
              <p className="text-sm text-muted-foreground">
                Please try again or contact support if the problem persists.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-xs font-mono text-destructive break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-2 mt-6">
                <Button onClick={this.handleGoToPuppies} variant="outline" size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Browse Puppies
                </Button>
                <Button onClick={this.handleReload} size="sm">
                  Try Again
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

export const CheckoutErrorBoundary: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  return <CheckoutErrorBoundaryClass navigate={navigate}>{children}</CheckoutErrorBoundaryClass>;
};
