import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Check, X, Key, Send, Copy, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * @interface MailChannelsSetupProps
 * @description Defines the props for the MailChannelsSetup component.
 */
interface MailChannelsSetupProps {
  /** Optional callback function to be invoked when the configuration is saved. */
  onSave?: (data: any) => void;
  /** Optional callback function to be invoked when the setup is cancelled. */
  onCancel?: () => void;
}

/**
 * @component MailChannelsSetup
 * @description A component for setting up and configuring the MailChannels email service integration.
 * @param {MailChannelsSetupProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered MailChannels setup form.
 */
const MailChannelsSetup: React.FC<MailChannelsSetupProps> = ({ onSave, onCancel }) => {
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [sandboxApiKey, setSandboxApiKey] = useState('');
  const [sandboxAccountId, setSandboxAccountId] = useState('');
  const [sandboxFromEmail, setSandboxFromEmail] = useState('sandbox@gdspuppies.com');
  const [productionApiKey, setProductionApiKey] = useState('');
  const [productionAccountId, setProductionAccountId] = useState('');
  const [productionFromEmail, setProductionFromEmail] = useState('noreply@gdspuppies.com');
  const [isConfigured, setIsConfigured] = useState(false);
  const [dkimPublicKey, setDkimPublicKey] = useState('');
  const [dnsRecord, setDnsRecord] = useState('');
  const [generatingDkim, setGeneratingDkim] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testTemplate, setTestTemplate] = useState('welcome');
  const [sendingTest, setSendingTest] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data: config } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'mailchannels_config')
        .single();

      if (config?.value) {
        const configValue = config.value as any;
        setEnvironment(configValue.active_environment || 'sandbox');
        setSandboxApiKey(configValue.sandbox?.api_key || '');
        setSandboxAccountId(configValue.sandbox?.account_id || '');
        setSandboxFromEmail(configValue.sandbox?.from_email || 'sandbox@gdspuppies.com');
        setProductionApiKey(configValue.production?.api_key || '');
        setProductionAccountId(configValue.production?.account_id || '');
        setProductionFromEmail(configValue.production?.from_email || 'noreply@gdspuppies.com');
        setIsConfigured(true);
      }

      const { data: dkimData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'mailchannels_dkim_public_key')
        .single();

      if (dkimData?.value) {
        setDkimPublicKey((dkimData.value as any).key || '');
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const handleSave = async () => {
    try {
      const configData = {
        sandbox: {
          api_key: sandboxApiKey,
          account_id: sandboxAccountId,
          from_email: sandboxFromEmail,
        },
        production: {
          api_key: productionApiKey,
          account_id: productionAccountId,
          from_email: productionFromEmail,
        },
        active_environment: environment,
      };

      const { error } = await supabase
        .from('site_settings')
        .update({ value: configData })
        .eq('key', 'mailchannels_config');

      if (error) throw error;

      toast.success('MailChannels configuration saved');
      setIsConfigured(true);
      onSave?.(configData);
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    }
  };

  const handleGenerateDkim = async () => {
    setGeneratingDkim(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('mailchannels-dkim-gen', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      const result = response.data;
      setDkimPublicKey(result.publicKey);
      setDnsRecord(result.dnsRecord.formatted);
      toast.success('DKIM keys generated successfully');
    } catch (error) {
      console.error('Error generating DKIM:', error);
      toast.error('Failed to generate DKIM keys');
    } finally {
      setGeneratingDkim(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setSendingTest(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('mailchannels-test', {
        body: { testEmail, templateType: testTemplate },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      setVerificationCode(response.data.verificationCode);
      toast.success(`Test email sent to ${testEmail}`);
    } catch (error) {
      console.error('Error sending test:', error);
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  const handleVerifyCode = () => {
    if (enteredCode === verificationCode) {
      toast.success('✅ Email delivery verified!');
      setTestDialogOpen(false);
      setTestEmail('');
      setEnteredCode('');
      setVerificationCode('');
    } else {
      toast.error('Incorrect verification code');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* Environment Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            MailChannels Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Environment</Label>
            <div className="flex items-center gap-2">
              <span className={environment === 'sandbox' ? 'font-bold' : 'text-muted-foreground'}>
                Sandbox
              </span>
              <Switch
                checked={environment === 'production'}
                onCheckedChange={(checked) => setEnvironment(checked ? 'production' : 'sandbox')}
              />
              <span className={environment === 'production' ? 'font-bold' : 'text-muted-foreground'}>
                Production
              </span>
            </div>
          </div>

          {/* Sandbox Config */}
          {environment === 'sandbox' && (
            <>
              <div>
                <Label>Sandbox API Key</Label>
                <Input
                  type="password"
                  value={sandboxApiKey}
                  onChange={(e) => setSandboxApiKey(e.target.value)}
                  placeholder="Sandbox API key"
                />
              </div>
              <div>
                <Label>Sandbox Account ID</Label>
                <Input
                  value={sandboxAccountId}
                  onChange={(e) => setSandboxAccountId(e.target.value)}
                  placeholder="Account ID"
                />
              </div>
              <div>
                <Label>From Email (Sandbox)</Label>
                <Input
                  type="email"
                  value={sandboxFromEmail}
                  onChange={(e) => setSandboxFromEmail(e.target.value)}
                  placeholder="sandbox@gdspuppies.com"
                />
              </div>
            </>
          )}

          {/* Production Config */}
          {environment === 'production' && (
            <>
              <div>
                <Label>Production API Key</Label>
                <Input
                  type="password"
                  value={productionApiKey}
                  onChange={(e) => setProductionApiKey(e.target.value)}
                  placeholder="Production API key"
                />
              </div>
              <div>
                <Label>Production Account ID</Label>
                <Input
                  value={productionAccountId}
                  onChange={(e) => setProductionAccountId(e.target.value)}
                  placeholder="Account ID"
                />
              </div>
              <div>
                <Label>From Email (Production)</Label>
                <Input
                  type="email"
                  value={productionFromEmail}
                  onChange={(e) => setProductionFromEmail(e.target.value)}
                  placeholder="noreply@gdspuppies.com"
                />
              </div>
            </>
          )}

          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      {/* DKIM Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            DKIM Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate DKIM keys for email authentication and improved deliverability.
          </p>
          
          <Button onClick={handleGenerateDkim} disabled={generatingDkim}>
            <RefreshCw className={`h-4 w-4 mr-2 ${generatingDkim ? 'animate-spin' : ''}`} />
            {generatingDkim ? 'Generating...' : 'Generate DKIM Keys'}
          </Button>

          {dnsRecord && (
            <div className="space-y-2">
              <Label>DNS TXT Record</Label>
              <p className="text-sm text-muted-foreground">
                Add this record to your domain's DNS settings:
              </p>
              <div className="relative">
                <Textarea
                  value={dnsRecord}
                  readOnly
                  className="font-mono text-sm"
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(dnsRecord)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Email Suite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Email Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Send test emails to verify your configuration is working correctly.
          </p>
          
          <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!isConfigured}>
                Send Test Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Test Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Test Email Address</Label>
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your-email@example.com"
                  />
                </div>
                
                <div>
                  <Label>Email Template</Label>
                  <Select value={testTemplate} onValueChange={setTestTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                      <SelectItem value="payment_confirmation">Payment Confirmation</SelectItem>
                      <SelectItem value="contact_form">Contact Form</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSendTest} disabled={sendingTest || !testEmail}>
                  {sendingTest ? 'Sending...' : 'Send Test'}
                </Button>

                {verificationCode && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Verification Code</Label>
                    <p className="text-sm text-muted-foreground">
                      Enter the 6-digit code from the test email:
                    </p>
                    <Input
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                    />
                    <Button onClick={handleVerifyCode} disabled={enteredCode.length !== 6}>
                      Verify Code
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default MailChannelsSetup;