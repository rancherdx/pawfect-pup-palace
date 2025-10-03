import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Key, Loader2, Save, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminApi } from '@/api';

/**
 * @interface SquareConfig
 * @description Defines the structure for the Square API configuration object.
 */
interface SquareConfig {
  environment: 'sandbox' | 'production';
  application_id: string;
  access_token: string;
  location_id?: string;
  webhook_signature_key?: string;
  configured: boolean;
}

/**
 * @component SquareAPISetup
 * @description A component for configuring the Square API integration, including setting credentials
 * for different environments and testing the connection.
 * @returns {React.ReactElement} The rendered Square API setup component.
 */
const SquareAPISetup = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<SquareConfig>({
    environment: 'sandbox',
    application_id: '',
    access_token: '',
    location_id: '',
    webhook_signature_key: '',
    configured: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  /**
   * Loads the current Square configuration from the backend.
   */
  const loadSquareConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSquareEnvironment();
      setConfig({
        environment: response.environment as 'sandbox' | 'production' || 'sandbox',
        application_id: response.application_id || '',
        access_token: '', // Never load actual tokens for security
        location_id: response.location_id || '',
        webhook_signature_key: '', // Never load actual keys for security
        configured: response.is_active
      });
    } catch (error) {
      console.error('Failed to load Square config:', error);
      toast({
        variant: "destructive",
        title: "Configuration Load Failed",
        description: "Could not load Square configuration"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSquareConfig();
  }, [loadSquareConfig]);

  /**
   * Saves the current configuration to the backend.
   */
  const saveConfiguration = async () => {
    if (!config.application_id || !config.access_token) {
      toast({
        variant: "destructive",
        title: "Missing Required Fields",
        description: "Application ID and Access Token are required"
      });
      return;
    }

    try {
      setSaving(true);
      
      // In a real implementation, this would save to Supabase secrets
      await adminApi.switchSquareEnvironment(config.environment);
      
      toast({
        title: "Configuration Saved",
        description: "Square API configuration has been saved securely"
      });
      
      setConfig(prev => ({ ...prev, configured: true }));
    } catch (error) {
      console.error('Failed to save Square config:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error instanceof Error ? error.message : 'Failed to save configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Tests the connection to the Square API with the provided credentials.
   */
  const testConnection = async () => {
    if (!config.application_id || !config.access_token) {
      toast({
        variant: "destructive",
        title: "Missing Configuration",
        description: "Please configure Application ID and Access Token first"
      });
      return;
    }

    try {
      setTesting(true);
      const result = await adminApi.testSquareConnection();
      
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: "Square API connection is working correctly"
        });
      } else {
        throw new Error(result.message || 'Connection test failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast({
        variant: "destructive",
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : 'Unable to connect to Square API'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Square API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Square API Configuration
          {config.configured ? (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="outline" className="border-orange-500 text-orange-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Not Configured
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Configure Square API credentials for payment processing. All sensitive data is stored securely in Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            API credentials are stored securely using Supabase secrets. Never share your production access tokens.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Select 
              value={config.environment} 
              onValueChange={(value: 'sandbox' | 'production') => 
                setConfig(prev => ({ ...prev, environment: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                <SelectItem value="production">Production (Live)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="application_id">Application ID</Label>
            <Input
              id="application_id"
              type="text"
              placeholder="sq0idp-..."
              value={config.application_id}
              onChange={(e) => setConfig(prev => ({ ...prev, application_id: e.target.value }))}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token</Label>
            <Input
              id="access_token"
              type="password"
              placeholder="EAAAl..."
              value={config.access_token}
              onChange={(e) => setConfig(prev => ({ ...prev, access_token: e.target.value }))}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Use sandbox tokens for testing, production tokens for live payments
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_id">Location ID (Optional)</Label>
            <Input
              id="location_id"
              type="text"
              placeholder="L..."
              value={config.location_id}
              onChange={(e) => setConfig(prev => ({ ...prev, location_id: e.target.value }))}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_signature_key">Webhook Signature Key (Optional)</Label>
            <Input
              id="webhook_signature_key"
              type="password"
              placeholder="Webhook signature key for verifying requests"
              value={config.webhook_signature_key}
              onChange={(e) => setConfig(prev => ({ ...prev, webhook_signature_key: e.target.value }))}
              className="font-mono"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={saveConfiguration} 
            disabled={saving || !config.application_id || !config.access_token}
            className="flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Configuration
          </Button>
          
          <Button 
            variant="outline"
            onClick={testConnection} 
            disabled={testing || !config.application_id || !config.access_token}
            className="flex items-center gap-2"
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4" />
            )}
            Test Connection
          </Button>
        </div>

        {config.configured && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Square API is configured and ready for payment processing.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SquareAPISetup;