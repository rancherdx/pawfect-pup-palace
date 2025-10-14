-- Create PWA settings table
CREATE TABLE IF NOT EXISTS public.pwa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name TEXT NOT NULL DEFAULT 'GDS Puppies',
  short_name TEXT NOT NULL DEFAULT 'GDS Puppies',
  description TEXT NOT NULL DEFAULT 'Find your perfect puppy companion',
  theme_color TEXT NOT NULL DEFAULT '#E53E3E',
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',
  display TEXT NOT NULL DEFAULT 'standalone',
  orientation TEXT NOT NULL DEFAULT 'portrait',
  start_url TEXT NOT NULL DEFAULT '/',
  scope TEXT NOT NULL DEFAULT '/',
  icon_192_url TEXT,
  icon_512_url TEXT,
  push_notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pwa_settings ENABLE ROW LEVEL SECURITY;

-- Only one settings row should exist
CREATE UNIQUE INDEX pwa_settings_singleton ON public.pwa_settings ((1));

-- Admin can manage PWA settings
CREATE POLICY "pwa_settings_admin_all"
  ON public.pwa_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Public can read PWA settings
CREATE POLICY "pwa_settings_select_public"
  ON public.pwa_settings
  FOR SELECT
  USING (true);

-- Insert default PWA settings
INSERT INTO public.pwa_settings (app_name, short_name, description)
VALUES ('GDS Puppies', 'GDS Puppies', 'Find your perfect puppy companion')
ON CONFLICT DO NOTHING;

-- Create push subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "push_subscriptions_user_manage"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "push_subscriptions_admin_select"
  ON public.push_subscriptions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  site_visits BOOLEAN DEFAULT false,
  form_submissions BOOLEAN DEFAULT true,
  new_orders BOOLEAN DEFAULT true,
  chat_messages BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY "notification_preferences_user_manage"
  ON public.notification_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- Update timestamp trigger for pwa_settings
CREATE TRIGGER update_pwa_settings_updated_at
  BEFORE UPDATE ON public.pwa_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update timestamp trigger for notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();