import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, PlusCircle } from 'lucide-react';
import EmailTemplateForm, { EmailTemplateData as FormEmailTemplateData } from './EmailTemplateForm'; // Import the form
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  // DialogFooter, // Not using footer for this form, form has its own
  // DialogClose, // Form has its own cancel
} from "@/components/ui/dialog";
// Assuming a toast function might be available, e.g., from 'sonner'
// import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  is_editable_in_admin: boolean;
  html_body: string; // Added html_body to mock data for editing
}

const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 'welcome-email-tpl',
    name: 'welcome_email',
    subject: 'Welcome to GDS Puppies!',
    is_editable_in_admin: false,
    html_body: '<p>Hi {{name}},</p><p>Welcome to GDS Puppies! We are thrilled to have you.</p><p>Thanks,<br>The GDS Puppies Team</p>'
  },
  {
    id: 'receipt-email-tpl',
    name: 'payment_receipt',
    subject: 'Your GDS Puppies Payment Receipt - Order {{order_id}}',
    is_editable_in_admin: false,
    html_body: '<p>Hi {{name}},</p><p>Thank you for your payment for order {{order_id}}.</p><p>Amount: {{amount}} {{currency}}</p><p>View your order details here: {{order_link}}</p><p>Thanks,<br>The GDS Puppies Team</p>'
  },
  {
    id: 'password-reset-tpl',
    name: 'password_reset',
    subject: 'Reset Your GDS Puppies Password',
    is_editable_in_admin: false,
    html_body: '<p>Hi {{name}},</p><p>Please click the link below to reset your password:</p><p><a href="{{reset_link}}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p><p>Thanks,<br>The GDS Puppies Team</p>'
  },
  {
    id: 'custom-promo-tpl-1',
    name: 'custom_promo_valentines',
    subject: 'A Special Valentine Treat For Your Pup!',
    is_editable_in_admin: true,
    html_body: '<p>Dear {{name}},</p><p>Show your furry friend some love this Valentine''s Day with our special offers!</p><p>Warm Wags,<br>The GDS Puppies Team</p>'
  },
];

const EmailTemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const handleEditTemplate = (template: EmailTemplate) => {
    if (template.is_editable_in_admin) {
      setEditingTemplate(template);
      setShowTemplateForm(true);
    } else {
      // Using alert for now as toast is not confirmed to be set up
      alert(`System template "${template.name}" cannot be modified here. These are typically managed via code or direct database updates for critical system emails.`);
      console.log('Attempted to edit non-editable template:', template.name);
    }
  };

  const handleAddNewTemplate = () => {
    console.log('Add new custom template clicked - Placeholder');
    // This would typically open a blank form. For this exercise, we focus on editing.
    // To implement add: setEditingTemplate(an_empty_template_object_with_is_editable_true); setShowTemplateForm(true);
    alert("Adding new custom templates is not fully implemented in this mock setup.");
  };

  const handleSaveTemplateForm = (data: Pick<FormEmailTemplateData, 'id' | 'subject' | 'html_body'>) => {
    console.log('Saving email template:', data);
    // In a real app, call API to save, then update state
    setTemplates(prevTemplates =>
      prevTemplates.map(t =>
        t.id === data.id ? { ...t, subject: data.subject, html_body: data.html_body } : t
      )
    );
    setShowTemplateForm(false);
    setEditingTemplate(null);
    // toast?.success(`Template "${editingTemplate?.name}" updated successfully!`); // Optional success message
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
        <Button onClick={handleAddNewTemplate}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Custom Template
        </Button>
      </div>

      {/* Form Dialog */}
      <Dialog open={showTemplateForm} onOpenChange={setShowTemplateForm}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
          {/* DialogHeader and Title are part of EmailTemplateForm now */}
          {editingTemplate && (
            <EmailTemplateForm
              template={editingTemplate}
              onSave={handleSaveTemplateForm}
              onCancel={handleCancelTemplateForm}
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
            {templates.length > 0 ? (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-mono text-sm">{template.name}</TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>
                    <Badge variant={template.is_editable_in_admin ? 'success' : 'outline'}>
                      {template.is_editable_in_admin ? 'Yes' : 'No (System)'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTemplate(template)}
                      title={template.is_editable_in_admin ? "Edit Template" : "View System Template (Read-only through UI)"}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {template.is_editable_in_admin ? 'Edit' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
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
