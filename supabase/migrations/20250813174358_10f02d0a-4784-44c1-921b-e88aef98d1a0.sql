-- Fix security issues by setting proper search_path for functions

-- Update function to check if any admin users exist (for setup page)
CREATE OR REPLACE FUNCTION public.check_admin_exists()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE role = 'admin'
  );
$$;

-- Update function to create first admin user
CREATE OR REPLACE FUNCTION public.create_first_admin(user_email text, user_password text, user_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_user_id uuid;
  admin_exists boolean;
BEGIN
  -- Check if admin already exists
  SELECT public.check_admin_exists() INTO admin_exists;
  
  IF admin_exists THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Admin user already exists'
    );
  END IF;
  
  -- This function is called from an edge function that will handle the actual user creation
  -- We just need to add the admin role once the user is created via Supabase Auth
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Ready to create admin user'
  );
END;
$$;

-- Update function to promote user to admin (used by edge function after Supabase Auth creates user)
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Add admin role to user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;