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
  id: string; // This will be deprecated, but we'll keep it for now for keys
  service_name: string;
  environment: 'production' | 'sandbox';
  is_active: boolean;
  api_key_set: boolean;
  other_config: object;
  created_at?: string;
  updated_at?: string;
}

interface IntegrationApiPayload {
    service_name: string;
    environment: 'production' | 'sandbox';
    api_key?: string;
    other_config?: object;
    is_active?: boolean;
}

interface IntegrationFormData {
  serviceName: string;
  apiKey: string;
  otherConfig: string;
  isActive: boolean;
  environment: 'production' | 'sandbox';
}

const ThirdPartyIntegrationsManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [showDeleteIntegrationDialog, setShowDeleteIntegrationDialog] = useState(false);
  const [integrationToDelete, setIntegrationToDelete] = useState<{ service_name: string, environment: string } | null>(null);

  const queryClient = useQueryClient();

  // TODO: The useQuery will need to be updated when the `getIntegrations` API is changed.
  // For now, we assume the old data structure and add a default environment.
  const { data: integrationsData, isLoading, isError, error } = useQuery({
    queryKey: ['integrations'],
    queryFn: async (): Promise<Integration[]> => {
      const response = await adminApi.getIntegrations();
      const rawIntegrations = (response as any)?.data || [];
      return (rawIntegrations as any[]).map((int: any) => ({
        ...int,
        environment: int.environment || 'production',
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
    mutationFn: ({ id, data }: { id: string; data: IntegrationApiPayload }) => adminApi.updateIntegration(id, data),
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
    mutationFn: (identifiers: { service_name: string; environment: string }) => adminApi.deleteIntegration(identifiers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration deleted successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete integration: ${err.message}`);
    }
  });

  const handleToggleActive = (integration: Integration) => {
    const updatedData: IntegrationApiPayload = {
      is_active: !integration.is_active,
      service_name: integration.service_name,
      environment: integration.environment,
    };
    // The `id` is vestigial but kept for now to match the mutationFn signature
    updateIntegrationMutation.mutate({ id: integration.id, data: updatedData });
  };

  const handleEditIntegration = (integration: Integration) => {
    setEditingIntegration(integration);
    setShowForm(true);
  };

  const handleDeleteIntegration = (integration: Integration) => {
    setIntegrationToDelete({ service_name: integration.service_name, environment: integration.environment });
    setShowDeleteIntegrationDialog(true);
  };

  const confirmDeleteIntegration = () => {
    if (integrationToDelete) {
      deleteIntegrationMutation.mutate(integrationToDelete);
    }
    setShowDeleteIntegrationDialog(false);
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
      environment: formData.environment,
      other_config: parsedOtherConfig,
      is_active: formData.isActive,
    };

    if (formData.apiKey && formData.apiKey.trim() !== "") {
      payload.api_key = formData.apiKey;
    } else if (editingIntegration) {
      // If we are editing and the API key is blank, we don't include it in the payload.
      // The backend will keep the existing key.
    }

    if (editingIntegration) {
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
            apiKey: '', // API key is always write-only
            otherConfig: typeof editingIntegration.other_config === 'object'
              ? JSON.stringify(editingIntegration.other_config, null, 2)
              : '{}',
            isActive: editingIntegration.is_active,
            environment: editingIntegration.environment,
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
                {/* --- Help content remains the same --- */}
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
              <TableHead>Environment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center h-32"><Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-red" /></TableCell></TableRow>
            ) : isError ? (
              <TableRow><TableCell colSpan={5} className="text-center text-red-500 h-32"><AlertTriangle className="mx-auto h-8 w-8 mb-2" />Error: {error.message}</TableCell></TableRow>
            ) : integrations.length > 0 ? (
              integrations.map((integration) => (
                <TableRow key={`${integration.service_name}-${integration.environment}`}>
                  <TableCell className="font-medium">{integration.service_name}</TableCell>
                  <TableCell>
                    <Badge variant={integration.environment === 'production' ? 'default' : 'secondary'}>
                      {integration.environment}
                    </Badge>
                  </TableCell>
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
                      onClick={() => handleDeleteIntegration(integration)}
                      title="Delete"
                      disabled={deleteIntegrationMutation.isPending && deleteIntegrationMutation.variables?.service_name === integration.service_name}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-32">
                  No third-party integrations configured yet. Click "Add New Integration" to begin.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {integrationToDelete && (
        <AlertDialog open={showDeleteIntegrationDialog} onOpenChange={(isOpen) => { setShowDeleteIntegrationDialog(isOpen); if(!isOpen) setIntegrationToDelete(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will delete the integration configuration for {integrationToDelete.service_name} ({integrationToDelete.environment}). This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteIntegration}
                disabled={deleteIntegrationMutation.isPending && deleteIntegrationMutation.variables?.service_name === integrationToDelete.service_name}
              >
                {deleteIntegrationMutation.isPending && deleteIntegrationMutation.variables?.service_name === integrationToDelete.service_name ? (
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
