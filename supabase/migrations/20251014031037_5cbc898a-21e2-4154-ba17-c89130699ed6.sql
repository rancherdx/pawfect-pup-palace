-- Create site contact info table
CREATE TABLE IF NOT EXISTS public.site_contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT,
  email TEXT,
  address_city TEXT DEFAULT 'Detroit',
  address_state TEXT DEFAULT 'Michigan',
  hours_of_operation JSONB DEFAULT '{"monday": "9:00 AM - 5:00 PM", "tuesday": "9:00 AM - 5:00 PM", "wednesday": "9:00 AM - 5:00 PM", "thursday": "9:00 AM - 5:00 PM", "friday": "9:00 AM - 5:00 PM", "saturday": "10:00 AM - 4:00 PM", "sunday": "Closed"}'::jsonb,
  holiday_hours JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_contact_info ENABLE ROW LEVEL SECURITY;

-- Only one contact info row should exist
CREATE UNIQUE INDEX site_contact_info_singleton ON public.site_contact_info ((1));

-- Admin can manage contact info
CREATE POLICY "site_contact_info_admin_all"
  ON public.site_contact_info
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Public can read contact info
CREATE POLICY "site_contact_info_select_public"
  ON public.site_contact_info
  FOR SELECT
  USING (true);

-- Insert default contact info
INSERT INTO public.site_contact_info (phone, email, address_city, address_state)
VALUES (
  '(555) 123-4567',
  'contact@gdspuppies.com',
  'Detroit',
  'Michigan'
)
ON CONFLICT DO NOTHING;

-- Update timestamp trigger
CREATE TRIGGER update_site_contact_info_updated_at
  BEFORE UPDATE ON public.site_contact_info
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();