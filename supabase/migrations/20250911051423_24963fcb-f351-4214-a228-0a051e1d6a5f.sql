-- Phase 1: Database/RLS fixes
-- Add policy to allow users to select their own roles
CREATE POLICY "user_roles_user_select_self" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Also add a policy to allow authenticated users to read their own profiles
CREATE POLICY "profiles_authenticated_select_self"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());