import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Eye, Save } from 'lucide-react';
import type { WatermarkConfig } from '@/utils/imageWatermark';

export const WatermarkManager: React.FC = () => {
  const [config, setConfig] = useState<WatermarkConfig>({
    enabled: false,
    watermark_url: '',
    position: 'bottom-right',
    offset_x: 20,
    offset_y: 20,
    opacity: 0.8,
    scale: 1.0,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing config
  useEffect(() => {
    loadWatermarkConfig();
  }, []);

  // Update preview whenever config changes
  useEffect(() => {
    if (config.watermark_url) {
      updatePreview();
    }
  }, [config]);

  const loadWatermarkConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'watermark_config')
        .single();

      if (error) throw error;
      if (data?.value) {
        setConfig(data.value as unknown as WatermarkConfig);
      }
    } catch (error) {
      console.error('Error loading watermark config:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/png')) {
      toast.error('Please upload a PNG image with transparency');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `watermark-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('brand-assets')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      setConfig(prev => ({ ...prev, watermark_url: publicUrl }));
      toast.success('Watermark uploaded successfully');
    } catch (error) {
      console.error('Error uploading watermark:', error);
      toast.error('Failed to upload watermark');
    } finally {
      setUploading(false);
    }
  };

  const updatePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create sample image (gradient background)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add sample text
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sample Puppy Image', canvas.width / 2, canvas.height / 2);

    // Load and draw watermark
    if (config.watermark_url) {
      const watermark = new Image();
      watermark.crossOrigin = 'anonymous';
      
      watermark.onload = () => {
        const wmWidth = watermark.width * config.scale;
        const wmHeight = watermark.height * config.scale;

        let x = config.offset_x;
        let y = config.offset_y;

        switch (config.position) {
          case 'top-right':
            x = canvas.width - wmWidth - config.offset_x;
            break;
          case 'bottom-left':
            y = canvas.height - wmHeight - config.offset_y;
            break;
          case 'bottom-right':
            x = canvas.width - wmWidth - config.offset_x;
            y = canvas.height - wmHeight - config.offset_y;
            break;
          case 'center':
            x = (canvas.width - wmWidth) / 2;
            y = (canvas.height - wmHeight) / 2;
            break;
        }

        ctx.globalAlpha = config.opacity;
        ctx.drawImage(watermark, x, y, wmWidth, wmHeight);
        ctx.globalAlpha = 1.0;
      };

      watermark.src = config.watermark_url;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: config as any })
        .eq('key', 'watermark_config');

      if (error) throw error;

      toast.success('Watermark settings saved successfully');
    } catch (error) {
      console.error('Error saving watermark config:', error);
      toast.error('Failed to save watermark settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Watermark Manager</CardTitle>
          <CardDescription>
            Upload and configure a watermark to automatically apply to all uploaded images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Watermark</Label>
              <p className="text-sm text-muted-foreground">
                Automatically apply watermark to all uploaded images
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {/* Upload Watermark */}
          <div className="space-y-2">
            <Label>Watermark Image</Label>
            <p className="text-sm text-muted-foreground">
              Upload a PNG image with transparency for best results
            </p>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/png"
                onChange={handleFileUpload}
                disabled={uploading}
                className="flex-1"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            {config.watermark_url && (
              <div className="mt-2">
                <img
                  src={config.watermark_url}
                  alt="Watermark preview"
                  className="h-20 object-contain border rounded p-2 bg-gray-50"
                />
              </div>
            )}
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label>Position</Label>
            <Select
              value={config.position}
              onValueChange={(value: any) => setConfig(prev => ({ ...prev, position: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                <SelectItem value="center">Center</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Offset X */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Horizontal Offset</Label>
              <span className="text-sm text-muted-foreground">{config.offset_x}px</span>
            </div>
            <Slider
              value={[config.offset_x]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, offset_x: value }))}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Offset Y */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Vertical Offset</Label>
              <span className="text-sm text-muted-foreground">{config.offset_y}px</span>
            </div>
            <Slider
              value={[config.offset_y]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, offset_y: value }))}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Opacity</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(config.opacity * 100)}%
              </span>
            </div>
            <Slider
              value={[config.opacity * 100]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, opacity: value / 100 }))}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Scale */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Scale</Label>
              <span className="text-sm text-muted-foreground">{config.scale.toFixed(1)}x</span>
            </div>
            <Slider
              value={[config.scale * 10]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, scale: value / 10 }))}
              min={5}
              max={20}
              step={1}
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full border rounded-lg bg-gray-50"
            />
          </div>

          {/* Save Button */}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving || !config.watermark_url}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button variant="outline" onClick={updatePreview} disabled={!config.watermark_url}>
              <Eye className="h-4 w-4 mr-2" />
              Refresh Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};