import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, X } from "lucide-react";

interface MailChannelsSetupProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

const MailChannelsSetup: React.FC<MailChannelsSetupProps> = ({ onSave, onCancel }) => {
  const [apiKey, setApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSave = () => {
    const data = {
      apiKey,
      fromEmail,
      service: 'mailchannels'
    };
    onSave?.(data);
    setIsConfigured(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <h3 className="text-lg font-semibold">MailChannels Configuration</h3>
        </div>
        <Badge variant={isConfigured ? "default" : "secondary"}>
          {isConfigured ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Configured
            </>
          ) : (
            <>
              <X className="h-3 w-3 mr-1" />
              Not Configured
            </>
          )}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Service Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your MailChannels API key"
            />
          </div>
          
          <div>
            <Label htmlFor="from-email">From Email Address</Label>
            <Input
              id="from-email"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="noreply@yourdomain.com"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!apiKey || !fromEmail}>
              Save Configuration
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Email</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Send a test email to verify your MailChannels configuration.
          </p>
          <Button variant="outline" disabled={!isConfigured}>
            Send Test Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MailChannelsSetup;