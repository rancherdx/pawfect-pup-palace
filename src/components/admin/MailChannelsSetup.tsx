import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, ExternalLink, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface MailChannelsConfig {
  api_key: string;
  from_email: string;
  from_name: string;
  dkim_domain: string;
  dkim_selector: string;
  dkim_private_key: string;
  reply_to_addresses: {
    support: string;
    billing: string;
    notifications: string;
    marketing: string;
  };
}

interface MailChannelsSetupProps {
  initialConfig?: Partial<MailChannelsConfig>;
  onSave: (config: MailChannelsConfig) => void;
  onCancel: () => void;
}

const MailChannelsSetup: React.FC<MailChannelsSetupProps> = ({
  initialConfig,
  onSave,
  onCancel,
}) => {
  const [config, setConfig] = useState<MailChannelsConfig>({
    api_key: '',
    from_email: '',
    from_name: '',
    dkim_domain: '',
    dkim_selector: 'mail',
    dkim_private_key: '',
    reply_to_addresses: {
      support: '',
      billing: '',
      notifications: '',
      marketing: '',
    },
    ...initialConfig,
  });
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const currentDomain = window.location.hostname;

  const dnsRecords = {
    spf: `v=spf1 a mx include:relay.mailchannels.net ~all`,
    dkim: `v=DKIM1; p=${config.dkim_private_key ? '[YOUR_DKIM_PUBLIC_KEY]' : '[ENTER_DKIM_PRIVATE_KEY_FIRST]'}`,
    dmarc: `v=DMARC1; p=none; rua=mailto:dmarc@${currentDomain}`,
  };

  const handleInputChange = (field: keyof MailChannelsConfig, value: string) => {
    if (field === 'reply_to_addresses') return;
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleReplyToChange = (category: keyof MailChannelsConfig['reply_to_addresses'], value: string) => {
    setConfig(prev => ({
      ...prev,
      reply_to_addresses: {
        ...prev.reply_to_addresses,
        [category]: value,
      },
    }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleSave = () => {
    const requiredFields = ['api_key', 'from_email', 'from_name'];
    const missingFields = requiredFields.filter(field => !config[field as keyof MailChannelsConfig]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.from_email)) {
      toast.error('Please enter a valid from email address');
      return;
    }

    onSave(config);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">MailChannels Integration Setup</h1>
          <p className="text-muted-foreground">Configure MailChannels for transactional email delivery</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </div>
      </div>

      <Tabs defaultValue="credentials" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="credentials">API Settings</TabsTrigger>
          <TabsTrigger value="dkim">DKIM Setup</TabsTrigger>
          <TabsTrigger value="dns">DNS Records</TabsTrigger>
          <TabsTrigger value="guide">Setup Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>MailChannels API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key *</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={config.api_key}
                  onChange={(e) => handleInputChange('api_key', e.target.value)}
                  placeholder="mc_..."
                />
              </div>
              
              <div>
                <Label htmlFor="from-email">From Email Address *</Label>
                <Input
                  id="from-email"
                  type="email"
                  value={config.from_email}
                  onChange={(e) => handleInputChange('from_email', e.target.value)}
                  placeholder={`noreply@${currentDomain}`}
                />
              </div>
              
              <div>
                <Label htmlFor="from-name">From Name *</Label>
                <Input
                  id="from-name"
                  value={config.from_name}
                  onChange={(e) => handleInputChange('from_name', e.target.value)}
                  placeholder="Your Business Name"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reply-To Email Addresses</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure different reply-to addresses for different types of emails
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(config.reply_to_addresses).map(([category, email]) => (
                <div key={category}>
                  <Label htmlFor={`reply-${category}`} className="capitalize">
                    {category} <Badge variant="outline">{category}</Badge>
                  </Label>
                  <Input
                    id={`reply-${category}`}
                    type="email"
                    value={email}
                    onChange={(e) => handleReplyToChange(category as keyof MailChannelsConfig['reply_to_addresses'], e.target.value)}
                    placeholder={`${category}@${currentDomain}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dkim" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DKIM Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                DKIM signing improves email deliverability and authenticity
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dkim-domain">DKIM Domain</Label>
                <Input
                  id="dkim-domain"
                  value={config.dkim_domain}
                  onChange={(e) => handleInputChange('dkim_domain', e.target.value)}
                  placeholder={currentDomain}
                />
              </div>
              
              <div>
                <Label htmlFor="dkim-selector">DKIM Selector</Label>
                <Input
                  id="dkim-selector"
                  value={config.dkim_selector}
                  onChange={(e) => handleInputChange('dkim_selector', e.target.value)}
                  placeholder="mail"
                />
              </div>
              
              <div>
                <Label htmlFor="dkim-private-key">DKIM Private Key</Label>
                <Textarea
                  id="dkim-private-key"
                  value={config.dkim_private_key}
                  onChange={(e) => handleInputChange('dkim_private_key', e.target.value)}
                  placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                  rows={6}
                />
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Generate a 2048-bit RSA key pair. The private key goes here, and the public key goes in your DNS records.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>DNS Records to Add</CardTitle>
              <p className="text-sm text-muted-foreground">
                Add these DNS records to your domain to enable email authentication
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>SPF Record (TXT)</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(dnsRecords.spf, 'spf')}
                  >
                    {copiedField === 'spf' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div className="text-blue-600">Host:</div>
                  <div className="mb-2">@</div>
                  <div className="text-blue-600">Value:</div>
                  <div>{dnsRecords.spf}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>DKIM Record (TXT)</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(dnsRecords.dkim, 'dkim')}
                  >
                    {copiedField === 'dkim' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div className="text-blue-600">Host:</div>
                  <div className="mb-2">{config.dkim_selector}._domainkey</div>
                  <div className="text-blue-600">Value:</div>
                  <div>{dnsRecords.dkim}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>DMARC Record (TXT) - Optional but Recommended</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(dnsRecords.dmarc, 'dmarc')}
                  >
                    {copiedField === 'dmarc' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  <div className="text-blue-600">Host:</div>
                  <div className="mb-2">_dmarc</div>
                  <div className="text-blue-600">Value:</div>
                  <div>{dnsRecords.dmarc}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Setup Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Step 1: Get MailChannels API Key</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign up at <a href="https://www.mailchannels.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                      mailchannels.com <ExternalLink className="h-3 w-3 ml-1" />
                    </a> and obtain your API key.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Step 2: Generate DKIM Key Pair</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate a 2048-bit RSA key pair using tools like OpenSSL. The private key is stored here securely.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Step 3: Configure DNS Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Add the SPF, DKIM, and DMARC records from the "DNS Records" tab to your domain's DNS settings.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Step 4: Test Email Delivery</h3>
                  <p className="text-sm text-muted-foreground">
                    Send test emails to verify configuration and deliverability. Monitor for bounces and delivery issues.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold">Step 5: Monitor Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Regularly check email delivery rates and authentication status to maintain good sender reputation.
                  </p>
                </div>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> DNS propagation can take up to 48 hours. Test email authentication 
                  after DNS changes are fully propagated.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Best Practices:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Use consistent "from" domains to build sender reputation</li>
                    <li>Configure different reply-to addresses for different email types</li>
                    <li>Monitor bounce rates and complaints regularly</li>
                    <li>Implement email templates for consistent branding</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MailChannelsSetup;