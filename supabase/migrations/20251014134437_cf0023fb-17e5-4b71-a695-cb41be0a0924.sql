-- Create analytics_settings table
CREATE TABLE IF NOT EXISTS public.analytics_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_analytics_id TEXT,
  google_analytics_enabled BOOLEAN DEFAULT false,
  facebook_pixel_id TEXT,
  facebook_pixel_enabled BOOLEAN DEFAULT false,
  google_tag_manager_id TEXT,
  google_tag_manager_enabled BOOLEAN DEFAULT false,
  microsoft_clarity_id TEXT,
  microsoft_clarity_enabled BOOLEAN DEFAULT false,
  hotjar_site_id TEXT,
  hotjar_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.analytics_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage all settings
CREATE POLICY "analytics_settings_admin_all"
  ON public.analytics_settings
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can read enabled settings (for frontend injection)
CREATE POLICY "analytics_settings_select_public"
  ON public.analytics_settings
  FOR SELECT
  TO public
  USING (true);

-- Ensure only one row exists
CREATE UNIQUE INDEX analytics_settings_singleton ON public.analytics_settings ((id IS NOT NULL));

-- Insert default row
INSERT INTO public.analytics_settings (id) 
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Add updated_at trigger
CREATE TRIGGER update_analytics_settings_updated_at
  BEFORE UPDATE ON public.analytics_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();