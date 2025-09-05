-- Fix security linter warnings

-- Fix 1: Update function with proper search path
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
SET search_path = public
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