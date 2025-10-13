-- Create design tokens table for dynamic theme customization
CREATE TABLE IF NOT EXISTS public.design_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_name TEXT NOT NULL UNIQUE,
  token_category TEXT NOT NULL, -- 'color', 'spacing', 'typography', 'animation'
  light_value TEXT,
  dark_value TEXT,
  dimmed_value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create theme presets table
CREATE TABLE IF NOT EXISTS public.theme_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preset_name TEXT NOT NULL UNIQUE,
  is_default BOOLEAN DEFAULT false,
  theme_mode TEXT NOT NULL CHECK (theme_mode IN ('light', 'dark', 'dimmed')),
  tokens JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user theme preferences table
CREATE TABLE IF NOT EXISTS public.user_theme_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_mode TEXT NOT NULL DEFAULT 'dimmed' CHECK (theme_mode IN ('light', 'dark', 'dimmed', 'system')),
  custom_tokens JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.design_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_theme_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for design_tokens
CREATE POLICY "design_tokens_select_public" ON public.design_tokens
  FOR SELECT USING (true);

CREATE POLICY "design_tokens_admin_all" ON public.design_tokens
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for theme_presets
CREATE POLICY "theme_presets_select_public" ON public.theme_presets
  FOR SELECT USING (true);

CREATE POLICY "theme_presets_admin_all" ON public.theme_presets
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_theme_preferences
CREATE POLICY "user_theme_preferences_select_own" ON public.user_theme_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_theme_preferences_insert_own" ON public.user_theme_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_theme_preferences_update_own" ON public.user_theme_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_theme_preferences_delete_own" ON public.user_theme_preferences
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "user_theme_preferences_admin_all" ON public.user_theme_preferences
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_design_tokens_updated_at
  BEFORE UPDATE ON public.design_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_theme_presets_updated_at
  BEFORE UPDATE ON public.theme_presets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_theme_preferences_updated_at
  BEFORE UPDATE ON public.user_theme_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default design tokens for Red/Black/White theme with Slate dimmed
INSERT INTO public.design_tokens (token_name, token_category, light_value, dark_value, dimmed_value, description) VALUES
  -- Primary colors
  ('primary', 'color', '0 0% 9%', '0 0% 98%', '0 84% 60%', 'Primary brand color - Red'),
  ('primary-foreground', 'color', '0 0% 98%', '0 0% 9%', '0 0% 98%', 'Primary foreground color'),
  
  -- Background colors
  ('background', 'color', '0 0% 100%', '0 0% 0%', '215 28% 17%', 'Page background - White/Black/Slate'),
  ('foreground', 'color', '0 0% 9%', '0 0% 98%', '213 31% 91%', 'Main text color'),
  
  -- Accent colors
  ('accent', 'color', '0 84% 60%', '0 84% 60%', '0 84% 60%', 'Accent color - Red'),
  ('accent-foreground', 'color', '0 0% 98%', '0 0% 98%', '0 0% 98%', 'Accent foreground'),
  
  -- Secondary colors
  ('secondary', 'color', '0 0% 96%', '0 0% 15%', '217 33% 17%', 'Secondary background'),
  ('secondary-foreground', 'color', '0 0% 9%', '0 0% 98%', '213 31% 91%', 'Secondary foreground'),
  
  -- Card colors
  ('card', 'color', '0 0% 100%', '0 0% 4%', '222 47% 11%', 'Card background'),
  ('card-foreground', 'color', '0 0% 9%', '0 0% 98%', '213 31% 91%', 'Card text'),
  
  -- Border and input
  ('border', 'color', '0 0% 90%', '0 0% 20%', '215 28% 25%', 'Border color'),
  ('input', 'color', '0 0% 90%', '0 0% 20%', '215 28% 25%', 'Input border'),
  ('ring', 'color', '0 84% 60%', '0 84% 60%', '0 84% 60%', 'Focus ring - Red'),
  
  -- Muted
  ('muted', 'color', '0 0% 96%', '0 0% 15%', '217 33% 17%', 'Muted background'),
  ('muted-foreground', 'color', '0 0% 45%', '0 0% 65%', '215 20% 65%', 'Muted text'),
  
  -- Destructive
  ('destructive', 'color', '0 84% 60%', '0 84% 60%', '0 84% 60%', 'Destructive action - Red'),
  ('destructive-foreground', 'color', '0 0% 98%', '0 0% 98%', '0 0% 98%', 'Destructive foreground'),
  
  -- Popover
  ('popover', 'color', '0 0% 100%', '0 0% 4%', '222 47% 11%', 'Popover background'),
  ('popover-foreground', 'color', '0 0% 9%', '0 0% 98%', '213 31% 91%', 'Popover text');

-- Insert default theme preset for Dimmed (Slate)
INSERT INTO public.theme_presets (preset_name, is_default, theme_mode, tokens) VALUES
  ('Dimmed Slate', true, 'dimmed', '{
    "primary": "0 84% 60%",
    "background": "215 28% 17%",
    "foreground": "213 31% 91%",
    "accent": "0 84% 60%"
  }'::jsonb);