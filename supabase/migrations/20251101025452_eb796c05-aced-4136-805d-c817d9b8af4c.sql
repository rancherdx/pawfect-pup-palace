-- Remove setup-related functions
DROP FUNCTION IF EXISTS public.count_super_admins();
DROP FUNCTION IF EXISTS public.promote_user_to_admin(uuid);
DROP FUNCTION IF EXISTS public.check_admin_exists();
DROP FUNCTION IF EXISTS public.create_first_admin(text, text, text);

-- Add password management fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- Add index for querying users who need password change
CREATE INDEX IF NOT EXISTS idx_profiles_force_password_change 
ON public.profiles(force_password_change) 
WHERE force_password_change = TRUE;