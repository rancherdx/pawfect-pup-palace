import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, ExternalLink, Copy, Check, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

/**
 * @interface SquareConfig
 * @description Defines the structure for the Square integration configuration, including both sandbox and production credentials.
 */
interface SquareConfig {
  environment: 'sandbox' | 'production';
  sandbox_application_id?: string;
  sandbox_access_token?: string;
  sandbox_location_id?: string;
  sandbox_webhook_signature_key?: string;
  production_application_id?: string;
  production_access_token?: string;
  production_location_id?: string;
  production_webhook_signature_key?: string;
  apple_pay_enabled: boolean;
  apple_pay_verification_file?: File;
}

/**
 * @interface SquareIntegrationSetupProps
 * @description Defines the props for the SquareIntegrationSetup component.
 */
interface SquareIntegrationSetupProps {
  /** Optional initial configuration data to pre-fill the form. */
  initialConfig?: Partial<SquareConfig>;
  /** Callback function to be invoked when the configuration is saved. */
  onSave: (config: SquareConfig) => void;
  /** Callback function to be invoked when the setup is cancelled. */
  onCancel: () => void;
}

/**
 * @component SquareIntegrationSetup
 * @description A comprehensive setup form for the Square integration, featuring a tabbed interface for credentials, URLs, and Apple Pay settings.
 * @param {SquareIntegrationSetupProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered Square integration setup form.
 */
const SquareIntegrationSetup: React.FC<SquareIntegrationSetupProps> = ({
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [config, setConfig] = useState<SquareConfig>({
    environment: 'sandbox',
    apple_pay_enabled: false,
    ...initialConfig,
  });
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);

  const currentDomain = window.location.hostname;
  const isProduction = config.environment === 'production';
  const SUPABASE_PROJECT_ID = 'dpmyursjpbscrfbljtha';

  // Fixed URLs - webhook and checkout must point to Supabase edge functions
  const requiredUrls = {
    webhookUrl: `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/square-webhook`,
    checkoutUrl: `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/square-checkout`,
    applePayVerificationUrl: `https://${currentDomain}/.well-known/apple-developer-merchantid-domain-association`,
    successUrl: `https://${currentDomain}/checkout/success`,
    cancelUrl: `https://${currentDomain}/checkout/cancel`,
  };

  /**
   * Handles changes to form inputs and updates the configuration state.
   * @param {keyof SquareConfig} field - The configuration field to update.
   * @param {string | boolean | File} value - The new value for the field.
   */
  const handleInputChange = (field: keyof SquareConfig, value: string | boolean | File) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Copies a given text to the clipboard and provides user feedback.
   * @param {string} text - The text to copy.
   * @param {string} field - The name of the field being copied, for visual feedback.
   */
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

  /**
   * Handles the selection of the Apple Pay domain verification file.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The file input change event.
   */
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVerificationFile(file);
      setConfig(prev => ({ ...prev, apple_pay_verification_file: file }));
    }
  };

  /**
   * Validates and saves the current configuration by calling the onSave prop.
   */
  const handleSave = () => {
    // Validate required fields based on environment
    const envPrefix = isProduction ? 'production' : 'sandbox';
    const requiredFields = [
      `${envPrefix}_application_id`,
      `${envPrefix}_access_token`,
      `${envPrefix}_location_id`, // Now required
    ];

    const missingFields = requiredFields.filter(field => !config[field as keyof SquareConfig]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields for ${config.environment} environment`);
      return;
    }

    onSave(config);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Square Integration Setup</h1>
          <p className="text-muted-foreground">Configure Square payment processing with sandbox/production environments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </div>

      {/* Environment Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Environment Settings
            <Badge variant={isProduction ? "destructive" : "secondary"}>
              {config.environment.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="environment"
              checked={isProduction}
              onCheckedChange={(checked) => handleInputChange('environment', checked ? 'production' : 'sandbox')}
            />
            <Label htmlFor="environment">
              {isProduction ? 'Production Mode (Live Payments)' : 'Sandbox Mode (Test Payments)'}
            </Label>
          </div>
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isProduction 
                ? "⚠️ Production mode will process real payments. Only enable after thorough testing."
                : "🧪 Sandbox mode uses test data and cards. No real money is processed."
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="urls">URLs & Webhooks</TabsTrigger>
          <TabsTrigger value="applepay">Apple Pay</TabsTrigger>
          <TabsTrigger value="guide">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{config.environment.toUpperCase()} Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="app-id">Application ID *</Label>
                <Input
                  id="app-id"
                  value={config[`${config.environment}_application_id` as keyof SquareConfig] as string || ''}
                  onChange={(e) => handleInputChange(`${config.environment}_application_id` as keyof SquareConfig, e.target.value)}
                  placeholder="sq0idb-..."
                />
              </div>
              
              <div>
                <Label htmlFor="access-token">Access Token *</Label>
                <Input
                  id="access-token"
                  type="password"
                  value={config[`${config.environment}_access_token` as keyof SquareConfig] as string || ''}
                  onChange={(e) => handleInputChange(`${config.environment}_access_token` as keyof SquareConfig, e.target.value)}
                  placeholder="EAAAl..."
                />
              </div>
              
              <div>
                <Label htmlFor="location-id">Location ID *</Label>
                <Input
                  id="location-id"
                  value={config[`${config.environment}_location_id` as keyof SquareConfig] as string || ''}
                  onChange={(e) => handleInputChange(`${config.environment}_location_id` as keyof SquareConfig, e.target.value)}
                  placeholder="L123..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for payment processing. Find this in your Square Dashboard.
                </p>
              </div>
              
              <div>
                <Label htmlFor="webhook-key">Webhook Signature Key</Label>
                <Input
                  id="webhook-key"
                  type="password"
                  value={config[`${config.environment}_webhook_signature_key` as keyof SquareConfig] as string || ''}
                  onChange={(e) => handleInputChange(`${config.environment}_webhook_signature_key` as keyof SquareConfig, e.target.value)}
                  placeholder="wh_..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urls" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Required URLs for Square Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground">
                Copy these URLs and configure them in your Square Developer Dashboard
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(requiredUrls).map(([key, url]) => (
                <div key={key} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input value={url} readOnly className="font-mono text-sm" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(url, key)}
                      >
                        {copiedField === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Configure the webhook URL in your Square Developer Dashboard. The checkout URL is used internally for payment processing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applepay" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Apple Pay Configuration
                <Switch
                  checked={config.apple_pay_enabled}
                  onCheckedChange={(checked) => handleInputChange('apple_pay_enabled', checked)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.apple_pay_enabled && (
                <>
                  <div>
                    <Label htmlFor="verification-file">Domain Verification File</Label>
                    <div className="mt-2">
                      <Input
                        id="verification-file"
                        type="file"
                        onChange={handleFileUpload}
                        accept=".txt,.pem"
                      />
                      {verificationFile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Selected: {verificationFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="space-y-2">
                      <p>To enable Apple Pay:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Go to Square Developer Dashboard → Apple Pay</li>
                        <li>Enter your domain: <code>{currentDomain}</code></li>
                        <li>Download the verification file provided by Square</li>
                        <li>Upload the file here - it will be served at: <code>{requiredUrls.applePayVerificationUrl}</code></li>
                        <li>Complete Apple Pay verification in Square Dashboard</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Setup Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Step 1: Create Square Developer Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign up at <a href="https://developer.squareup.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                      developer.squareup.com <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Step 2: Create Application</h3>
                  <p className="text-sm text-muted-foreground">
                    Create a new application in your Square Dashboard and note the Application ID.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Step 3: Get API Credentials</h3>
                  <p className="text-sm text-muted-foreground">
                    Get your Application ID and Access Token from your Square app's credentials page.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Step 4: Set Up Webhooks</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure webhook endpoints for payment events using the webhook URL provided.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Step 5: Test Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Start with sandbox mode to test payments, then switch to production when ready.
                  </p>
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> Never share your access tokens or webhook signature keys. 
                  All credentials are encrypted and stored securely.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SquareIntegrationSetup;