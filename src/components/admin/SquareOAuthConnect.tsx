import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, ExternalLink, Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminApi } from '@/api';

interface SquareOAuthStatus {
  connected: boolean;
  merchantId?: string;
  applicationId?: string;
  environment?: string;
  permissions?: string[];
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
      const response = { connected: false, message: 'Square OAuth not implemented with Supabase' };
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
      
      // Square OAuth not implemented with Supabase architecture
      toast({
        title: "OAuth Not Available",
        description: "Square OAuth integration is not available in this Supabase-only setup",
        variant: "default"
      });
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
      // Square OAuth revoke not implemented with Supabase architecture
      toast({
        title: "Revoke Not Available", 
        description: "Square OAuth revoke is not available in this Supabase-only setup",
        variant: "default"
      });
      
      setStatus({ connected: false, message: 'Disconnected (placeholder)' });
    } catch (error) {
      console.error('OAuth revocation error:', error);
      toast({
        variant: "destructive",
        title: "Disconnection Error",
        description: error instanceof Error ? error.message : "Failed to disconnect Square account.",
      });
    } finally {
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Square OAuth Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Checking connection status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Square OAuth Connection
          {status?.connected ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="border-red-500 text-red-500">
              <X className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Connect your Square account for seamless payment processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Square OAuth integration is not available in this Supabase-only configuration. 
            This is a placeholder interface for demonstration purposes.
          </AlertDescription>
        </Alert>

        {status?.message && (
          <Alert>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {!status?.connected ? (
            <Button 
              onClick={initiateOAuth} 
              disabled={connecting}
              className="flex items-center gap-2"
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              Connect Square Account
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={revokeOAuth} 
              disabled={revoking}
              className="flex items-center gap-2"
            >
              {revoking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              Disconnect Account
            </Button>
          )}
        </div>

        {status?.connected && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              {status.merchantId && (
                <div>
                  <strong>Merchant ID:</strong>
                  <p className="font-mono text-xs bg-gray-100 p-1 rounded mt-1">
                    {status.merchantId}
                  </p>
                </div>
              )}
              {status.applicationId && (
                <div>
                  <strong>Application ID:</strong>
                  <p className="font-mono text-xs bg-gray-100 p-1 rounded mt-1">
                    {status.applicationId}
                  </p>
                </div>
              )}
              {status.environment && (
                <div>
                  <strong>Environment:</strong>
                  <Badge variant={status.environment === 'production' ? 'default' : 'secondary'}>
                    {status.environment.toUpperCase()}
                  </Badge>
                </div>
              )}
              {status.permissions && status.permissions.length > 0 && (
                <div className="col-span-2">
                  <strong>Permissions:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {status.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SquareOAuthConnect;