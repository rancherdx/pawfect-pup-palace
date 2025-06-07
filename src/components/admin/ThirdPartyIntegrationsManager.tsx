import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, ToggleLeft, ToggleRight, Trash2, HelpCircle, ExternalLink, Loader2, AlertTriangle, PlusCircle } from 'lucide-react';
import IntegrationForm, { IntegrationFormData } from './IntegrationForm';
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminAPI } from '@/api';
import { toast } from 'sonner';

// Matches backend response structure, other_config parsed to object
interface Integration {
  id: string;
  service_name: string;
  is_active: boolean;
  api_key_set: boolean;
  other_config: object; // Store as object after parsing
  created_at?: string;
  updated_at?: string;
}

// For data payload to API (POST/PUT)
interface IntegrationApiPayload {
    service_name: string;
    api_key?: string; // Optional: only if updating/setting for the first time
    other_config: object;
    is_active: boolean;
}

const ThirdPartyIntegrationsManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  // configError state might be needed for form validation if not handled by IntegrationForm directly
  // const [configError, setConfigError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: integrationsData, isLoading, isError, error } = useQuery<Integration[], Error>(
    ['integrations'],
    async () => {
      const response = await fetchAdminAPI('/api/admin/integrations');
      const rawIntegrations = response.integrations || response; // Adapt to actual response
      return rawIntegrations.map((int: any) => ({
        ...int,
        other_config: typeof int.other_config === 'string' ? JSON.parse(int.other_config || '{}') : (int.other_config || {}),
      }));
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (err) => {
        toast.error(`Failed to fetch integrations: ${err.message}`);
      }
    }
  );
  const integrations = integrationsData || [];

  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      setShowForm(false);
      setEditingIntegration(null);
    },
  };

  const addIntegrationMutation = useMutation<Integration, Error, IntegrationApiPayload>(
    (newData) => fetchAdminAPI('/api/admin/integrations', {
      method: 'POST',
      body: JSON.stringify(newData),
    }),
    {
      ...commonMutationOptions,
      onSuccess: () => {
        commonMutationOptions.onSuccess();
        toast.success('Integration added successfully!');
      },
      onError: (err) => {
        toast.error(`Failed to add integration: ${err.message}`);
      }
    }
  );

  const updateIntegrationMutation = useMutation<Integration, Error, { id: string; data: Partial<IntegrationApiPayload> }>(
    ({ id, data }) => fetchAdminAPI(`/api/admin/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    {
      ...commonMutationOptions,
      onSuccess: () => {
        commonMutationOptions.onSuccess();
        toast.success('Integration updated successfully!');
      },
      onError: (err) => {
        toast.error(`Failed to update integration: ${err.message}`);
      }
    }
  );

  const deleteIntegrationMutation = useMutation<void, Error, string>(
    (id) => fetchAdminAPI(`/api/admin/integrations/${id}`, { method: 'DELETE' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['integrations']);
        toast.success('Integration deleted successfully!');
      },
      onError: (err) => {
        toast.error(`Failed to delete integration: ${err.message}`);
      }
    }
  );

  const handleToggleActive = (integration: Integration) => {
    const updatedData: Partial<IntegrationApiPayload> = {
      is_active: !integration.is_active,
      service_name: integration.service_name,
      other_config: integration.other_config,
    };
    updateIntegrationMutation.mutate({ id: integration.id, data: updatedData });
  };

  const handleEditIntegration = (integration: Integration) => {
    // Map Integration (from API/query) to what IntegrationForm expects (IntegrationFormData)
    // The form expects otherConfig as a string.
    setEditingIntegration({
        ...integration, // Contains id, service_name, is_active, api_key_set, other_config (object)
        // serviceName: integration.service_name, // No, IntegrationForm expects integration.serviceName
        // isActive: integration.is_active, // No, IntegrationForm expects integration.isActive
        // otherConfig: typeof integration.other_config === 'object' ? JSON.stringify(integration.other_config, null, 2) : (integration.other_config || '{}'),
        // apiKeySet: integration.api_key_set, // Form doesn't directly use apiKeySet, but good to pass if needed
    });
    setShowForm(true);
  };

  const handleDeleteIntegration = (integrationId: string) => {
    // Consider adding a confirmation dialog here
    // Example: if (window.confirm("Are you sure you want to delete this integration?")) { ... }
    deleteIntegrationMutation.mutate(integrationId);
  };

  const handleAddNewIntegration = () => {
    setEditingIntegration(null); // Clear any editing state
    setShowForm(true);
  };

  const handleSaveForm = (formData: IntegrationFormData) => {
    // formData comes from IntegrationForm.tsx
    // It should have: serviceName, apiKey (optional), otherConfig (string), isActive
    // We need to convert it to IntegrationApiPayload

    let parsedOtherConfig = {};
    try {
      if (formData.otherConfig) { // Ensure otherConfig is not empty before parsing
        parsedOtherConfig = JSON.parse(formData.otherConfig);
      }
    } catch (error) {
      toast.error('Other Configuration must be valid JSON.');
      return; // Prevent submission
    }

    const payload: IntegrationApiPayload = {
      service_name: formData.serviceName, // Form uses serviceName
      other_config: parsedOtherConfig,
      is_active: formData.isActive,
    };

    // Only include api_key in payload if it's explicitly provided by user in the form
    // (meaning they want to set or change it)
    if (formData.apiKey && formData.apiKey.trim() !== "") {
      payload.api_key = formData.apiKey;
    }

    if (editingIntegration && editingIntegration.id) {
      // If we are editing, and no new API key is provided, we should NOT send api_key field,
      // so backend doesn't try to update it with an empty value or re-encrypt nothing.
      // The logic above already handles this: if formData.apiKey is empty, it's not added to payload.
      updateIntegrationMutation.mutate({ id: editingIntegration.id, data: payload });
    } else {
      // For new integrations, if no API key is provided, it's fine, it just means api_key_set will be false.
      addIntegrationMutation.mutate(payload);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIntegration(null);
  };

  // If form is shown, render only the form
  if (showForm) {
    return (
      <div className="p-4 md:p-6">
        <IntegrationForm
          // Pass data in the shape IntegrationForm expects
          // It expects: id?, serviceName, apiKey, otherConfig (string), isActive
          integration={editingIntegration ? {
            id: editingIntegration.id,
            serviceName: editingIntegration.service_name,
            apiKey: '', // API key is write-only, so form starts blank for it
            otherConfig: typeof editingIntegration.other_config === 'object' ? JSON.stringify(editingIntegration.other_config, null, 2) : (editingIntegration.other_config as string || '{}'),
            isActive: editingIntegration.is_active,
            apiKeySet: editingIntegration.api_key_set // Pass this to the form for display logic (e.g. "API Key (already set)")
          } : null} // For new integration, pass null or undefined
          onSave={handleSaveForm}
          onCancel={handleCancelForm}
          // Pass loading states from relevant mutations
          isSaving={addIntegrationMutation.isLoading || updateIntegrationMutation.isLoading}
        />
      </div>
    );
  }

  // Otherwise, show the table and main UI
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
          {/* Dialog for Setup Guides - remains unchanged */}
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
                    Once you have your Property ID and Widget ID, you can add them via the "Add New Integration" form (use service name e.g., "Tawkto"). Store the Property ID in the API Key field and Widget ID in the 'Other Configuration' field as JSON (e.g., <code>{`{"widgetId": "default"}`}</code>). The application will then use these to load the chat widget. Alternatively, some platforms allow direct script embedding.
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
          <Button onClick={handleAddNewIntegration}><PlusCircle className="mr-2 h-4 w-4" />Add New Integration</Button>
        </div>
      </div>

      {/* Table Display */}
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
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center h-32"><Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-red" /></TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={4} className="text-center text-red-500 h-32"><AlertTriangle className="mx-auto h-8 w-8 mb-2" />Error: {error.message}</TableCell></TableRow>
            ) : integrations.length > 0 ? (
              integrations.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell className="font-medium">{integration.service_name}</TableCell>
                  <TableCell>
                    <Badge variant={integration.is_active ? 'success' : 'outline'}>
                      {integration.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={integration.api_key_set ? 'default' : 'secondary'}>
                      {integration.api_key_set ? 'Configured' : 'Not Set'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleActive(integration)}
                      title={integration.is_active ? 'Deactivate' : 'Activate'}
                      disabled={updateIntegrationMutation.isLoading && updateIntegrationMutation.variables?.id === integration.id}
                    >
                      {integration.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditIntegration(integration)}
                      title="Edit"
                       disabled={updateIntegrationMutation.isLoading || addIntegrationMutation.isLoading}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteIntegration(integration.id)}
                      title="Delete"
                      disabled={deleteIntegrationMutation.isLoading && deleteIntegrationMutation.variables === integration.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32">
                  No third-party integrations configured yet. Click "Add New Integration" to begin.
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
