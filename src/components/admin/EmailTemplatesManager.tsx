
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, PlusCircle, Loader2, AlertTriangle } from 'lucide-react';
import EmailTemplateForm, { EmailTemplateData as FormEmailTemplateData } from './EmailTemplateForm';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  is_system_template: boolean;
  is_editable_in_admin: boolean;
  html_body: string;
  created_at?: string;
  updated_at?: string;
}

const EmailTemplatesManager: React.FC = () => {
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const queryClient = useQueryClient();

  const { data: templatesData, isLoading, isError, error } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: async () => {
      const response = await apiRequest<any>('/admin/email-templates');
      return response.templates || response;
    },
    staleTime: 5 * 60 * 1000,
    select: (data: any[]) => data.map(t => ({ ...t, is_editable_in_admin: !t.is_system_template })),
  });

  const templates = templatesData || [];

  const updateTemplateMutation = useMutation({
    mutationFn: (templateData: { id: string; subject: string; html_body: string }) => 
      apiRequest<EmailTemplate>(`/admin/email-templates/${templateData.id}`, {
        method: 'PUT',
        body: JSON.stringify({ subject: templateData.subject, html_body: templateData.html_body }),
      }),
    onSuccess: (updatedTemplate) => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success(`Template "${updatedTemplate.name}" updated successfully!`);
      setShowTemplateForm(false);
      setEditingTemplate(null);
    },
    onError: (err: Error, variables) => {
      const currentTemplates = queryClient.getQueryData<EmailTemplate[]>(['emailTemplates']) || [];
      const templateName = currentTemplates.find(t => t.id === variables.id)?.name || variables.id;
      toast.error(`Failed to update template "${templateName}": ${err.message}`);
    },
  });

  const handleEditTemplate = (template: EmailTemplate) => {
    if (template.is_editable_in_admin) {
      setEditingTemplate(template);
      setShowTemplateForm(true);
    } else {
      toast.info(`System template "${template.name}" content is managed via code and cannot be modified here. You can view its current content.`);
      setEditingTemplate(template);
      setShowTemplateForm(true);
    }
  };

  const handleAddNewTemplate = () => {
    console.log('Add new custom template clicked - Placeholder');
    toast.info("Adding new custom templates via the UI is not currently supported. Custom templates are typically added by developers.");
  };

  const handleSaveTemplateForm = (data: Pick<FormEmailTemplateData, 'id' | 'subject' | 'html_body'>) => {
    if (!data.id) {
      toast.error("Cannot save template without an ID.");
      return;
    }
    const originalTemplate = templates.find(t => t.id === data.id);
    if (originalTemplate && !originalTemplate.is_editable_in_admin) {
        toast.error(`System template "${originalTemplate.name}" cannot be modified.`);
        setShowTemplateForm(false);
        setEditingTemplate(null);
        return;
    }
    updateTemplateMutation.mutate({ id: data.id, subject: data.subject, html_body: data.html_body });
  };

  const handleCancelTemplateForm = () => {
    setShowTemplateForm(false);
    setEditingTemplate(null);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Email Templates Management
        </h2>
        <Button onClick={handleAddNewTemplate} disabled>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Custom Template (Not Implemented)
        </Button>
      </div>

      <Dialog open={showTemplateForm} onOpenChange={(isOpen) => { if (!isOpen) { setEditingTemplate(null); } setShowTemplateForm(isOpen); }}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
          {editingTemplate && (
            <EmailTemplateForm
              template={{
                id: editingTemplate.id,
                name: editingTemplate.name,
                subject: editingTemplate.subject,
                html_body: editingTemplate.html_body,
                is_editable: editingTemplate.is_editable_in_admin
              }}
              onSave={handleSaveTemplateForm}
              onCancel={handleCancelTemplateForm}
              isSaving={updateTemplateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Customizable</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-red" />
                  Loading templates...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-red-500 h-24">
                  <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
                  Error loading email templates: {error?.message || "Unknown error"}
                </TableCell>
              </TableRow>
            ) : templates.length > 0 ? (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-mono text-sm">{template.name}</TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>
                    <Badge variant={template.is_editable_in_admin ? 'default' : 'outline'}>
                      {template.is_editable_in_admin ? 'Yes' : 'No (System)'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      title={template.is_editable_in_admin ? "Edit Template" : "View System Template"}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {template.is_editable_in_admin ? 'Edit' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  No email templates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <p className="text-xs text-muted-foreground p-4 border rounded-lg bg-background">
        <strong>Note:</strong> System templates (not customizable) are defined in code or seeded and used for core functionalities.
        Customizable templates can be created and modified by admins for marketing campaigns or special announcements.
        Attempting to "Edit" a system template here will show an alert; their content is generally managed via code updates.
      </p>
    </div>
  );
};

export default EmailTemplatesManager;
