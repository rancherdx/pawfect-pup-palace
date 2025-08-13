-- Create database functions and triggers for user profile management

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', new.email));
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check if any admin users exist (for setup page)
CREATE OR REPLACE FUNCTION public.check_admin_exists()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE role = 'admin'
  );
$$;

-- Function to create first admin user
CREATE OR REPLACE FUNCTION public.create_first_admin(user_email text, user_password text, user_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to promote user to admin (used by edge function after Supabase Auth creates user)
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add admin role to user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;