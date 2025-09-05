-- Create storage buckets for media management
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('puppy-images', 'puppy-images', true),
  ('litter-images', 'litter-images', true), 
  ('brand-assets', 'brand-assets', true),
  ('videos', 'videos', true);

-- Create RLS policies for puppy-images bucket
CREATE POLICY "Puppy images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'puppy-images');

CREATE POLICY "Admins can upload puppy images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'puppy-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update puppy images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'puppy-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete puppy images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'puppy-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for litter-images bucket
CREATE POLICY "Litter images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'litter-images');

CREATE POLICY "Admins can upload litter images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'litter-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update litter images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'litter-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete litter images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'litter-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for brand-assets bucket  
CREATE POLICY "Brand assets are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'brand-assets');

CREATE POLICY "Admins can upload brand assets" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'brand-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update brand assets" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'brand-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete brand assets" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'brand-assets' AND has_role(auth.uid(), 'admin'::app_role));

-- Create RLS policies for videos bucket
CREATE POLICY "Videos are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Admins can upload videos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update videos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete videos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'videos' AND has_role(auth.uid(), 'admin'::app_role));

-- Add new columns to puppies table for featured system and enhanced media
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS banner_text text;
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS banner_color text DEFAULT '#ef4444';
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS video_urls text[] DEFAULT '{}';

-- Add new columns to litters table for enhanced media
ALTER TABLE litters ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';
ALTER TABLE litters ADD COLUMN IF NOT EXISTS video_urls text[] DEFAULT '{}';

-- Create brand_assets table for site branding
CREATE TABLE IF NOT EXISTS brand_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type text NOT NULL CHECK (asset_type IN ('favicon', 'logo_light', 'logo_dark', 'logo_mobile', 'watermark')),
  asset_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(asset_type, is_active)
);

-- Enable RLS on brand_assets
ALTER TABLE brand_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for brand_assets
CREATE POLICY "Brand assets are publicly viewable" 
ON brand_assets FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage brand assets" 
ON brand_assets FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for brand_assets updated_at
CREATE TRIGGER update_brand_assets_updated_at
BEFORE UPDATE ON brand_assets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default site settings for branding
INSERT INTO site_settings (key, value) VALUES 
('branding', '{"companyName": "Puppy Breeder", "tagline": "Find Your Perfect Companion"}')
ON CONFLICT (key) DO NOTHING;