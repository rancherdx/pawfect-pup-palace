import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Link as LinkIcon, 
  Unlink, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Shield
} from 'lucide-react';
import { apiRequest } from '@/api/client';

interface SquareOAuthStatus {
  connected: boolean;
  merchantId?: string;
  connectedAt?: string;
  permissions?: string[];
  environment?: string;
  message?: string;
}

const SquareOAuthConnect = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<SquareOAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    checkOAuthStatus();
  }, []);

  const checkOAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<SquareOAuthStatus>('/square/oauth/status');
      setStatus(response);
    } catch (error) {
      console.error('Error checking OAuth status:', error);
      setStatus({ connected: false, message: 'Failed to check connection status' });
    } finally {
      setLoading(false);
    }
  };

  const initiateOAuth = async () => {
    try {
      setConnecting(true);
      
      // Request OAuth URL from backend
      const response = await apiRequest<{authUrl: string, state: string}>('/square/oauth/auth-url');
      
      // Open Square OAuth in a popup
      const popup = window.open(
        response.authUrl, 
        'square-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for OAuth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'SQUARE_OAUTH_SUCCESS') {
          popup.close();
          window.removeEventListener('message', handleMessage);
          
          toast({
            title: "Square Connected!",
            description: "Your Square account has been successfully connected.",
            className: "bg-green-500 text-white",
          });
          
          checkOAuthStatus();
        } else if (event.data.type === 'SQUARE_OAUTH_ERROR') {
          popup.close();
          window.removeEventListener('message', handleMessage);
          
          toast({
            variant: "destructive",
            title: "Connection Failed",
            description: event.data.error || "Failed to connect Square account.",
          });
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setConnecting(false);
        }
      }, 1000);

    } catch (error) {
      console.error('OAuth initiation error:', error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to initiate Square connection.",
      });
    } finally {
      setConnecting(false);
    }
  };

  const revokeOAuth = async () => {
    try {
      setRevoking(true);
      await apiRequest('/square/oauth/revoke', { method: 'POST' });
      
      toast({
        title: "Square Disconnected",
        description: "Your Square account has been disconnected.",
        className: "bg-orange-500 text-white",
      });
      
      checkOAuthStatus();
    } catch (error) {
      console.error('OAuth revocation error:', error);
      toast({
        variant: "destructive",
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect Square account.",
      });
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red mr-3" />
          <span>Checking Square connection status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className={status?.connected ? "border-green-500" : "border-gray-200"}>
        <CardHeader className={status?.connected ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800/20"}>
          <CardTitle className="flex items-center">
            {status?.connected ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
            )}
            Square OAuth Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {status?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">
                    Connected to Square
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Merchant ID: {status.merchantId}
                  </p>
                  {status.connectedAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Connected: {new Date(status.connectedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {status.environment === 'sandbox' ? 'Sandbox' : 'Production'}
                </Badge>
              </div>
              
              {status.permissions && status.permissions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Granted Permissions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {status.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://squareup.com/dashboard', '_blank')}
                  className="flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Square Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={revokeOAuth}
                  disabled={revoking}
                  className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-500 dark:hover:bg-red-900/30"
                >
                  {revoking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Unlink className="h-4 w-4 mr-2" />
                      Disconnect Square
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Connect Your Square Account
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Connect your Square account to enable payment processing, inventory sync, and sales management.
                </p>
                {status?.message && (
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    {status.message}
                  </p>
                )}
              </div>
              
              <Button
                onClick={initiateOAuth}
                disabled={connecting}
                className="bg-brand-red hover:bg-red-700 text-white"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting to Square...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Connect Square Account
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
          <CardTitle className="text-blue-900 dark:text-blue-100">
            What happens when you connect?
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Securely connect to your Square account using OAuth 2.0
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Enable payment processing for puppy sales
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Sync inventory and sales data automatically
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Access comprehensive transaction history and reporting
            </li>
            <li className="flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              Manage customer data and payment methods
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareOAuthConnect;