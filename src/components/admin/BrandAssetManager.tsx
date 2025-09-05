import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Image, Palette, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ImageUploadWithCrop from '@/components/media/ImageUploadWithCrop';

interface BrandAsset {
  id: string;
  asset_type: 'favicon' | 'logo_light' | 'logo_dark' | 'logo_mobile' | 'watermark';
  asset_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const BrandAssetManager: React.FC = () => {
  const [activeUpload, setActiveUpload] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: brandAssets, isLoading } = useQuery({
    queryKey: ['brand-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_assets')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BrandAsset[];
    },
  });

  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings', 'branding'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'branding')
        .single();
      
      if (error) throw error;
      return data?.value as { companyName?: string; tagline?: string };
    },
  });

  const updateBrandingMutation = useMutation({
    mutationFn: async (settings: { companyName: string; tagline: string }) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key: 'branding', 
          value: settings 
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'branding'] });
      toast.success('Branding settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update branding settings');
      console.error(error);
    },
  });

  const uploadAssetMutation = useMutation({
    mutationFn: async ({ assetType, assetUrl }: { assetType: string; assetUrl: string }) => {
      // Deactivate existing asset of same type
      await supabase
        .from('brand_assets')
        .update({ is_active: false })
        .eq('asset_type', assetType);
      
      // Insert new asset
      const { error } = await supabase
        .from('brand_assets')
        .insert({
          asset_type: assetType,
          asset_url: assetUrl,
          is_active: true,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      setActiveUpload(null);
      toast.success('Brand asset uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload brand asset');
      console.error(error);
    },
  });

  const handleAssetUpload = (assetType: string) => (urls: string[]) => {
    if (urls.length > 0) {
      uploadAssetMutation.mutate({ assetType, assetUrl: urls[0] });
    }
  };

  const handleBrandingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateBrandingMutation.mutate({
      companyName: formData.get('companyName') as string,
      tagline: formData.get('tagline') as string,
    });
  };

  const assetTypes = [
    {
      type: 'favicon',
      title: 'Favicon',
      description: 'Small icon displayed in browser tabs (32x32px recommended)',
      icon: <Image className="h-4 w-4" />,
    },
    {
      type: 'logo_light',
      title: 'Logo (Light Theme)',
      description: 'Main logo for light backgrounds',
      icon: <Palette className="h-4 w-4" />,
    },
    {
      type: 'logo_dark',
      title: 'Logo (Dark Theme)',
      description: 'Logo variant for dark backgrounds',
      icon: <Palette className="h-4 w-4" />,
    },
    {
      type: 'logo_mobile',
      title: 'Mobile Logo',
      description: 'Compact logo version for mobile navigation',
      icon: <Smartphone className="h-4 w-4" />,
    },
    {
      type: 'watermark',
      title: 'Photo Watermark',
      description: 'Semi-transparent overlay for puppy photos',
      icon: <Image className="h-4 w-4" />,
    },
  ];

  const getCurrentAsset = (type: string) => {
    return brandAssets?.find(asset => asset.asset_type === type);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading brand assets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Update your business name and tagline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBrandingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    defaultValue={siteSettings?.companyName || ''}
                    placeholder="Your Business Name"
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    name="tagline"
                    defaultValue={siteSettings?.tagline || ''}
                    placeholder="Your Business Tagline"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={updateBrandingMutation.isPending}
              >
                {updateBrandingMutation.isPending ? 'Updating...' : 'Update Branding'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {assetTypes.map((assetType) => {
            const currentAsset = getCurrentAsset(assetType.type);
            const isUploading = activeUpload === assetType.type;
            
            return (
              <Card key={assetType.type}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {assetType.icon}
                    <CardTitle className="text-lg">{assetType.title}</CardTitle>
                  </div>
                  <CardDescription>{assetType.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentAsset && (
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <img
                          src={currentAsset.asset_url}
                          alt={assetType.title}
                          className="w-16 h-16 object-contain rounded border"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Current {assetType.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded {new Date(currentAsset.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {isUploading ? (
                      <div className="space-y-4">
                        <ImageUploadWithCrop
                          onImagesUploaded={handleAssetUpload(assetType.type)}
                          bucket="brand-assets"
                          maxImages={1}
                        />
                        <Button
                          variant="outline"
                          onClick={() => setActiveUpload(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setActiveUpload(assetType.type)}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {currentAsset ? 'Replace' : 'Upload'} {assetType.title}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BrandAssetManager;