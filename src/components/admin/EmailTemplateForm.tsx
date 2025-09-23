import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Shield } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * @interface EmailTemplateData
 * @description Defines the shape of an email template object.
 */
export interface EmailTemplateData {
  id: string;
  name: string; // Typically not editable if it's a key
  subject: string;
  html_body: string;
  is_editable?: boolean; // Received from parent
}

/**
 * @interface EmailTemplateFormProps
 * @description Defines the props for the EmailTemplateForm component.
 */
interface EmailTemplateFormProps {
  /** The email template data to be edited. */
  template: EmailTemplateData;
  /** Callback function to save the updated template data. */
  onSave: (data: Pick<EmailTemplateData, 'id' | 'subject' | 'html_body'>) => void;
  /** Callback function to cancel the editing process. */
  onCancel: () => void;
  /** A boolean indicating if the save operation is in progress. */
  isSaving: boolean;
}

/**
 * @component EmailTemplateForm
 * @description A form component for editing the subject and HTML body of an email template.
 * It includes security features like HTML sanitization to prevent XSS attacks.
 * @param {EmailTemplateFormProps} props - The props for the component.
 * @returns {React.ReactElement | null} The rendered form for editing an email template, or null if no template is provided.
 */
const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({ template, onSave, onCancel, isSaving }) => {
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const is_editable = template.is_editable ?? false; // Default to false if not provided

  useEffect(() => {
    if (template) {
      setSubject(template.subject || '');
      setHtmlBody(template.html_body || '');
    }
  }, [template]);

  /**
   * Handles the form submission. It sanitizes the HTML body before calling the onSave callback.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize HTML content to prevent XSS attacks
    const sanitizedHtmlBody = DOMPurify.sanitize(htmlBody, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'style', 'class'],
      ALLOW_DATA_ATTR: false,
    });
    
    onSave({
      id: template.id,
      subject,
      html_body: sanitizedHtmlBody,
    });
  };

  if (!template) return null; // Should not happen if form is rendered correctly

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Email Template</CardTitle>
        <CardDescription>
          Modifying template: <span className="font-semibold font-mono">{template.name}</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name (Identifier)</Label>
            <Input
              id="templateName"
              value={template.name}
              disabled
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              The unique identifier for this template (cannot be changed).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              required
              disabled={!is_editable || isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="htmlBody">HTML Body</Label>
            <Alert className="mb-2">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                HTML content is automatically sanitized to prevent security vulnerabilities. Only safe tags and attributes are allowed.
              </AlertDescription>
            </Alert>
            <Textarea
              id="htmlBody"
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder="Enter HTML content for the email body..."
              rows={15}
              className="font-mono text-sm"
              disabled={!is_editable || isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Use HTML for formatting. Placeholders like <code>{'{{name}}'}</code> or <code>{'{{order_id}}'}</code> will be replaced with actual data.
              <br />
              Allowed tags: p, br, strong, em, u, h1-h6, ul, ol, li, a, img, div, span
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          {is_editable && (
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};

export default EmailTemplateForm;
