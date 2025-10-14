import { useState } from "react";
import { useAnalytics, useUpdateAnalytics } from "@/hooks/useAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3, Facebook, Tag, Eye, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const AnalyticsManager = () => {
  const { data: settings, isLoading } = useAnalytics();
  const updateMutation = useUpdateAnalytics();
  
  const [formData, setFormData] = useState({
    google_analytics_id: "",
    google_analytics_enabled: false,
    facebook_pixel_id: "",
    facebook_pixel_enabled: false,
    google_tag_manager_id: "",
    google_tag_manager_enabled: false,
    microsoft_clarity_id: "",
    microsoft_clarity_enabled: false,
    hotjar_site_id: "",
    hotjar_enabled: false,
  });

  // Update form when settings load
  useState(() => {
    if (settings) {
      setFormData({
        google_analytics_id: settings.google_analytics_id || "",
        google_analytics_enabled: settings.google_analytics_enabled,
        facebook_pixel_id: settings.facebook_pixel_id || "",
        facebook_pixel_enabled: settings.facebook_pixel_enabled,
        google_tag_manager_id: settings.google_tag_manager_id || "",
        google_tag_manager_enabled: settings.google_tag_manager_enabled,
        microsoft_clarity_id: settings.microsoft_clarity_id || "",
        microsoft_clarity_enabled: settings.microsoft_clarity_enabled,
        hotjar_site_id: settings.hotjar_site_id || "",
        hotjar_enabled: settings.hotjar_enabled,
      });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Integration</h2>
        <p className="text-muted-foreground">
          Connect your analytics platforms to track visitor behavior and optimize your site
        </p>
      </div>

      <div className="grid gap-6">
        {/* Google Analytics 4 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Google Analytics 4</CardTitle>
            </div>
            <CardDescription>
              Track website traffic, user behavior, and conversions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ga4-id">Measurement ID</Label>
              <Input
                id="ga4-id"
                placeholder="G-XXXXXXXXXX"
                value={formData.google_analytics_id}
                onChange={(e) =>
                  setFormData({ ...formData, google_analytics_id: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Find this in your Google Analytics property settings
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="ga4-enabled">Enable Google Analytics</Label>
              <Switch
                id="ga4-enabled"
                checked={formData.google_analytics_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, google_analytics_enabled: checked })
                }
                disabled={!formData.google_analytics_id}
              />
            </div>
          </CardContent>
        </Card>

        {/* Facebook Pixel */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-primary" />
              <CardTitle>Facebook Pixel</CardTitle>
            </div>
            <CardDescription>
              Track conversions, optimize ads, and build targeted audiences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fb-pixel-id">Pixel ID</Label>
              <Input
                id="fb-pixel-id"
                placeholder="123456789012345"
                value={formData.facebook_pixel_id}
                onChange={(e) =>
                  setFormData({ ...formData, facebook_pixel_id: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Find this in your Facebook Events Manager
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="fb-enabled">Enable Facebook Pixel</Label>
              <Switch
                id="fb-enabled"
                checked={formData.facebook_pixel_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, facebook_pixel_enabled: checked })
                }
                disabled={!formData.facebook_pixel_id}
              />
            </div>
          </CardContent>
        </Card>

        {/* Google Tag Manager */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle>Google Tag Manager</CardTitle>
            </div>
            <CardDescription>
              Manage all your marketing tags in one place
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gtm-id">Container ID</Label>
              <Input
                id="gtm-id"
                placeholder="GTM-XXXXXXX"
                value={formData.google_tag_manager_id}
                onChange={(e) =>
                  setFormData({ ...formData, google_tag_manager_id: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Find this in your Google Tag Manager container settings
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="gtm-enabled">Enable Google Tag Manager</Label>
              <Switch
                id="gtm-enabled"
                checked={formData.google_tag_manager_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, google_tag_manager_enabled: checked })
                }
                disabled={!formData.google_tag_manager_id}
              />
            </div>
          </CardContent>
        </Card>

        {/* Microsoft Clarity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>Microsoft Clarity</CardTitle>
            </div>
            <CardDescription>
              View heatmaps and session recordings to understand user behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clarity-id">Project ID</Label>
              <Input
                id="clarity-id"
                placeholder="abcdefghij"
                value={formData.microsoft_clarity_id}
                onChange={(e) =>
                  setFormData({ ...formData, microsoft_clarity_id: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Find this in your Microsoft Clarity project settings
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="clarity-enabled">Enable Microsoft Clarity</Label>
              <Switch
                id="clarity-enabled"
                checked={formData.microsoft_clarity_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, microsoft_clarity_enabled: checked })
                }
                disabled={!formData.microsoft_clarity_id}
              />
            </div>
          </CardContent>
        </Card>

        {/* Hotjar */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Hotjar</CardTitle>
            </div>
            <CardDescription>
              Understand how users interact with your site through heatmaps and feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hotjar-id">Site ID</Label>
              <Input
                id="hotjar-id"
                placeholder="1234567"
                value={formData.hotjar_site_id}
                onChange={(e) =>
                  setFormData({ ...formData, hotjar_site_id: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Find this in your Hotjar site settings
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="hotjar-enabled">Enable Hotjar</Label>
              <Switch
                id="hotjar-enabled"
                checked={formData.hotjar_enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, hotjar_enabled: checked })
                }
                disabled={!formData.hotjar_site_id}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          size="lg"
        >
          {updateMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Analytics Settings
        </Button>
      </div>
    </div>
  );
};
