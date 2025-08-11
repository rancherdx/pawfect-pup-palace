-- Idempotent setup for roles and integrations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE TABLE IF NOT EXISTS public.third_party_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('sandbox','production')),
  name text,
  data_ciphertext text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service, environment)
);

ALTER TABLE public.third_party_integrations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_third_party_integrations_updated_at'
  ) THEN
    CREATE TRIGGER trg_third_party_integrations_updated_at
    BEFORE UPDATE ON public.third_party_integrations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Policies (create only if missing)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='third_party_integrations' AND policyname='admin_select_integrations') THEN
    CREATE POLICY admin_select_integrations ON public.third_party_integrations
      FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='third_party_integrations' AND policyname='admin_insert_integrations') THEN
    CREATE POLICY admin_insert_integrations ON public.third_party_integrations
      FOR INSERT TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='third_party_integrations' AND policyname='admin_update_integrations') THEN
    CREATE POLICY admin_update_integrations ON public.third_party_integrations
      FOR UPDATE TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='third_party_integrations' AND policyname='admin_delete_integrations') THEN
    CREATE POLICY admin_delete_integrations ON public.third_party_integrations
      FOR DELETE TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.change_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  context text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.change_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='change_logs' AND policyname='admin_select_change_logs') THEN
    CREATE POLICY admin_select_change_logs ON public.change_logs
      FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='change_logs' AND policyname='admin_insert_change_logs') THEN
    CREATE POLICY admin_insert_change_logs ON public.change_logs
      FOR INSERT TO authenticated
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Storage bucket and policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('apple-pay', 'apple-pay', false)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='admin_select_apple_pay') THEN
    CREATE POLICY admin_select_apple_pay ON storage.objects
      FOR SELECT TO authenticated
      USING (bucket_id = 'apple-pay' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='admin_insert_apple_pay') THEN
    CREATE POLICY admin_insert_apple_pay ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'apple-pay' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='admin_update_apple_pay') THEN
    CREATE POLICY admin_update_apple_pay ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'apple-pay' AND public.has_role(auth.uid(), 'admin'))
      WITH CHECK (bucket_id = 'apple-pay' AND public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='admin_delete_apple_pay') THEN
    CREATE POLICY admin_delete_apple_pay ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'apple-pay' AND public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;