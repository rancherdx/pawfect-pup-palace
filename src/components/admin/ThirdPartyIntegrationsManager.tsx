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
import { adminApi } from '@/api/adminApi';
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

interface IntegrationApiPayload extends Record<string, unknown> {
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
      const response = await adminApi.getIntegrations();
      const rawIntegrations = (response as { integrations?: unknown[] }).integrations || response;
      return (rawIntegrations as unknown[]).map((int: unknown) => {
        const integrationObj = int as Integration;
        return {
          ...integrationObj,
          other_config: typeof integrationObj.other_config === 'string' ? JSON.parse(integrationObj.other_config || '{}') : (integrationObj.other_config || {}),
        };
      });
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
    mutationFn: (newData: IntegrationApiPayload) => adminApi.createIntegration(newData),
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
    mutationFn: ({ id, data }: { id: string; data: Partial<IntegrationApiPayload> }) => adminApi.updateIntegration(id, data),
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
    mutationFn: (id: string) => adminApi.deleteIntegration(id),
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
                    Square integration enables payment processing with sandbox/production modes, Apple Pay support, and comprehensive webhook handling.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div><strong>Required Information:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Application ID (from Square Developer Dashboard)</li>
                      <li>Access Token (sandbox & production)</li>
                      <li>Location ID (optional, for specific locations)</li>
                      <li>Webhook Signature Key (for payment verification)</li>
                    </ul>
                    <div><strong>Features Supported:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Sandbox/Production toggle for testing</li>
                      <li>Square Web Payments SDK integration</li>
                      <li>Apple Pay domain verification</li>
                      <li>Direct API integration with Square SDK</li>
                      <li>Secure credential storage in Supabase</li>
                    </ul>
                    <div><strong>URLs Needed for Square Dashboard:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Webhook URL: https://yourdomain.com/api/webhooks/square/payment</li>
                      <li>API Configuration: Use Square API Setup in integrations</li>
                      <li>Apple Pay Domain: https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association</li>
                    </ul>
                  </div>
                  <a
                    href="https://developer.squareup.com/apps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                  >
                    Go to Square Developer Dashboard <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>

                <div className="space-y-2 p-4 border rounded-lg dark:border-gray-700">
                  <h4 className="font-semibold text-lg">Setting up MailChannels Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    MailChannels provides reliable transactional email delivery with DKIM signing and multiple reply-to addresses.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div><strong>Required Information:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>MailChannels API Key</li>
                      <li>From Email Address (must match your domain)</li>
                      <li>DKIM Domain and Selector</li>
                      <li>DKIM Private Key (2048-bit RSA)</li>
                    </ul>
                    <div><strong>DNS Records Required:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>SPF: v=spf1 a mx include:relay.mailchannels.net ~all</li>
                      <li>DKIM: [selector]._domainkey TXT record with public key</li>
                      <li>DMARC: _dmarc TXT record (recommended)</li>
                    </ul>
                    <div><strong>Reply-To Categories:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Support: for customer service emails</li>
                      <li>Billing: for payment and invoice emails</li>
                      <li>Notifications: for system alerts</li>
                      <li>Marketing: for promotional emails</li>
                    </ul>
                  </div>
                  <a
                    href="https://www.mailchannels.com/email-api/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                  >
                    MailChannels API Documentation <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>

                <div className="space-y-2 p-4 border rounded-lg dark:border-gray-700">
                  <h4 className="font-semibold text-lg">Setting up Tawk.to Live Chat</h4>
                  <p className="text-sm text-muted-foreground">
                    Tawk.to provides free live chat functionality with customer management features.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div><strong>Required Information:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Property ID (from Tawk.to dashboard)</li>
                      <li>Widget ID (usually 'default' or custom string)</li>
                    </ul>
                    <div><strong>Configuration:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>API Key field: Enter your Property ID</li>
                      <li>Other Config field: {"{"}"widgetId": "default"{"}"}</li>
                    </ul>
                  </div>
                  <a
                    href="https://dashboard.tawk.to/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center"
                  >
                    Go to Tawk.to Dashboard <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>

                <div className="space-y-2 p-4 border rounded-lg dark:border-gray-700">
                  <h4 className="font-semibold text-lg">General Integration Notes</h4>
                  <div className="space-y-2 text-xs">
                    <div><strong>Security:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>All API keys are encrypted using AES-256-GCM</li>
                      <li>Keys are stored securely in the database</li>
                      <li>Never expose sensitive credentials in frontend code</li>
                    </ul>
                    <div><strong>Testing:</strong></div>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Use sandbox/test modes when available</li>
                      <li>Test all integrations thoroughly before production</li>
                      <li>Monitor logs for integration errors</li>
                    </ul>
                  </div>
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
