-- Update setup system to create super-admin instead of admin
-- First, update the check_admin_exists function to check for super-admin
CREATE OR REPLACE FUNCTION public.check_admin_exists()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE role = 'super-admin'
  );
$function$;

-- Update promote_user_to_admin to promote to super-admin instead
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

-- Update the handle_new_user trigger to only assign 'user' role to new registrations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', new.email));
  
  -- Assign ONLY user role to new registrations (not admin)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$function$;

-- Update RLS policies to ensure only super-admin can manage user roles
DROP POLICY IF EXISTS "admin_delete_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin_insert_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin_select_user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "admin_update_user_roles" ON public.user_roles;

-- Create new policies that only allow super-admin to manage user roles
CREATE POLICY "super_admin_delete_user_roles" ON public.user_roles
FOR DELETE USING (has_role(auth.uid(), 'super-admin'));

CREATE POLICY "super_admin_insert_user_roles" ON public.user_roles
FOR INSERT WITH CHECK (has_role(auth.uid(), 'super-admin'));

CREATE POLICY "super_admin_select_user_roles" ON public.user_roles
FOR SELECT USING (has_role(auth.uid(), 'super-admin'));

CREATE POLICY "super_admin_update_user_roles" ON public.user_roles
FOR UPDATE USING (has_role(auth.uid(), 'super-admin'))
WITH CHECK (has_role(auth.uid(), 'super-admin'));