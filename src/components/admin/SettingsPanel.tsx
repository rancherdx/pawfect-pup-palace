import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, RefreshCw, Globe, Mail, Shield, Palette } from "lucide-react";
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
  features: {
    enableBlog: boolean;
    enableTestimonials: boolean;
    enableNewsletter: boolean;
    maintenanceMode: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string;
    favicon: string;
  };
}

const defaultSettings: SiteSettings = {
  siteName: "GDS Puppies",
  siteDescription: "Premium puppy breeding and adoption services",
  contactEmail: "info@gdspuppies.com",
  contactPhone: "",
  address: "",
  socialMedia: {},
  seo: {
    metaTitle: "GDS Puppies - Premium Puppy Breeding",
    metaDescription: "Find your perfect puppy companion from our premium breeding program",
    keywords: "puppies, breeding, adoption, dogs"
  },
  features: {
    enableBlog: true,
    enableTestimonials: true,
    enableNewsletter: false,
    maintenanceMode: false
  },
  branding: {
    primaryColor: "#dc2626",
    secondaryColor: "#374151",
    logoUrl: "",
    favicon: ""
  }
};

const SettingsPanel = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      try {
        const response = await adminApi.getSiteSettings();
        return response;
      } catch (error) {
        console.log('No existing settings found, using defaults');
        return defaultSettings;
      }
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: SiteSettings) => {
      return adminApi.updateSiteSettings('site_config', newSettings as unknown as Record<string, unknown>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      toast.success('Settings updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    }
  });

  useEffect(() => {
    if (settingsData) {
      setSettings({ ...defaultSettings, ...settingsData });
    }
  }, [settingsData]);

  const handleInputChange = (section: keyof SiteSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' 
        ? { ...prev[section], [field]: value }
        : value
    }));
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-red" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center">
          <Settings className="mr-2 h-8 w-8 text-brand-red" />
          Site Settings
        </h2>
        <Button 
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          className="bg-brand-red hover:bg-red-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', '', e.target.value)}
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange('siteDescription', '', e.target.value)}
                  placeholder="Enter site description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metaTitle">SEO Title</Label>
                  <Input
                    id="metaTitle"
                    value={settings.seo.metaTitle}
                    onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
                    placeholder="Enter SEO title"
                  />
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={settings.seo.keywords}
                    onChange={(e) => handleInputChange('seo', 'keywords', e.target.value)}
                    placeholder="Enter keywords (comma separated)"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="metaDescription">SEO Description</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription}
                  onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                  placeholder="Enter SEO description"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', '', e.target.value)}
                    placeholder="Enter contact email"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', '', e.target.value)}
                    placeholder="Enter contact phone"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleInputChange('address', '', e.target.value)}
                  placeholder="Enter business address"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook URL</Label>
                  <Input
                    id="facebook"
                    value={settings.socialMedia.facebook || ''}
                    onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram URL</Label>
                  <Input
                    id="instagram"
                    value={settings.socialMedia.instagram || ''}
                    onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter URL</Label>
                  <Input
                    id="twitter"
                    value={settings.socialMedia.twitter || ''}
                    onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableBlog">Enable Blog</Label>
                  <p className="text-sm text-muted-foreground">Show blog posts on your site</p>
                </div>
                <Switch
                  id="enableBlog"
                  checked={settings.features.enableBlog}
                  onCheckedChange={(checked) => handleInputChange('features', 'enableBlog', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableTestimonials">Enable Testimonials</Label>
                  <p className="text-sm text-muted-foreground">Display customer testimonials</p>
                </div>
                <Switch
                  id="enableTestimonials"
                  checked={settings.features.enableTestimonials}
                  onCheckedChange={(checked) => handleInputChange('features', 'enableTestimonials', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableNewsletter">Enable Newsletter</Label>
                  <p className="text-sm text-muted-foreground">Show newsletter signup form</p>
                </div>
                <Switch
                  id="enableNewsletter"
                  checked={settings.features.enableNewsletter}
                  onCheckedChange={(checked) => handleInputChange('features', 'enableNewsletter', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable to show maintenance page</p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.features.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange('features', 'maintenanceMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.branding.primaryColor}
                      onChange={(e) => handleInputChange('branding', 'primaryColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.branding.primaryColor}
                      onChange={(e) => handleInputChange('branding', 'primaryColor', e.target.value)}
                      placeholder="#dc2626"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={settings.branding.secondaryColor}
                      onChange={(e) => handleInputChange('branding', 'secondaryColor', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={settings.branding.secondaryColor}
                      onChange={(e) => handleInputChange('branding', 'secondaryColor', e.target.value)}
                      placeholder="#374151"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={settings.branding.logoUrl}
                  onChange={(e) => handleInputChange('branding', 'logoUrl', e.target.value)}
                  placeholder="Enter logo image URL"
                />
              </div>
              <div>
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  value={settings.branding.favicon}
                  onChange={(e) => handleInputChange('branding', 'favicon', e.target.value)}
                  placeholder="Enter favicon URL"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPanel;