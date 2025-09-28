-- Update third_party_integrations policies to allow admin role
DROP POLICY IF EXISTS "super_admin_select_integrations" ON public.third_party_integrations;
DROP POLICY IF EXISTS "super_admin_insert_integrations" ON public.third_party_integrations;
DROP POLICY IF EXISTS "super_admin_update_integrations" ON public.third_party_integrations;
DROP POLICY IF EXISTS "super_admin_delete_integrations" ON public.third_party_integrations;

-- Create new policies that allow both admin and super-admin roles
CREATE POLICY "admin_select_integrations" 
ON public.third_party_integrations 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super-admin'::app_role));

CREATE POLICY "admin_insert_integrations" 
ON public.third_party_integrations 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super-admin'::app_role));

CREATE POLICY "admin_update_integrations" 
ON public.third_party_integrations 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super-admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super-admin'::app_role));

CREATE POLICY "admin_delete_integrations" 
ON public.third_party_integrations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super-admin'::app_role));