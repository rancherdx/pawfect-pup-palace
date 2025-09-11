import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';

interface IntegrationData {
  id?: string;
  serviceName: string;
  apiKey: string;
  otherConfig: string;
  isActive: boolean;
  environment: 'production' | 'sandbox';
}

interface IntegrationFormProps {
  integration?: IntegrationData | null; // Data for editing, null for new
  onSave: (data: IntegrationData) => void;
  onCancel: () => void;
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({ integration, onSave, onCancel }) => {
  const [serviceName, setServiceName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [otherConfig, setOtherConfig] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [environment, setEnvironment] = useState<'production' | 'sandbox'>('production');
  const [configError, setConfigError] = useState<string | null>(null);

  const isEditing = !!integration;

  useEffect(() => {
    if (integration) {
      setServiceName(integration.serviceName || '');
      setApiKey('');
      setOtherConfig(integration.otherConfig || '{}');
      setIsActive(integration.isActive !== undefined ? integration.isActive : true);
      setEnvironment(integration.environment || 'production');
    } else {
      setServiceName('');
      setApiKey('');
      setOtherConfig('{}');
      setIsActive(true);
      setEnvironment('production');
    }
  }, [integration]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);

    let parsedConfig = {};
    try {
      parsedConfig = JSON.parse(otherConfig);
    } catch (error) {
      setConfigError('Other Configuration must be valid JSON.');
      return;
    }

    onSave({
      id: integration?.id,
      serviceName,
      apiKey: apiKey,
      otherConfig: JSON.stringify(parsedConfig),
      isActive,
      environment,
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Integration' : 'Add New Integration'}</CardTitle>
        <CardDescription>
          {isEditing
            ? `Editing configuration for ${integration?.serviceName} (${integration?.environment}).`
            : 'Configure a new third-party service integration.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g., Square, MailChannels"
                disabled={isEditing}
                required
              />
              {isEditing && <p className="text-xs text-muted-foreground">Cannot be changed after creation.</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={environment}
                onValueChange={(value) => setEnvironment(value as 'production' | 'sandbox')}
                disabled={isEditing}
                required
              >
                <SelectTrigger id="environment">
                  <SelectValue placeholder="Select environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                </SelectContent>
              </Select>
              {isEditing && <p className="text-xs text-muted-foreground">Cannot be changed after creation.</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={isEditing ? "Enter new key (leave blank to keep current)" : "Enter API Key"}
            />
             {!isEditing && apiKey && <p className="text-xs text-muted-foreground">API Key will be stored securely.</p>}
             {isEditing && <p className="text-xs text-muted-foreground">Key is write-only. Current key is not displayed.</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherConfig">Other Configuration (JSON)</Label>
            <Textarea
              id="otherConfig"
              value={otherConfig}
              onChange={(e) => setOtherConfig(e.target.value)}
              placeholder='e.g., {"setting1": "value1", "featureEnabled": true}'
              rows={4}
            />
            {configError && <p className="text-xs text-destructive">{configError}</p>}
            <p className="text-xs text-muted-foreground">Must be a valid JSON object.</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(Boolean(checked))}
            />
            <Label htmlFor="isActive" className="font-medium">
              Active
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Save Changes' : 'Add Integration'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default IntegrationForm;
