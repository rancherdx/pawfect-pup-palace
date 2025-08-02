import { useState, useEffect } from "react";
import { CreditCard, TestTube, Globe, Key, MapPin, Webhook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SquareConfig {
  environment: 'sandbox' | 'production';
  sandboxAccessToken: string;
  productionAccessToken: string;
  sandboxLocationId: string;
  productionLocationId: string;
  webhookSignatureKey: string;
  isActive: boolean;
}

const SquareConfiguration = () => {
  const [config, setConfig] = useState<SquareConfig>({
    environment: 'sandbox',
    sandboxAccessToken: '',
    productionAccessToken: '',
    sandboxLocationId: '',
    productionLocationId: '',
    webhookSignatureKey: '',
    isActive: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSquareConfig();
  }, []);

  const loadSquareConfig = async () => {
    setIsLoading(true);
    try {
      const jwtToken = localStorage.getItem('jwt');
      const response = await fetch('/api/admin/integrations', {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const squareIntegration = data.integrations?.find((int: unknown) => (int as { serviceName: string }).serviceName === 'Square');
        
        if (squareIntegration) {
          const otherConfig = JSON.parse(squareIntegration.otherConfig || '{}');
          setConfig({
            environment: otherConfig.environment || 'sandbox',
            sandboxAccessToken: '', // Never populate for security
            productionAccessToken: '', // Never populate for security
            sandboxLocationId: otherConfig.sandboxLocationId || '',
            productionLocationId: otherConfig.productionLocationId || '',
            webhookSignatureKey: '', // Never populate for security
            isActive: squareIntegration.isActive || false
          });
        }
      }
    } catch (error) {
      console.error('Error loading Square config:', error);
      toast({
        title: "Error",
        description: "Failed to load Square configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const jwtToken = localStorage.getItem('jwt');
      
      // Prepare the configuration object
      const integrationData = {
        serviceName: 'Square',
        apiKey: config.environment === 'sandbox' ? config.sandboxAccessToken : config.productionAccessToken,
        otherConfig: JSON.stringify({
          environment: config.environment,
          sandboxLocationId: config.sandboxLocationId,
          productionLocationId: config.productionLocationId,
          webhookSignatureKey: config.webhookSignatureKey
        }),
        isActive: config.isActive
      };

      const response = await fetch('/api/admin/integrations/square', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(integrationData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Square configuration saved successfully"
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving Square config:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save Square configuration",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getWebhookUrls = () => {
    const baseUrl = 'https://gdspuppies.com';
    return {
      payment: `${baseUrl}/api/webhooks/square/payment`,
      inventory: `${baseUrl}/api/webhooks/square/inventory`
    };
  };

  const webhookUrls = getWebhookUrls();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <CreditCard className="mr-2 h-6 w-6 text-brand-red" />
            Square Payment Configuration
          </h2>
          <p className="text-muted-foreground">Configure Square payment processing for GDS Puppies</p>
        </div>
        <Badge variant={config.isActive ? "default" : "secondary"}>
          {config.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="mr-2 h-5 w-5" />
            Environment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.environment === 'production'}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ ...prev, environment: checked ? 'production' : 'sandbox' }))
              }
            />
            <Label className="flex items-center">
              {config.environment === 'production' ? (
                <>
                  <Globe className="mr-2 h-4 w-4 text-green-600" />
                  Production Mode
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4 text-amber-600" />
                  Sandbox Mode
                </>
              )}
            </Label>
          </div>

          <Alert>
            <AlertDescription>
              {config.environment === 'production' 
                ? "Production mode will process real payments. Ensure all settings are correct."
                : "Sandbox mode is for testing. No real payments will be processed."
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            API Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sandboxToken">Sandbox Access Token</Label>
            <Input
              id="sandboxToken"
              type="password"
              placeholder="Enter sandbox access token"
              value={config.sandboxAccessToken}
              onChange={(e) => setConfig(prev => ({ ...prev, sandboxAccessToken: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productionToken">Production Access Token</Label>
            <Input
              id="productionToken"
              type="password"
              placeholder="Enter production access token"
              value={config.productionAccessToken}
              onChange={(e) => setConfig(prev => ({ ...prev, productionAccessToken: e.target.value }))}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="sandboxLocationId">Sandbox Location ID</Label>
            <Input
              id="sandboxLocationId"
              placeholder="Enter sandbox location ID"
              value={config.sandboxLocationId}
              onChange={(e) => setConfig(prev => ({ ...prev, sandboxLocationId: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productionLocationId">Production Location ID</Label>
            <Input
              id="productionLocationId"
              placeholder="Enter production location ID"
              value={config.productionLocationId}
              onChange={(e) => setConfig(prev => ({ ...prev, productionLocationId: e.target.value }))}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="webhookSignature">Webhook Signature Key</Label>
            <Input
              id="webhookSignature"
              type="password"
              placeholder="Enter webhook signature key"
              value={config.webhookSignatureKey}
              onChange={(e)
              onChange={(e) => setConfig(prev => ({ ...prev, webhookSignatureKey: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Webhook className="mr-2 h-5 w-5" />
            Webhook URLs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Configure these URLs in your Square Developer Dashboard for webhook notifications.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Payment Webhook URL</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input value={webhookUrls.payment} readOnly className="bg-gray-50" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(webhookUrls.payment)}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Inventory Webhook URL</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input value={webhookUrls.inventory} readOnly className="bg-gray-50" />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(webhookUrls.inventory)}
                >
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.isActive}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, isActive: checked }))}
            />
            <Label>Enable Square Payments</Label>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={loadSquareConfig} disabled={isLoading}>
              {isLoading ? "Loading..." : "Reload"}
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-brand-red hover:bg-red-700">
              {isSaving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SquareConfiguration;
