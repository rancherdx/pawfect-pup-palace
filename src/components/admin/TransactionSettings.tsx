import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function TransactionSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    default_tax_rate: 0,
    shipping_fee: 0,
    handling_fee: 0,
    documentation_fee: 0,
    allow_pass_through_fees: false,
    show_fee_breakdown: true,
  });

  const { data: settingsData } = useQuery({
    queryKey: ["transaction-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "transaction_settings")
        .single();
      if (error) throw error;
      return data?.value;
    },
  });

  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData as typeof settings);
    }
  }, [settingsData]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: typeof settings) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: newSettings as any })
        .eq("key", "transaction_settings");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transaction-settings"] });
      toast({ title: "Settings saved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Transaction Settings</h2>
        <p className="text-muted-foreground">Configure taxes, fees, and payment processing options</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tax Configuration</CardTitle>
          <CardDescription>Set default tax rates for transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default Tax Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.default_tax_rate}
              onChange={(e) => setSettings({ ...settings, default_tax_rate: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Miscellaneous Fees</CardTitle>
          <CardDescription>Configure additional fees for transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Shipping Fee ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.shipping_fee}
              onChange={(e) => setSettings({ ...settings, shipping_fee: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Handling Fee ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.handling_fee}
              onChange={(e) => setSettings({ ...settings, handling_fee: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label>Documentation Fee ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.documentation_fee}
              onChange={(e) => setSettings({ ...settings, documentation_fee: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processing Fee Options</CardTitle>
          <CardDescription>Configure how processing fees are handled</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Customers to Pay Processing Fees</Label>
              <p className="text-sm text-muted-foreground">
                Let customers cover the 3% credit card processing fee
              </p>
            </div>
            <Switch
              checked={settings.allow_pass_through_fees}
              onCheckedChange={(checked) => setSettings({ ...settings, allow_pass_through_fees: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Fee Breakdown in Checkout</Label>
              <p className="text-sm text-muted-foreground">
                Display detailed fee breakdown to customers
              </p>
            </div>
            <Switch
              checked={settings.show_fee_breakdown}
              onCheckedChange={(checked) => setSettings({ ...settings, show_fee_breakdown: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saveSettingsMutation.isPending}>
        {saveSettingsMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Save Settings
      </Button>
    </div>
  );
}
