-- CRITICAL SECURITY FIXES

-- Fix 1: Remove dangerous public access to sensitive data
-- Remove public INSERT access to data_deletion_requests table
DROP POLICY IF EXISTS "ddr_public_insert" ON public.data_deletion_requests;

-- Fix 2: Ensure transactions table is not publicly accessible (should only be admin/user-specific)
DROP POLICY IF EXISTS "transactions_select_public" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_public" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update_public" ON public.transactions;
DROP POLICY IF EXISTS "transactions_delete_public" ON public.transactions;

-- Fix 3: Update app_role enum to include 'super-admin' for consistency
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super-admin';

-- Fix 4: Create rate limiting table for authentication attempts
CREATE TABLE IF NOT EXISTS auth_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL, -- IP address or email
    attempt_type TEXT NOT NULL, -- 'login', 'register', 'password_reset'
    attempts INTEGER DEFAULT 1,
    first_attempt TIMESTAMPTZ DEFAULT NOW(),
    last_attempt TIMESTAMPTZ DEFAULT NOW(),
    blocked_until TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_identifier ON auth_rate_limits(identifier, attempt_type);
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_blocked ON auth_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Enable RLS on rate limits table
ALTER TABLE auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only admins can view rate limiting data
CREATE POLICY "auth_rate_limits_admin_select" ON auth_rate_limits
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 5: Create audit log table for security events
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'role_change', 'login_failed', 'data_access', etc.
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_user ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_created ON security_audit_log(created_at);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "security_audit_admin_select" ON security_audit_log
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert audit logs
CREATE POLICY "security_audit_system_insert" ON security_audit_log
FOR INSERT WITH CHECK (true);

-- Fix 6: Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO security_audit_log (user_id, event_type, event_data, ip_address, user_agent)
    VALUES (p_user_id, p_event_type, p_event_data, p_ip_address::INET, p_user_agent)
    RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$;