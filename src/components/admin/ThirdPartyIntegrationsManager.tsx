import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, ToggleLeft, ToggleRight, Trash2, X, HelpCircle, ExternalLink } from 'lucide-react';
import IntegrationForm from './IntegrationForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface Integration {
  id: string;
  serviceName: string;
  isActive: boolean;
  apiKeySet: boolean;
  otherConfig?: string;
}

interface IntegrationFormData {
    id?: string;
    serviceName: string;
    apiKey: string;
    otherConfig: string;
    isActive: boolean;
}

const mockIntegrations: Integration[] = [
  { id: '1', serviceName: 'SendGrid', isActive: true, apiKeySet: true, otherConfig: '{"region": "us-east-1"}' },
  { id: '2', serviceName: 'Google Analytics', isActive: false, apiKeySet: false, otherConfig: '{"trackingId": "UA-12345-Y"}' },
  { id: '3', serviceName: 'Facebook Pixel', isActive: true, apiKeySet: true, otherConfig: '{"pixelId": "fb-pixel-123"}' },
  { id: '4', serviceName: 'Tawkto', isActive: false, apiKeySet: false, otherConfig: '{"propertyId": "YOUR_PROPERTY_ID", "widgetId": "default"}'} // Example Tawkto entry
];

const ThirdPartyIntegrationsManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);

  const handleToggleActive = (integrationId: string, isActive: boolean) => {
    console.log(`Toggling active status for ${integrationId} to ${!isActive}`);
    setIntegrations(prev =>
      prev.map(int => int.id === integrationId ? { ...int, isActive: !int.isActive } : int)
    );
  };

  const handleEditIntegration = (integration: Integration) => {
    console.log(`Editing integration ${integration.id}`);
    setEditingIntegration(integration);
    setShowForm(true);
  };

  const handleDeleteIntegration = (integrationId: string) => {
    console.log(`Deleting integration ${integrationId}`);
    setIntegrations(prev => prev.filter(int => int.id !== integrationId));
  };

  const handleAddNewIntegration = () => {
    console.log("Add new integration clicked");
    setEditingIntegration(null);
    setShowForm(true);
  };

  const handleSaveForm = (data: IntegrationFormData) => {
    console.log("Form data received:", data);
    if (editingIntegration) {
      console.log("Updating existing integration:", editingIntegration.id, data);
      setIntegrations(prev =>
        prev.map(int => int.id === editingIntegration.id ? {
            ...int,
            serviceName: data.serviceName,
            isActive: data.isActive,
            otherConfig: data.otherConfig,
            apiKeySet: data.apiKey ? true : int.apiKeySet,
        } : int)
      );
    } else {
      console.log("Adding new integration:", data);
      const newIntegration: Integration = {
        id: crypto.randomUUID(),
        serviceName: data.serviceName,
        isActive: data.isActive,
        apiKeySet: !!data.apiKey,
        otherConfig: data.otherConfig,
      };
      setIntegrations(prev => [...prev, newIntegration]);
    }
    setShowForm(false);
    setEditingIntegration(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIntegration(null);
  };

  if (showForm) {
    return (
      <div className="p-4 md:p-6">
        <IntegrationForm
          integration={editingIntegration}
          onSave={handleSaveForm}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Third-Party Integrations Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure and manage API keys and settings for external services.
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" title="View Setup Guides">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Third-Party Integration Setup Guides</DialogTitle>
                <DialogDescription>
                  General guidance for setting up common integrations. Always refer to the official documentation for the most up-to-date information.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto px-2">
                {/* Square Integration Guide */}
                <div className="space-y-2 p-4 border rounded-lg dark:border-gray-700">
                  <h4 className="font-semibold text-lg">Setting up Square Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    To connect Square for payment processing, you'll need your Square Access Token and optionally your Location ID.
                    For webhook signature verification, you must also configure a Webhook Signing Secret in your Square Developer Dashboard and set it in your worker's environment variables.
                  </p>
                  <a
                    href="https://developer.squareup.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                  >
                    Go to Square Developer Dashboard <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 p-2 bg-amber-50 dark:bg-amber-900/30 rounded">
                    <strong>Important Security Note:</strong> Ensure <code>ENCRYPTION_KEY_SECRET</code> is set in your worker's environment variables. This key is crucial for securing the API keys you store. It must be a 64-character hex string.
                  </p>
                </div>

                {/* SendGrid (Email Service) Guide */}
                <div className="space-y-2 p-4 border rounded-lg dark:border-gray-700">
                  <h4 className="font-semibold text-lg">Setting up Email Service (e.g., SendGrid)</h4>
                  <p className="text-sm text-muted-foreground">
                    To enable automated email sending (like welcome emails or receipts), you'll need an API Key from your chosen email provider (e.g., SendGrid).
                    This API key should be stored securely.
                  </p>
                  <a
                    href="https://docs.sendgrid.com/ui/account-and-settings/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                  >
                    Find SendGrid API Keys Documentation <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                   <p className="text-xs text-muted-foreground mt-1">
                    Remember to add the chosen service (e.g., "SendGrid") via the "Add New Integration" form and configure its API key.
                  </p>
                </div>

                {/* Tawk.to Live Chat Guide */}
                <div className="space-y-2 p-4 border rounded-lg dark:border-gray-700">
                  <h4 className="font-semibold text-lg">Setting up Tawk.to Live Chat</h4>
                  <p className="text-sm text-muted-foreground">
                    Tawk.to is a free live chat service. To integrate, you'll need your Property ID and Widget ID (often 'default' or a specific string). These are used to form the embed script URL.
                  </p>
                  <a
                    href="https://dashboard.tawk.to/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                  >
                    Go to Tawk.to Dashboard <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                  <p className="text-xs text-muted-foreground mt-1">
                    Once you have your Property ID and Widget ID, you can add them via the "Add New Integration" form (use service name e.g., "Tawkto"). Store the Property ID in the API Key field and Widget ID in the 'Other Configuration' field as JSON (e.g., <code>{"widgetId": "default"}</code>). The application will then use these to load the chat widget. Alternatively, some platforms allow direct script embedding.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleAddNewIntegration}>Add New Integration</Button>
        </div>
      </div>

      {/* Table remains the same */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {integrations.length > 0 ? (
              integrations.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell className="font-medium">{integration.serviceName}</TableCell>
                  <TableCell>
                    <Badge variant={integration.isActive ? 'success' : 'outline'}>
                      {integration.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={integration.apiKeySet ? 'default' : 'secondary'}>
                      {integration.apiKeySet ? 'Configured' : 'Not Set'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleActive(integration.id, integration.isActive)}
                      title={integration.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {integration.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditIntegration(integration)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteIntegration(integration.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No third-party integrations configured yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ThirdPartyIntegrationsManager;
