import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const SiteSettingsManager = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateMutation = useUpdateSiteSetting();

  const [formValues, setFormValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (settings) {
      const values: Record<string, any> = {};
      settings.forEach((setting) => {
        values[setting.setting_key] = setting.setting_value;
      });
      setFormValues(values);
    }
  }, [settings]);

  const handleUpdate = (settingKey: string, value: any) => {
    updateMutation.mutate({ settingKey, settingValue: value });
  };

  const settingsByCategory = settings?.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, typeof settings>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderSettingField = (setting: any) => {
    const value = formValues[setting.setting_key];

    switch (setting.setting_type) {
      case "boolean":
        return (
          <div className="flex items-center justify-between" key={setting.id}>
            <div className="space-y-0.5">
              <Label>{setting.setting_key.replace(/_/g, " ").toUpperCase()}</Label>
              {setting.description && (
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              )}
            </div>
            <Switch
              checked={value === true || value === "true"}
              onCheckedChange={(checked) => handleUpdate(setting.setting_key, checked)}
            />
          </div>
        );

      case "number":
        return (
          <div className="space-y-2" key={setting.id}>
            <Label>{setting.setting_key.replace(/_/g, " ").toUpperCase()}</Label>
            {setting.description && (
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            )}
            <Input
              type="number"
              value={value || ""}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                setFormValues({ ...formValues, [setting.setting_key]: newValue });
              }}
              onBlur={(e) => {
                const newValue = parseInt(e.target.value);
                if (!isNaN(newValue)) {
                  handleUpdate(setting.setting_key, newValue);
                }
              }}
            />
          </div>
        );

      case "string":
      default:
        return (
          <div className="space-y-2" key={setting.id}>
            <Label>{setting.setting_key.replace(/_/g, " ").toUpperCase()}</Label>
            {setting.description && (
              <p className="text-xs text-muted-foreground">{setting.description}</p>
            )}
            <Input
              value={value?.replace(/"/g, "") || ""}
              onChange={(e) =>
                setFormValues({ ...formValues, [setting.setting_key]: e.target.value })
              }
              onBlur={(e) => {
                handleUpdate(setting.setting_key, JSON.stringify(e.target.value));
              }}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Site Settings</h2>
        <p className="text-muted-foreground">
          Manage global site configuration and feature flags
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          {Object.keys(settingsByCategory || {}).map((category) => (
            <TabsTrigger key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(settingsByCategory || {}).map(([category, categorySettings]) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle>{category.charAt(0).toUpperCase() + category.slice(1)} Settings</CardTitle>
                <CardDescription>
                  Configure {category} settings for your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {categorySettings?.map((setting) => renderSettingField(setting))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
