-- Enhanced testimonials table with Google Reviews integration
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS puppy_name TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS testimonial_text TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'local' CHECK (source IN ('local', 'google', 'facebook'));
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS google_review_id TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS review_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS reviewer_avatar TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS admin_approved BOOLEAN DEFAULT true;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS response_text TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS response_date TIMESTAMP WITH TIME ZONE;

-- Update existing testimonials to use new structure
UPDATE testimonials SET testimonial_text = content WHERE testimonial_text IS NULL;
UPDATE testimonials SET review_date = created_at WHERE review_date IS NULL;

-- Create SEO meta table for page-specific SEO data
CREATE TABLE IF NOT EXISTS seo_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL, -- 'puppy', 'litter', 'page', 'blog_post'
  page_id TEXT, -- ID of the specific item (puppy_id, litter_id, etc.)
  page_slug TEXT, -- URL slug for static pages
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index,follow',
  schema_markup JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on seo_meta table
ALTER TABLE seo_meta ENABLE ROW LEVEL SECURITY;

-- Create policies for seo_meta
CREATE POLICY "seo_meta_admin_all" ON seo_meta
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "seo_meta_select_public" ON seo_meta
  FOR SELECT USING (true);

-- Create google_reviews_cache table for caching Google reviews
CREATE TABLE IF NOT EXISTS google_reviews_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_review_id TEXT UNIQUE NOT NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_photo_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  time_created TIMESTAMP WITH TIME ZONE NOT NULL,
  relative_time_description TEXT,
  reply_text TEXT,
  reply_time_created TIMESTAMP WITH TIME ZONE,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on google_reviews_cache table
ALTER TABLE google_reviews_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for google_reviews_cache
CREATE POLICY "google_reviews_admin_all" ON google_reviews_cache
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "google_reviews_select_public" ON google_reviews_cache
  FOR SELECT USING (true);

-- Create breed_templates table (enhance existing or create new)
CREATE TABLE IF NOT EXISTS breed_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed_name TEXT UNIQUE NOT NULL,
  description TEXT,
  size TEXT, -- 'small', 'medium', 'large', 'extra_large'
  temperament TEXT[],
  care_instructions TEXT,
  common_traits TEXT[],
  average_weight_min DECIMAL(5,2),
  average_weight_max DECIMAL(5,2),
  life_expectancy_min INTEGER,
  life_expectancy_max INTEGER,
  exercise_needs TEXT, -- 'low', 'moderate', 'high'
  grooming_needs TEXT, -- 'low', 'moderate', 'high'
  good_with_kids BOOLEAN DEFAULT true,
  good_with_pets BOOLEAN DEFAULT true,
  hypoallergenic BOOLEAN DEFAULT false,
  photo_url TEXT,
  gallery_urls TEXT[],
  health_considerations TEXT[],
  origin_country TEXT,
  akc_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on breed_templates table
ALTER TABLE breed_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for breed_templates
CREATE POLICY "breed_templates_admin_all" ON breed_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "breed_templates_select_public" ON breed_templates
  FOR SELECT USING (true);

-- Add breed_template_id to puppies table if not exists
ALTER TABLE puppies ADD COLUMN IF NOT EXISTS breed_template_id UUID REFERENCES breed_templates(id);

-- Add breed_template_id to litters table if not exists  
ALTER TABLE litters ADD COLUMN IF NOT EXISTS breed_template_id UUID REFERENCES breed_templates(id);

-- Create google_business_config table for Google Business Profile integration
CREATE TABLE IF NOT EXISTS google_business_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  place_id TEXT NOT NULL,
  account_id TEXT,
  location_id TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  last_sync TIMESTAMP WITH TIME ZONE,
  sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on google_business_config table
ALTER TABLE google_business_config ENABLE ROW LEVEL SECURITY;

-- Create policies for google_business_config
CREATE POLICY "google_business_config_admin_all" ON google_business_config
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_seo_meta_updated_at ON seo_meta;
CREATE TRIGGER update_seo_meta_updated_at
  BEFORE UPDATE ON seo_meta
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_google_reviews_cache_updated_at ON google_reviews_cache;
CREATE TRIGGER update_google_reviews_cache_updated_at
  BEFORE UPDATE ON google_reviews_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_breed_templates_updated_at ON breed_templates;
CREATE TRIGGER update_breed_templates_updated_at
  BEFORE UPDATE ON breed_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_google_business_config_updated_at ON google_business_config;
CREATE TRIGGER update_google_business_config_updated_at
  BEFORE UPDATE ON google_business_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();