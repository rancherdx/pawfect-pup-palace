import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings, Save, Loader2, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiRequest } from '@/api/client';

interface SiteSettings {
  siteName: string;
  contactEmail: string;
  maintenanceMode: boolean;
  logoUrl: string;
  defaultLanguage: string;
  currency: string;
  socialMediaLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  seoDefaults: {
    title: string;
    description: string;
    keywords: string;
  };
}

const initialFormData: SiteSettings = {
  siteName: "",
  contactEmail: "",
  maintenanceMode: false,
  logoUrl: "",
  defaultLanguage: "en-US",
  currency: "USD",
  socialMediaLinks: {
    facebook: "",
    instagram: "",
    twitter: "",
  },
  seoDefaults: {
    title: "",
    description: "",
    keywords: "",
  },
};

const SettingsPanel = () => {
  const [formData, setFormData] = useState<SiteSettings>(initialFormData);
  const queryClient = useQueryClient();

  const siteSettingsQuery = useQuery({
    queryKey: ['siteSettings'],
    queryFn: () => apiRequest<SiteSettings>('/admin/settings'),
  });

  const saveSettingsMutation = useMutation({
    mutationFn: (updatedSettings: SiteSettings) => apiRequest<SiteSettings>('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(updatedSettings),
    }),
    onSuccess: (savedData) => {
      toast.success('Site settings updated successfully!');
      queryClient.setQueryData(['siteSettings'], savedData);
      if (savedData) setFormData(savedData);
    },
    onError: (error: Error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });

  useEffect(() => {
    if (siteSettingsQuery.data) {
      setFormData(siteSettingsQuery.data);
    }
  }, [siteSettingsQuery.data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => {
      if (name.includes('.')) {
        const [outerKey, innerKey] = name.split('.') as [keyof SiteSettings, string];
        return {
          ...prev,
          [outerKey]: {
            // @ts-ignore
            ...prev[outerKey],
            [innerKey]: value,
          },
        };
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettingsMutation.mutate(formData);
  };

  if (siteSettingsQuery.isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-red" />
        <p className="ml-3 text-lg">Loading settings...</p>
      </div>
    );
  }

  if (siteSettingsQuery.isError) {
    return (
      <div className="space-y-6 p-4 md:p-6 text-center">
         <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
        <p className="text-red-500">Error loading site settings: {siteSettingsQuery.error?.message}</p>
        <Button onClick={() => siteSettingsQuery.refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center text-gray-800 dark:text-white">
          <Settings className="mr-3 h-7 w-7 text-brand-red" />
          Site Settings
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="shadow-lg dark:border-gray-700">
          <CardHeader>
            <CardTitle>General Configuration</CardTitle>
            <CardDescription>Basic information and operational settings for your site.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" name="siteName" value={formData.siteName} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input id="contactEmail" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" name="logoUrl" value={formData.logoUrl} onChange={handleInputChange} placeholder="e.g., /images/logo.png" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="defaultLanguage">Default Language</Label>
              <Input id="defaultLanguage" name="defaultLanguage" value={formData.defaultLanguage} onChange={handleInputChange} placeholder="e.g., en-US" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <select
                name="currency"
                id="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red bg-background"
              >
                <option value="USD">USD ($)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 pt-4 md:col-span-2">
              <Checkbox id="maintenanceMode" name="maintenanceMode" checked={formData.maintenanceMode} onCheckedChange={(checked) => setFormData(prev => ({...prev, maintenanceMode: Boolean(checked)}))} />
              <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg dark:border-gray-700">
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Links to your social media profiles.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="socialMediaLinks.facebook">Facebook URL</Label>
              <Input id="socialMediaLinks.facebook" name="socialMediaLinks.facebook" value={formData.socialMediaLinks.facebook} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="socialMediaLinks.instagram">Instagram URL</Label>
              <Input id="socialMediaLinks.instagram" name="socialMediaLinks.instagram" value={formData.socialMediaLinks.instagram} onChange={handleInputChange} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="socialMediaLinks.twitter">Twitter URL</Label>
              <Input id="socialMediaLinks.twitter" name="socialMediaLinks.twitter" value={formData.socialMediaLinks.twitter} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg dark:border-gray-700">
          <CardHeader>
            <CardTitle>Default SEO Settings</CardTitle>
            <CardDescription>Default Search Engine Optimization values for your site.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 p-6">
            <div className="space-y-2">
              <Label htmlFor="seoDefaults.title">Default SEO Title</Label>
              <Input id="seoDefaults.title" name="seoDefaults.title" value={formData.seoDefaults.title} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDefaults.description">Default SEO Description</Label>
              <Textarea id="seoDefaults.description" name="seoDefaults.description" value={formData.seoDefaults.description} onChange={handleInputChange} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seoDefaults.keywords">Default SEO Keywords (comma-separated)</Label>
              <Input id="seoDefaults.keywords" name="seoDefaults.keywords" value={formData.seoDefaults.keywords} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-end pt-6 px-0">
          <Button
            type="submit"
            className="bg-brand-red hover:bg-red-700 text-white min-w-[150px]"
            disabled={saveSettingsMutation.isPending || siteSettingsQuery.isLoading}
          >
            {saveSettingsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Settings
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default SettingsPanel;
