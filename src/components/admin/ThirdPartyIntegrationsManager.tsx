
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, ToggleLeft, ToggleRight, Trash2, HelpCircle, ExternalLink, Loader2, AlertTriangle, PlusCircle } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { toast } from 'sonner';

interface Integration {
  id: string;
  service_name: string;
  is_active: boolean;
  api_key_set: boolean;
  other_config: object;
  created_at?: string;
  updated_at?: string;
}

interface IntegrationApiPayload {
    service_name: string;
    api_key?: string;
    other_config: object;
    is_active: boolean;
}

interface IntegrationFormData {
  serviceName: string;
  apiKey: string;
  otherConfig: string;
  isActive: boolean;
}

const ThirdPartyIntegrationsManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [showDeleteIntegrationDialog, setShowDeleteIntegrationDialog] = useState(false);
  const [integrationToDeleteId, setIntegrationToDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: integrationsData, isLoading, isError, error } = useQuery({
    queryKey: ['integrations'],
    queryFn: async (): Promise<Integration[]> => {
      const response = await apiRequest<any>('/admin/integrations');
      const rawIntegrations = response.integrations || response;
      return rawIntegrations.map((int: any) => ({
        ...int,
        other_config: typeof int.other_config === 'string' ? JSON.parse(int.other_config || '{}') : (int.other_config || {}),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const integrations = integrationsData || [];

  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setShowForm(false);
      setEditingIntegration(null);
    },
  };

  const addIntegrationMutation = useMutation({
    mutationFn: (newData: IntegrationApiPayload) => apiRequest<Integration>('/admin/integrations', {
      method: 'POST',
      body: JSON.stringify(newData),
    }),
    ...commonMutationOptions,
    onSuccess: () => {
      commonMutationOptions.onSuccess();
      toast.success('Integration added successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to add integration: ${err.message}`);
    }
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IntegrationApiPayload> }) => apiRequest<Integration>(`/admin/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    ...commonMutationOptions,
    onSuccess: () => {
      commonMutationOptions.onSuccess();
      toast.success('Integration updated successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to update integration: ${err.message}`);
    }
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/integrations/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration deleted successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete integration: ${err.message}`);
    }
  });

  const handleToggleActive = (integration: Integration) => {
    const updatedData: Partial<IntegrationApiPayload> = {
      is_active: !integration.is_active,
      service_name: integration.service_name,
      other_config: integration.other_config,
    };
    updateIntegrationMutation.mutate({ id: integration.id, data: updatedData });
  };

  const handleEditIntegration = (integration: Integration) => {
    setEditingIntegration({
        ...integration,
    });
    setShowForm(true);
  };

  const handleDeleteIntegration = (integrationId: string) => {
    setIntegrationToDeleteId(integrationId);
    setShowDeleteIntegrationDialog(true);
  };

  const confirmDeleteIntegration = () => {
    if (integrationToDeleteId) {
      deleteIntegrationMutation.mutate(integrationToDeleteId);
    }
    setShowDeleteIntegrationDialog(false);
    // setIntegrationToDeleteId(null); // Handled by onOpenChange
  };

  const handleAddNewIntegration = () => {
    setEditingIntegration(null);
    setShowForm(true);
  };

  const handleSaveForm = (formData: IntegrationFormData) => {
    let parsedOtherConfig = {};
    try {
      if (formData.otherConfig) {
        parsedOtherConfig = JSON.parse(formData.otherConfig);
      }
    } catch (error) {
      toast.error('Other Configuration must be valid JSON.');
      return;
    }

    const payload: IntegrationApiPayload = {
      service_name: formData.serviceName,
      other_config: parsedOtherConfig,
      is_active: formData.isActive,
    };

    if (formData.apiKey && formData.apiKey.trim() !== "") {
      payload.api_key = formData.apiKey;
    }

    if (editingIntegration && editingIntegration.id) {
      updateIntegrationMutation.mutate({ id: editingIntegration.id, data: payload });
    } else {
      addIntegrationMutation.mutate(payload);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIntegration(null);
  };

  if (showForm) {
    return (
      <div className="p-4 md:p-6">
        <IntegrationForm
          integration={editingIntegration ? {
            id: editingIntegration.id,
            serviceName: editingIntegration.service_name,
            apiKey: '',
            otherConfig: typeof editingIntegration.other_config === 'object' ? JSON.stringify(editingIntegration.other_config, null, 2) : (editingIntegration.other_config as string || '{}'),
            isActive: editingIntegration.is_active,
          } : null}
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
                    Once you have your Property ID and Widget ID, you can add them via the "Add New Integration" form (use service name e.g., "Tawkto"). Store the Property ID in the API Key field and Widget ID in the 'Other Configuration' field as JSON (e.g., <code>{"{"}"widgetId": "default"{"}"}</code>). The application will then use these to load the chat widget. Alternatively, some platforms allow direct script embedding.
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
                    <Badge variant={integration.is_active ? 'default' : 'outline'}>
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
                      disabled={updateIntegrationMutation.isPending && updateIntegrationMutation.variables?.id === integration.id}
                    >
                      {integration.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditIntegration(integration)}
                      title="Edit"
                       disabled={updateIntegrationMutation.isPending || addIntegrationMutation.isPending}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteIntegration(integration.id)}
                      title="Delete"
                      disabled={deleteIntegrationMutation.isPending && deleteIntegrationMutation.variables === integration.id}
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

      {integrationToDeleteId && (
        <AlertDialog open={showDeleteIntegrationDialog} onOpenChange={(isOpen) => { setShowDeleteIntegrationDialog(isOpen); if(!isOpen) setIntegrationToDeleteId(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete the integration configuration. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteIntegration}
                disabled={deleteIntegrationMutation.isPending && deleteIntegrationMutation.variables === integrationToDeleteId}
              >
                {deleteIntegrationMutation.isPending && deleteIntegrationMutation.variables === integrationToDeleteId ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default ThirdPartyIntegrationsManager;
