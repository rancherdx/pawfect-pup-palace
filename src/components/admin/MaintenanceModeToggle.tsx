import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wrench } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MaintenanceSettings {
  enabled: boolean;
  message: string;
}

const MaintenanceModeToggle = () => {
  const queryClient = useQueryClient();
  const [localMessage, setLocalMessage] = useState("");

  const { data: maintenanceSettings, isLoading } = useQuery({
    queryKey: ['site-settings', 'maintenance_mode'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle();
      
      if (error) throw error;
      
      const settings = (data?.value as MaintenanceSettings | null) || { enabled: false, message: "" };
      setLocalMessage(settings.message || "");
      return settings;
    },
  });

  const updateMaintenanceMutation = useMutation({
    mutationFn: async (settings: MaintenanceSettings) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'maintenance_mode', 
          value: settings as any
        }, { onConflict: 'key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'maintenance_mode'] });
      toast.success('Maintenance mode settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update maintenance mode');
      console.error(error);
    },
  });

  const handleToggle = (enabled: boolean) => {
    updateMaintenanceMutation.mutate({
      enabled,
      message: localMessage || "We're currently performing maintenance. Please check back soon!",
    });
  };

  const handleSaveMessage = () => {
    updateMaintenanceMutation.mutate({
      enabled: maintenanceSettings?.enabled || false,
      message: localMessage,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Maintenance Mode
        </CardTitle>
        <CardDescription>
          Enable maintenance mode to prevent non-admin users from accessing the site
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
          <div className="flex-1">
            <Label htmlFor="maintenance-toggle" className="font-medium">
              Maintenance Mode Status
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {maintenanceSettings?.enabled 
                ? "🔴 Site is in maintenance mode - only admins can access" 
                : "🟢 Site is accessible to all users"}
            </p>
          </div>
          <Switch
            id="maintenance-toggle"
            checked={maintenanceSettings?.enabled || false}
            onCheckedChange={handleToggle}
            disabled={isLoading || updateMaintenanceMutation.isPending}
          />
        </div>

        {maintenanceSettings?.enabled && (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Maintenance mode is active</p>
              <p className="mt-1">Regular users cannot access the site. Admin users can still access all features.</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="maintenance-message">Maintenance Message</Label>
          <Textarea
            id="maintenance-message"
            placeholder="Enter a custom message to display during maintenance..."
            value={localMessage}
            onChange={(e) => setLocalMessage(e.target.value)}
            rows={4}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveMessage}
            disabled={updateMaintenanceMutation.isPending}
          >
            Save Message
          </Button>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> You can test maintenance mode by accessing the site in an incognito window while logged out.
            Add <code className="px-1 py-0.5 bg-background rounded">?bypass_maintenance=true</code> to any URL to bypass maintenance mode for testing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceModeToggle;
