-- Phase 1: Enhanced Registration & User Profile Extensions
-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS secondary_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_contact TEXT CHECK (preferred_contact IN ('phone', 'email'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address_type TEXT DEFAULT 'primary' CHECK (address_type IN ('primary', 'billing', 'shipping')),
  street_address TEXT NOT NULL,
  street_address_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT DEFAULT 'USA',
  validated_by_usps BOOLEAN DEFAULT false,
  validation_timestamp TIMESTAMPTZ,
  is_default BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);

-- Create adoption_preferences table
CREATE TABLE IF NOT EXISTS adoption_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  home_type TEXT CHECK (home_type IN ('apartment', 'condo', 'townhouse', 'house', 'farm', 'other')),
  has_kids BOOLEAN DEFAULT false,
  kids_ages JSONB,
  has_other_pets BOOLEAN DEFAULT false,
  other_pets JSONB,
  has_fenced_yard BOOLEAN DEFAULT false,
  health_guarantee_acknowledged BOOLEAN DEFAULT false,
  health_guarantee_acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 3: Security Features
-- Create login_attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  location JSONB,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user ON login_attempts(user_id, attempted_at DESC);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT,
  ip_address INET,
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id, revoked);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Create user_2fa table
CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_addresses
CREATE POLICY "Users can manage their own addresses"
  ON user_addresses FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all addresses"
  ON user_addresses FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for adoption_preferences
CREATE POLICY "Users can manage their own preferences"
  ON adoption_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences"
  ON adoption_preferences FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for login_attempts
CREATE POLICY "Users can view their own login history"
  ON login_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all login attempts"
  ON login_attempts FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_sessions
CREATE POLICY "Users can manage their own sessions"
  ON user_sessions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON user_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_2fa
CREATE POLICY "Users can manage their own 2FA"
  ON user_2fa FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all 2FA settings"
  ON user_2fa FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adoption_preferences_updated_at
  BEFORE UPDATE ON adoption_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();