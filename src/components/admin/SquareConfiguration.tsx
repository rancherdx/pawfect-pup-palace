import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, AlertTriangle, Info, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api';

interface SquareConfig {
  environment: 'sandbox' | 'production';
  applicationId: string;
  accessToken: string;
  locationId: string;
  webhookSignatureKey: string;
}

interface SquareStatus {
  configured: boolean;
  environment?: string;
  applicationId?: string;
  locationId?: string;
  webhookConfigured?: boolean;
  valid?: boolean;
  testError?: string;
}

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
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const currentDomain = window.location.hostname;
  const webhookUrl = `https://${currentDomain}/api/webhooks/square/payment`;

  useEffect(() => {
    loadSquareStatus();
  }, []);

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
        // Don't load actual credentials for security, just show status
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

  const handleSave = async () => {
    // Validate required fields
    const requiredFields = ['applicationId', 'accessToken'];
    for (const field of requiredFields) {
      if (!config[field as keyof SquareConfig]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    try {
      setSaving(true);
      // Square configuration not implemented with Supabase-only architecture
      toast.success('Square configuration display updated (actual saving not implemented)');
      await loadSquareStatus();
    } catch (error) {
      console.error('Failed to save Square config:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const testConfiguration = async () => {
    if (!config.applicationId || !config.accessToken) {
      toast.error('Please fill in Application ID and Access Token first');
      return;
    }

    try {
      setTesting(true);
      // Square connection test not implemented with Supabase-only architecture
      const testResult = await adminApi.testSquareConnection();
      toast.success('Square test completed (placeholder implementation)');
    } catch (error) {
      console.error('Configuration test failed:', error);
      toast.error(error instanceof Error ? error.message : 'Configuration test failed');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

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
          <p className="text-muted-foreground">Configure Square payment processing with direct API credentials</p>
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
                <span className="font-medium">Application ID:</span> {status.applicationId}
              </div>
              <div>
                <span className="font-medium">Location ID:</span> {status.locationId}
              </div>
              <div>
                <span className="font-medium">Webhooks:</span> {status.webhookConfigured ? 'Configured' : 'Not configured'}
              </div>
            </div>
            {status.testError && (
              <Alert className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-600">
                  {status.testError}
                </AlertDescription>
              </Alert>
            )}
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
          
          <div>
            <Label htmlFor="locationId">Location ID (Optional)</Label>
            <Input
              id="locationId"
              value={config.locationId}
              onChange={(e) => handleInputChange('locationId', e.target.value)}
              placeholder="L..."
            />
            <p className="text-sm text-muted-foreground mt-1">
              Leave empty to use your default location
            </p>
          </div>
          
          <div>
            <Label htmlFor="webhookSignatureKey">Webhook Signature Key (Optional)</Label>
            <Input
              id="webhookSignatureKey"
              type="password"
              value={config.webhookSignatureKey}
              onChange={(e) => handleInputChange('webhookSignatureKey', e.target.value)}
              placeholder="wh_..."
            />
            <p className="text-sm text-muted-foreground mt-1">
              Required for webhook verification. Get this from your Square Developer Dashboard.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Webhook URL for Square Dashboard</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                >
                  {copiedField === 'webhook' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium mb-2">To configure webhooks in Square:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to Square Developer Dashboard → Your App → Webhooks</li>
                  <li>Add the webhook URL above</li>
                  <li>Subscribe to these events: payment.created, payment.updated, order.created, order.updated</li>
                  <li>Copy the Webhook Signature Key and paste it above</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Test Cards (for sandbox) */}
      {config.environment === 'sandbox' && (
        <Card>
          <CardHeader>
            <CardTitle>Test Cards for Sandbox</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Successful Payments</h4>
                <div className="font-mono text-sm space-y-1">
                  <div>4111 1111 1111 1111 (Visa)</div>
                  <div>5555 5555 5555 4444 (Mastercard)</div>
                  <div>3782 8224 6310 005 (Amex)</div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Failed Payments</h4>
                <div className="font-mono text-sm space-y-1">
                  <div>4000 0000 0000 0002 (Declined)</div>
                  <div>4000 0000 0000 0069 (Expired)</div>
                  <div>4000 0000 0000 0127 (Incorrect CVC)</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Use any future expiry date and any 3-4 digit CVC for test cards.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SquareConfiguration;