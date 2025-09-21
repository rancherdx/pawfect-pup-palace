import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CreditCard, Mail, Zap, Key, Settings } from "lucide-react";
import ThirdPartyIntegrationsManager from './ThirdPartyIntegrationsManager';
import SquareIntegration from './SquareIntegration';
import ApplePaySetup from './ApplePaySetup';
import MailChannelsSetup from './MailChannelsSetup';

interface IntegrationStatus {
  name: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
  icon: React.ElementType;
}

const IntegrationsHub = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const integrations: IntegrationStatus[] = [
    {
      name: "Square Payments",
      status: "active",
      description: "Process payments securely",
      icon: CreditCard
    },
    {
      name: "Apple Pay",
      status: "inactive", 
      description: "Accept Apple Pay payments",
      icon: CreditCard
    },
    {
      name: "MailChannels",
      status: "active",
      description: "Send transactional emails",
      icon: Mail
    },
    {
      name: "Google Business",
      status: "inactive",
      description: "Sync reviews and business data",
      icon: Zap
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';  
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Integrations Hub</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="third-party" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Third Party
          </TabsTrigger>
          <TabsTrigger value="vault" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Vault
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {integration.name}
                    </CardTitle>
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(integration.status)}`} />
                      <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                        {integration.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {integration.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Square Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SquareIntegration />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Apple Pay Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ApplePaySetup />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                MailChannels Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MailChannelsSetup />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="third-party" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Third Party Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThirdPartyIntegrationsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vault" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Vault Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Securely manage API keys and sensitive configuration data using Supabase Vault.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Environment Secrets</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      API keys are managed through Supabase secrets and available in edge functions.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Encrypted Storage</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Integration credentials are encrypted and stored securely.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Vault Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsHub;