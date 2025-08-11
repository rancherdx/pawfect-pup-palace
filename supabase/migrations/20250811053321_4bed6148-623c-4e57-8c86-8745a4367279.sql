-- Add RLS policies for user_roles (admins only)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='admin_select_user_roles') THEN
    CREATE POLICY admin_select_user_roles ON public.user_roles
      FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='admin_insert_user_roles') THEN
    CREATE POLICY admin_insert_user_roles ON public.user_roles
      FOR INSERT TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='admin_update_user_roles') THEN
    CREATE POLICY admin_update_user_roles ON public.user_roles
      FOR UPDATE TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_roles' AND policyname='admin_delete_user_roles') THEN
    CREATE POLICY admin_delete_user_roles ON public.user_roles
      FOR DELETE TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Recreate update_updated_at_column with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;