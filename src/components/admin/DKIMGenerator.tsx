import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Copy, Check, Loader2, Key, Shield } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface DKIMGeneratorProps {
  providerId: string;
}

export default function DKIMGenerator({ providerId }: DKIMGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { data: provider } = useQuery({
    queryKey: ["email-provider", providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_providers")
        .select("*")
        .eq("id", providerId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const generateKeysMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-dkim-keys", {
        body: { provider_id: providerId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-provider", providerId] });
      toast({ title: "DKIM keys generated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to generate keys", description: error.message, variant: "destructive" });
    },
  });

  const verifyDNSMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("verify-dns-record", {
        body: { provider_id: providerId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["email-provider", providerId] });
      if (data.verified) {
        toast({ title: "DNS record verified successfully" });
      } else {
        toast({
          title: "DNS record not found",
          description: "Please ensure the DNS record has been added and propagated",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied to clipboard" });
    } catch (error) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const dnsRecord = provider?.dkim_public_key
    ? `_domainkey.gdspuppies.com TXT "v=DKIM1; k=rsa; p=${provider.dkim_public_key}"`
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Key className="h-5 w-5" />
          DKIM Configuration
        </CardTitle>
        <CardDescription>Generate and configure DKIM keys for email authentication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!provider?.dkim_public_key ? (
          <Button
            onClick={() => generateKeysMutation.mutate()}
            disabled={generateKeysMutation.isPending}
          >
            {generateKeysMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Key className="h-4 w-4 mr-2" />
            Generate DKIM Keys
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className={`h-5 w-5 ${provider.dkim_verified ? "text-green-500" : "text-yellow-500"}`} />
              <span className="text-sm font-medium">
                {provider.dkim_verified ? "DNS Verified" : "DNS Not Verified"}
              </span>
            </div>

            <div>
              <label className="text-sm font-medium">DNS TXT Record</label>
              <p className="text-xs text-muted-foreground mb-2">
                Add this TXT record to your DNS configuration
              </p>
              <div className="relative">
                <Textarea
                  value={dnsRecord}
                  readOnly
                  className="font-mono text-xs"
                  rows={3}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(dnsRecord)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => verifyDNSMutation.mutate()}
              disabled={verifyDNSMutation.isPending || provider.dkim_verified}
            >
              {verifyDNSMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Verify DNS Record
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
