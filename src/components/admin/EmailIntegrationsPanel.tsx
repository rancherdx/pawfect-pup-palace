import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Check, X, Loader2 } from "lucide-react";
import DKIMGenerator from "./DKIMGenerator";

type Provider = {
  id: string;
  provider_name: string;
  is_active: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  last_test_at?: string;
  test_status?: string;
  test_error_message?: string;
  dkim_verified?: boolean;
};

export default function EmailIntegrationsPanel() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState({
    provider_name: "mailchannels",
    api_key: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
  });

  const queryClient = useQueryClient();

  const { data: providers = [] } = useQuery({
    queryKey: ["email-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_providers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Provider[];
    },
  });

  const addProviderMutation = useMutation({
    mutationFn: async (provider: typeof newProvider) => {
      const { data, error } = await supabase
        .from("email_providers")
        .insert([
          {
            provider_name: provider.provider_name,
            api_key_encrypted: provider.api_key,
            smtp_host: provider.smtp_host || null,
            smtp_port: provider.smtp_port || null,
            smtp_username: provider.smtp_username || null,
            smtp_password_encrypted: provider.smtp_password || null,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-providers"] });
      toast({ title: "Provider added successfully" });
      setShowAddForm(false);
      setNewProvider({
        provider_name: "mailchannels",
        api_key: "",
        smtp_host: "",
        smtp_port: 587,
        smtp_username: "",
        smtp_password: "",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add provider", description: error.message, variant: "destructive" });
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_providers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-providers"] });
      toast({ title: "Provider deleted successfully" });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { data, error } = await supabase.functions.invoke("test-email-connection", {
        body: { provider_id: providerId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-providers"] });
      toast({ title: "Connection test completed" });
    },
    onError: (error: Error) => {
      toast({ title: "Connection test failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Provider Integrations</CardTitle>
          <CardDescription>Configure and manage email service providers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          )}

          {showAddForm && (
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="text-lg">Add Email Provider</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Provider</Label>
                  <Select
                    value={newProvider.provider_name}
                    onValueChange={(value) => setNewProvider({ ...newProvider, provider_name: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mailchannels">MailChannels</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="aws_ses">AWS SES</SelectItem>
                      <SelectItem value="smtp_custom">Custom SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newProvider.provider_name !== "smtp_custom" && (
                  <div>
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={newProvider.api_key}
                      onChange={(e) => setNewProvider({ ...newProvider, api_key: e.target.value })}
                      placeholder="Enter API key"
                    />
                  </div>
                )}

                {newProvider.provider_name === "smtp_custom" && (
                  <>
                    <div>
                      <Label>SMTP Host</Label>
                      <Input
                        value={newProvider.smtp_host}
                        onChange={(e) => setNewProvider({ ...newProvider, smtp_host: e.target.value })}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div>
                      <Label>SMTP Port</Label>
                      <Input
                        type="number"
                        value={newProvider.smtp_port}
                        onChange={(e) => setNewProvider({ ...newProvider, smtp_port: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input
                        value={newProvider.smtp_username}
                        onChange={(e) => setNewProvider({ ...newProvider, smtp_username: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={newProvider.smtp_password}
                        onChange={(e) => setNewProvider({ ...newProvider, smtp_password: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => addProviderMutation.mutate(newProvider)}
                    disabled={addProviderMutation.isPending}
                  >
                    {addProviderMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Provider
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {providers.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {provider.provider_name.replace("_", " ")}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                            provider.test_status === "success"
                              ? "bg-green-100 text-green-800"
                              : provider.test_status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {provider.test_status === "success" && <Check className="h-3 w-3" />}
                          {provider.test_status === "failed" && <X className="h-3 w-3" />}
                          {provider.test_status || "Not tested"}
                        </span>
                        {provider.last_test_at && (
                          <span className="text-xs">
                            Last tested: {new Date(provider.last_test_at).toLocaleString()}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProviderMutation.mutate(provider.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provider.test_error_message && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded text-sm">
                      {provider.test_error_message}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => testConnectionMutation.mutate(provider.id)}
                      disabled={testConnectionMutation.isPending}
                    >
                      {testConnectionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Test Connection
                    </Button>
                  </div>

                  {provider.provider_name === "mailchannels" && <DKIMGenerator providerId={provider.id} />}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
