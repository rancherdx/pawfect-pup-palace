import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check, X } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "stripe", name: "Stripe", hasEnvironments: true, hasApiKey: true },
  { id: "paypal", name: "PayPal", hasEnvironments: true, hasApiKey: true },
  { id: "afterpay", name: "Afterpay", hasEnvironments: true, hasApiKey: true },
  { id: "affirm", name: "Affirm", hasEnvironments: true, hasApiKey: true },
  { id: "venmo", name: "Venmo", hasEnvironments: false, hasApiKey: false, hasQR: true },
  { id: "cashapp", name: "Cash App", hasEnvironments: false, hasApiKey: false, hasQR: true },
  { id: "zelle", name: "Zelle", hasEnvironments: false, hasApiKey: false, hasPaymentLink: true },
  { id: "cash", name: "Cash", hasEnvironments: false, hasApiKey: false },
];

export default function PaymentMethodsManager() {
  const queryClient = useQueryClient();

  const { data: methods = [] } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_method_configs")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const upsertMethodMutation = useMutation({
    mutationFn: async (method: any) => {
      const { error } = await supabase
        .from("payment_method_configs")
        .upsert(method);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({ title: "Payment method updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update method", description: error.message, variant: "destructive" });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (methodName: string) => {
      const { data, error } = await supabase.functions.invoke("test-payment-method", {
        body: { method_name: methodName },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
      toast({ title: "Connection test completed" });
    },
  });

  const getMethodConfig = (methodId: string) => {
    return methods.find((m) => m.method_name === methodId);
  };

  const toggleMethod = (methodId: string, enabled: boolean) => {
    const existing = getMethodConfig(methodId);
    upsertMethodMutation.mutate({
      ...existing,
      method_name: methodId,
      is_enabled: enabled,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Payment Methods</h2>
        <p className="text-muted-foreground">Configure and manage payment processing methods</p>
      </div>

      <div className="grid gap-4">
        {PAYMENT_METHODS.map((method) => {
          const config = getMethodConfig(method.id);
          return (
            <Card key={method.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{method.name}</CardTitle>
                    {config && (
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                            config.test_status === "success"
                              ? "bg-green-100 text-green-800"
                              : config.test_status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {config.test_status === "success" && <Check className="h-3 w-3" />}
                          {config.test_status === "failed" && <X className="h-3 w-3" />}
                          {config.test_status || "Not configured"}
                        </span>
                      </CardDescription>
                    )}
                  </div>
                  <Switch
                    checked={config?.is_enabled || false}
                    onCheckedChange={(checked) => toggleMethod(method.id, checked)}
                  />
                </div>
              </CardHeader>
              {config?.is_enabled && (
                <CardContent className="space-y-4">
                  {method.hasEnvironments && (
                    <div>
                      <Label>Environment</Label>
                      <Select
                        value={config.environment || "sandbox"}
                        onValueChange={(value) =>
                          upsertMethodMutation.mutate({ ...config, environment: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {method.hasApiKey && (
                    <>
                      <div>
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          value={config.api_key_encrypted || ""}
                          onChange={(e) =>
                            upsertMethodMutation.mutate({ ...config, api_key_encrypted: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>API Secret (if applicable)</Label>
                        <Input
                          type="password"
                          value={config.api_secret_encrypted || ""}
                          onChange={(e) =>
                            upsertMethodMutation.mutate({ ...config, api_secret_encrypted: e.target.value })
                          }
                        />
                      </div>
                    </>
                  )}

                  {method.hasQR && (
                    <div>
                      <Label>QR Code URL</Label>
                      <Input
                        value={config.qr_code_url || ""}
                        onChange={(e) =>
                          upsertMethodMutation.mutate({ ...config, qr_code_url: e.target.value })
                        }
                        placeholder="URL to QR code image"
                      />
                    </div>
                  )}

                  {method.hasPaymentLink && (
                    <div>
                      <Label>Payment Link</Label>
                      <Input
                        value={config.payment_link || ""}
                        onChange={(e) =>
                          upsertMethodMutation.mutate({ ...config, payment_link: e.target.value })
                        }
                        placeholder="Your payment link"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Custom Instructions</Label>
                    <Textarea
                      value={config.custom_instructions || ""}
                      onChange={(e) =>
                        upsertMethodMutation.mutate({ ...config, custom_instructions: e.target.value })
                      }
                      placeholder="Instructions to display to customers"
                      rows={3}
                    />
                  </div>

                  {method.hasApiKey && (
                    <Button
                      variant="outline"
                      onClick={() => testConnectionMutation.mutate(method.id)}
                      disabled={testConnectionMutation.isPending}
                    >
                      {testConnectionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Test Connection
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
