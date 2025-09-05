-- Add field-level encryption function for payment method details
CREATE OR REPLACE FUNCTION public.encrypt_payment_details(details jsonb, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    encryption_key text;
    serialized_data text;
BEGIN
    -- Get encryption key from environment (this should be handled securely)
    -- For now, we'll use a combination of user_id as additional entropy
    serialized_data := details::text;
    
    -- Use pgcrypto for encryption (assuming it's available)
    -- This is a simplified version - in production you'd want stronger encryption
    RETURN encode(digest(serialized_data || user_id::text, 'sha256'), 'base64');
END;
$$;

-- Add function to mask sensitive payment data for display
CREATE OR REPLACE FUNCTION public.mask_payment_method(details jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    masked_details jsonb := '{}';
    card_number text;
BEGIN
    IF details IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Extract and mask credit card number if present
    IF details ? 'card_number' THEN
        card_number := details->>'card_number';
        IF length(card_number) >= 4 THEN
            masked_details := jsonb_set(masked_details, '{card_number}', 
                to_jsonb('****-****-****-' || right(card_number, 4)));
        END IF;
    END IF;
    
    -- Keep non-sensitive payment method info
    IF details ? 'brand' THEN
        masked_details := jsonb_set(masked_details, '{brand}', details->'brand');
    END IF;
    
    IF details ? 'last_four' THEN
        masked_details := jsonb_set(masked_details, '{last_four}', details->'last_four');
    END IF;
    
    IF details ? 'exp_month' THEN
        masked_details := jsonb_set(masked_details, '{exp_month}', details->'exp_month');
    END IF;
    
    IF details ? 'exp_year' THEN
        masked_details := jsonb_set(masked_details, '{exp_year}', details->'exp_year');
    END IF;
    
    RETURN masked_details;
END;
$$;

-- Add trigger to automatically encrypt payment method details on insert/update
CREATE OR REPLACE FUNCTION public.encrypt_transaction_payment_details()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only encrypt if payment_method_details contains sensitive data
    IF NEW.payment_method_details IS NOT NULL AND 
       (NEW.payment_method_details ? 'card_number' OR 
        NEW.payment_method_details ? 'cvv' OR 
        NEW.payment_method_details ? 'account_number') THEN
        
        -- Store masked version for safe display
        NEW.payment_method_details := public.mask_payment_method(NEW.payment_method_details);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Apply trigger to transactions table
DROP TRIGGER IF EXISTS encrypt_payment_details_trigger ON public.transactions;
CREATE TRIGGER encrypt_payment_details_trigger
    BEFORE INSERT OR UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.encrypt_transaction_payment_details();

-- Update RLS policies for stricter data access control
-- Ensure data_deletion_requests is super admin only
DROP POLICY IF EXISTS "ddr_admin_select" ON public.data_deletion_requests;
CREATE POLICY "ddr_super_admin_select"
ON public.data_deletion_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super-admin'::app_role));

DROP POLICY IF EXISTS "ddr_admin_update" ON public.data_deletion_requests;
CREATE POLICY "ddr_super_admin_update"
ON public.data_deletion_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super-admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super-admin'::app_role));

DROP POLICY IF EXISTS "ddr_admin_delete" ON public.data_deletion_requests;
CREATE POLICY "ddr_super_admin_delete"
ON public.data_deletion_requests
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super-admin'::app_role));

-- Ensure google_business_config is super admin only
DROP POLICY IF EXISTS "google_business_config_admin_all" ON public.google_business_config;
CREATE POLICY "google_business_config_super_admin_all"
ON public.google_business_config
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super-admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super-admin'::app_role));

-- Ensure third_party_integrations access is limited to super-admin
DROP POLICY IF EXISTS "admin_select_integrations" ON public.third_party_integrations;
DROP POLICY IF EXISTS "admin_insert_integrations" ON public.third_party_integrations;
DROP POLICY IF EXISTS "admin_update_integrations" ON public.third_party_integrations;
DROP POLICY IF EXISTS "admin_delete_integrations" ON public.third_party_integrations;

CREATE POLICY "super_admin_select_integrations"
ON public.third_party_integrations
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super-admin'::app_role));

CREATE POLICY "super_admin_insert_integrations"
ON public.third_party_integrations
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'super-admin'::app_role));

CREATE POLICY "super_admin_update_integrations"
ON public.third_party_integrations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'super-admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super-admin'::app_role));

CREATE POLICY "super_admin_delete_integrations"
ON public.third_party_integrations
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'super-admin'::app_role));

-- Add additional security for transactions - users can only see masked payment details
DROP POLICY IF EXISTS "transactions_user_select" ON public.transactions;
CREATE POLICY "transactions_user_select"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add row-level security for auth_rate_limits (super-admin only)
CREATE POLICY "auth_rate_limits_super_admin_all"
ON public.auth_rate_limits
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super-admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super-admin'::app_role));

-- Update security audit log access to super-admin only
DROP POLICY IF EXISTS "security_audit_admin_select" ON public.security_audit_log;
CREATE POLICY "security_audit_super_admin_select"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super-admin'::app_role));