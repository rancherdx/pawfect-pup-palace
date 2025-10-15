import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Download, Bell, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface PWASettings {
  id: string;
  app_name: string;
  short_name: string;
  description: string;
  theme_color: string;
  background_color: string;
  display: string;
  orientation: string;
  start_url: string;
  scope: string;
  icon_192_url: string | null;
  icon_512_url: string | null;
  push_notifications_enabled: boolean;
}

export function PWAConfiguration() {
  const [settings, setSettings] = useState<PWASettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('pwa_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching PWA settings:', error);
      toast.error('Failed to load PWA settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pwa_settings')
        .update({
          app_name: settings.app_name,
          short_name: settings.short_name,
          description: settings.description,
          theme_color: settings.theme_color,
          background_color: settings.background_color,
          display: settings.display,
          orientation: settings.orientation,
          start_url: settings.start_url,
          scope: settings.scope,
          push_notifications_enabled: settings.push_notifications_enabled,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast.success('PWA settings saved successfully');
      
      // Update manifest
      await updateManifest();
    } catch (error) {
      console.error('Error saving PWA settings:', error);
      toast.error('Failed to save PWA settings');
    } finally {
      setSaving(false);
    }
  };

  const updateManifest = async () => {
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      
      // Update manifest with new settings
      manifest.name = settings?.app_name;
      manifest.short_name = settings?.short_name;
      manifest.description = settings?.description;
      manifest.theme_color = settings?.theme_color;
      manifest.background_color = settings?.background_color;
      manifest.display = settings?.display;
      manifest.orientation = settings?.orientation;
      manifest.start_url = settings?.start_url;
      manifest.scope = settings?.scope;

      // Create blob and URL
      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Update manifest link
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        manifestLink.setAttribute('href', url);
      }
    } catch (error) {
      console.error('Error updating manifest:', error);
    }
  };

  const handleInstallPrompt = () => {
    toast.info('To install this app, use your browser\'s menu: Share → Add to Home Screen (iOS) or Menu → Install App (Android)');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No PWA settings found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Progressive Web App Configuration
          </CardTitle>
          <CardDescription>
            Configure your app's PWA settings for installation and offline functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="app_name">App Name</Label>
              <Input
                id="app_name"
                value={settings.app_name}
                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                placeholder="GDS Puppies"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_name">Short Name</Label>
              <Input
                id="short_name"
                value={settings.short_name}
                onChange={(e) => setSettings({ ...settings, short_name: e.target.value })}
                placeholder="GDS Puppies"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="Find your perfect puppy companion"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="theme_color">Theme Color</Label>
              <div className="flex gap-2">
                <Input
                  id="theme_color"
                  type="color"
                  value={settings.theme_color}
                  onChange={(e) => setSettings({ ...settings, theme_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={settings.theme_color}
                  onChange={(e) => setSettings({ ...settings, theme_color: e.target.value })}
                  placeholder="#E53E3E"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background_color">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="background_color"
                  type="color"
                  value={settings.background_color}
                  onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  value={settings.background_color}
                  onChange={(e) => setSettings({ ...settings, background_color: e.target.value })}
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display">Display Mode</Label>
              <Select
                value={settings.display}
                onValueChange={(value) => setSettings({ ...settings, display: value })}
              >
                <SelectTrigger id="display">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standalone">Standalone</SelectItem>
                  <SelectItem value="fullscreen">Fullscreen</SelectItem>
                  <SelectItem value="minimal-ui">Minimal UI</SelectItem>
                  <SelectItem value="browser">Browser</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orientation">Orientation</Label>
              <Select
                value={settings.orientation}
                onValueChange={(value) => setSettings({ ...settings, orientation: value })}
              >
                <SelectTrigger id="orientation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_url">Start URL</Label>
              <Input
                id="start_url"
                value={settings.start_url}
                onChange={(e) => setSettings({ ...settings, start_url: e.target.value })}
                placeholder="/"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope">Scope</Label>
              <Input
                id="scope"
                value={settings.scope}
                onChange={(e) => setSettings({ ...settings, scope: e.target.value })}
                placeholder="/"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="push_notifications">Enable Push Notifications</Label>
            </div>
            <Switch
              id="push_notifications"
              checked={settings.push_notifications_enabled}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, push_notifications_enabled: checked })
              }
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
            <Button variant="outline" onClick={handleInstallPrompt}>
              <Download className="mr-2 h-4 w-4" />
              Install Instructions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installation Page</CardTitle>
          <CardDescription>
            Share this link with users to help them install your PWA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Direct users to the installation page for step-by-step instructions on adding your app to their home screen.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="flex-1 px-3 py-2 bg-muted rounded text-sm">
              {window.location.origin}/install
            </code>
            <Button 
              variant="outline" 
              onClick={() => window.open('/install', '_blank')}
              className="min-h-11"
            >
              <Download className="mr-2 h-4 w-4" />
              Preview Page
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PWA Icons</CardTitle>
          <CardDescription>
            Upload 192x192 and 512x512 icons through the Brand Assets Manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Navigate to Settings → Branding to upload PWA icons. The system will automatically use them for the app installation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
