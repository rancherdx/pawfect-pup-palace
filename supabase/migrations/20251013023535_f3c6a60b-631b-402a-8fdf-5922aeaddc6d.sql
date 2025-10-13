-- Phase 5: Puppy/Litter/Parent Management System

-- Color templates table
CREATE TABLE IF NOT EXISTS color_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  color_name TEXT UNIQUE NOT NULL,
  layman_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE color_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view color templates" ON color_templates;
CREATE POLICY "Public can view color templates"
  ON color_templates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage color templates" ON color_templates;
CREATE POLICY "Admins can manage color templates"
  ON color_templates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add FAQ fields to breed_templates if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='breed_templates' AND column_name='common_faqs') THEN
    ALTER TABLE breed_templates ADD COLUMN common_faqs JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='breed_templates' AND column_name='breed_specific_faqs') THEN
    ALTER TABLE breed_templates ADD COLUMN breed_specific_faqs JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Phase 7: Form Tracking & Notifications System

-- Form submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_name TEXT NOT NULL,
  form_data JSONB NOT NULL,
  user_email TEXT,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_name ON form_submissions(form_name);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created ON form_submissions(created_at DESC);

-- Enable RLS
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own submissions" ON form_submissions;
CREATE POLICY "Users can view their own submissions"
  ON form_submissions FOR SELECT
  USING (auth.uid() = user_id OR user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Anyone can submit forms" ON form_submissions;
CREATE POLICY "Anyone can submit forms"
  ON form_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all submissions" ON form_submissions;
CREATE POLICY "Admins can view all submissions"
  ON form_submissions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update submissions" ON form_submissions;
CREATE POLICY "Admins can update submissions"
  ON form_submissions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert some default color templates
INSERT INTO color_templates (color_name, layman_description) VALUES
  ('Apricot', 'A warm peachy-cream color'),
  ('Black', 'Solid black coat'),
  ('White', 'Pure white coat'),
  ('Brown', 'Rich chocolate or brown color'),
  ('Cream', 'Light cream or beige color'),
  ('Red', 'Reddish or rust-colored coat'),
  ('Merle', 'Mottled pattern with patches of color'),
  ('Phantom', 'Black with tan markings (like a Doberman pattern)'),
  ('Parti', 'White with patches of another color (50/50 split)'),
  ('Sable', 'Dark-tipped hairs over a lighter base'),
  ('Brindle', 'Striped or tiger-like pattern'),
  ('Tricolor', 'Three distinct colors in the coat')
ON CONFLICT (color_name) DO NOTHING;