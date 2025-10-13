-- Phase 3: Email System Configuration
INSERT INTO site_settings (key, value) VALUES 
('mailchannels_dkim_public_key', '{"key": ""}'),
('mailchannels_dkim_private_key', '{"key": ""}'),
('mailchannels_dkim_domain', '{"domain": "gdspuppies.com"}'),
('mailchannels_config', jsonb_build_object(
  'sandbox', jsonb_build_object('api_key', '', 'account_id', '', 'from_email', 'sandbox@gdspuppies.com'),
  'production', jsonb_build_object('api_key', '', 'account_id', '', 'from_email', 'noreply@gdspuppies.com'),
  'active_environment', 'sandbox'
))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Phase 4: Image Metadata System
CREATE TABLE IF NOT EXISTS image_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL UNIQUE,
  alt_text TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('puppy', 'parent', 'litter', 'brand')),
  entity_id UUID,
  display_order INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_image_metadata_entity ON image_metadata(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_url ON image_metadata(image_url);

-- Enable RLS
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view image metadata" ON image_metadata;
CREATE POLICY "Public can view image metadata"
  ON image_metadata FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage image metadata" ON image_metadata;
CREATE POLICY "Admins can manage image metadata"
  ON image_metadata FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_image_metadata_updated_at ON image_metadata;
CREATE TRIGGER update_image_metadata_updated_at
  BEFORE UPDATE ON image_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Watermark Configuration
INSERT INTO site_settings (key, value) VALUES 
('watermark_config', jsonb_build_object(
  'enabled', false,
  'watermark_url', '',
  'position', 'bottom-right',
  'offset_x', 20,
  'offset_y', 20,
  'opacity', 0.8,
  'scale', 1.0
))
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;