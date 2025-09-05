-- Fix the promote_user_to_admin function to use SECURITY DEFINER
-- This allows it to bypass RLS policies during execution
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Add super-admin role to user (which includes admin and user privileges)
  INSERT INTO public.user_roles (user_id, role)
  VALUES 
    (target_user_id, 'super-admin'),
    (target_user_id, 'admin'),
    (target_user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$function$;

-- Add a special RLS policy for initial setup
-- This allows inserting the first super-admin role when no super-admin exists yet
CREATE POLICY "Allow initial super admin setup" ON public.user_roles
FOR INSERT 
WITH CHECK (
  role = 'super-admin'::app_role 
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'super-admin'::app_role
  )
);

-- Also allow the system to insert admin and user roles during initial setup
CREATE POLICY "Allow initial admin and user roles setup" ON public.user_roles
FOR INSERT 
WITH CHECK (
  role IN ('admin'::app_role, 'user'::app_role)
  AND user_id IN (
    SELECT user_id FROM public.user_roles WHERE role = 'super-admin'::app_role
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_roles.user_id AND role = user_roles.role
  )
);