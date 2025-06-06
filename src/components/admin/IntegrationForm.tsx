import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';

interface IntegrationData {
  id?: string; // Optional: only present for existing integrations
  serviceName: string;
  apiKey: string; // Will be empty if user wants to keep existing, or new key
  otherConfig: string; // JSON string
  isActive: boolean;
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
  const [configError, setConfigError] = useState<string | null>(null);

  const isEditing = !!integration;

  useEffect(() => {
    if (integration) {
      setServiceName(integration.serviceName || '');
      // API Key is not pre-filled for security; user enters a new one or leaves blank
      setApiKey('');
      setOtherConfig(integration.otherConfig || '');
      setIsActive(integration.isActive !== undefined ? integration.isActive : true);
    } else {
      // Defaults for new form
      setServiceName('');
      setApiKey('');
      setOtherConfig('{}'); // Default to empty JSON object
      setIsActive(true);
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
      apiKey: apiKey, // Send the entered API key (empty if unchanged for existing)
      otherConfig: JSON.stringify(parsedConfig), // Ensure it's stringified back if parsed for validation
      isActive,
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Integration' : 'Add New Integration'}</CardTitle>
        <CardDescription>
          {isEditing
            ? `Editing configuration for ${integration?.serviceName}.`
            : 'Configure a new third-party service integration.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="serviceName">Service Name</Label>
            <Input
              id="serviceName"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="e.g., SendGrid, Google Analytics"
              disabled={isEditing}
              required
            />
            {isEditing && <p className="text-xs text-muted-foreground">Service name cannot be changed after creation.</p>}
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
