CREATE OR REPLACE FUNCTION public.count_super_admins()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT user_id)::integer FROM public.user_roles WHERE role = 'super-admin';
$$;
