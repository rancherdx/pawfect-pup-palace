import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api';

/**
 * @interface SquareConfig
 * @description Defines the structure of the Square configuration data being edited in the form.
 */
interface SquareConfig {
  environment: 'sandbox' | 'production';
  applicationId: string;
  accessToken: string;
  locationId: string;
  webhookSignatureKey: string;
}

/**
 * @interface SquareStatus
 * @description Defines the structure for the status of the Square integration loaded from the backend.
 */
interface SquareStatus {
  configured: boolean;
  environment?: string;
  applicationId?: string;
  locationId?: string;
  valid?: boolean;
  testError?: string;
}

/**
 * @component SquareConfiguration
 * @description A component that provides a user interface for configuring and managing the Square payment integration.
 * @returns {React.ReactElement} The rendered Square configuration panel.
 */
const SquareConfiguration = () => {
  const [config, setConfig] = useState<SquareConfig>({
    environment: 'sandbox',
    applicationId: '',
    accessToken: '',
    locationId: '',
    webhookSignatureKey: ''
  });
  
  const [status, setStatus] = useState<SquareStatus>({ configured: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSquareStatus();
  }, []);

  /**
   * Loads the current status of the Square configuration from the backend.
   */
  const loadSquareStatus = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSquareEnvironment();
      setStatus({
        configured: response.is_active,
        environment: response.environment as 'sandbox' | 'production' || 'sandbox',
        applicationId: response.application_id || '',
        locationId: response.location_id || ''
      });
      
      if (response.is_active) {
        setConfig(prev => ({
          ...prev,
          environment: response.environment as 'sandbox' | 'production' || 'sandbox'
        }));
      }
    } catch (error) {
      console.error('Failed to load Square status:', error);
      toast.error('Failed to load Square configuration status');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the saving of the Square configuration.
   * It validates required fields and calls the API to save the data.
   */
  const handleSave = async () => {
    const requiredFields = ['applicationId', 'accessToken'];
    for (const field of requiredFields) {
      if (!config[field as keyof SquareConfig]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    try {
      setSaving(true);
      await adminApi.switchSquareEnvironment(config.environment);
      toast.success('Square configuration saved successfully');
      await loadSquareStatus();
    } catch (error) {
      console.error('Failed to save Square config:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Initiates a test of the Square API connection with the provided credentials.
   */
  const testConfiguration = async () => {
    if (!config.applicationId || !config.accessToken) {
      toast.error('Please fill in Application ID and Access Token first');
      return;
    }

    try {
      setTesting(true);
      const testResult = await adminApi.testSquareConnection();
      toast.success(testResult.message || 'Square test completed successfully');
    } catch (error) {
      console.error('Configuration test failed:', error);
      toast.error(error instanceof Error ? error.message : 'Configuration test failed');
    } finally {
      setTesting(false);
    }
  };

  /**
   * Handles changes to form inputs and updates the configuration state.
   * @param {keyof SquareConfig} field - The configuration field to update.
   * @param {string | boolean} value - The new value for the field.
   */
  const handleInputChange = (field: keyof SquareConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading Square configuration...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Square Payment Configuration</h1>
          <p className="text-muted-foreground">Configure Square payment processing with Supabase integration</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={testConfiguration}
            disabled={testing || !config.applicationId || !config.accessToken}
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Testing...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Test Config
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      {/* Current Status */}
      {status.configured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Current Status
              {status.valid ? (
                <span className="text-green-600 text-sm font-normal">✓ Active</span>
              ) : (
                <span className="text-red-600 text-sm font-normal">⚠ Issues</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Environment:</span> {status.environment}
              </div>
              <div>
                <span className="font-medium">Integration:</span> Supabase
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="environment"
              checked={config.environment === 'production'}
              onCheckedChange={(checked) => handleInputChange('environment', checked ? 'production' : 'sandbox')}
            />
            <Label htmlFor="environment">
              {config.environment === 'production' ? 'Production (Live Payments)' : 'Sandbox (Test Payments)'}
            </Label>
          </div>
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {config.environment === 'production' 
                ? "⚠️ Production mode processes real payments. Ensure thorough testing first."
                : "🧪 Sandbox mode uses test payments. Use Square's test card numbers."
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* API Credentials */}
      <Card>
        <CardHeader>
          <CardTitle>API Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="applicationId">Application ID *</Label>
            <Input
              id="applicationId"
              value={config.applicationId}
              onChange={(e) => handleInputChange('applicationId', e.target.value)}
              placeholder={config.environment === 'sandbox' ? 'sandbox-sq0idb-...' : 'sq0idb-...'}
            />
          </div>
          
          <div>
            <Label htmlFor="accessToken">Access Token *</Label>
            <Input
              id="accessToken"
              type="password"
              value={config.accessToken}
              onChange={(e) => handleInputChange('accessToken', e.target.value)}
              placeholder={config.environment === 'sandbox' ? 'EAAAl...' : 'EAAAl...'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Supabase Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Supabase Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-2">This configuration uses Supabase for:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Secure credential storage with encryption</li>
                <li>Payment processing via Supabase Edge Functions</li>
                <li>Transaction logging in the database</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareConfiguration;