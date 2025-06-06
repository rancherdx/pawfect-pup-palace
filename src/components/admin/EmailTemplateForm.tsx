import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export interface EmailTemplateData {
  id: string;
  name: string; // Typically not editable if it's a key
  subject: string;
  html_body: string;
  // is_editable_in_admin is part of the source template but not directly part of the form save data
}

interface EmailTemplateFormProps {
  template: EmailTemplateData; // The template object to edit
  onSave: (data: Pick<EmailTemplateData, 'id' | 'subject' | 'html_body'>) => void;
  onCancel: () => void;
}

const EmailTemplateForm: React.FC<EmailTemplateFormProps> = ({ template, onSave, onCancel }) => {
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');

  useEffect(() => {
    if (template) {
      setSubject(template.subject || '');
      setHtmlBody(template.html_body || '');
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: template.id,
      subject,
      html_body: htmlBody,
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="htmlBody">HTML Body</Label>
            {/*
              Ideally, this would be a Rich Text Editor (e.g., TipTap, Quill, TinyMCE).
              For simplicity in this project setup, a plain textarea is used.
              Ensure output is sanitized if rendered directly, or use a safe HTML rendering library.
            */}
            <Textarea
              id="htmlBody"
              value={htmlBody}
              onChange={(e) => setHtmlBody(e.target.value)}
              placeholder="Enter HTML content for the email body..."
              rows={15}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use HTML for formatting. Placeholders like <code>{'{{name}}'}</code> or <code>{'{{order_id}}'}</code> will be replaced with actual data.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EmailTemplateForm;
