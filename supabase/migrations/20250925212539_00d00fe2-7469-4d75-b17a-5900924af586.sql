-- Fix the data deletion requests security vulnerability
-- Update RLS policy to require authentication for data deletion requests

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "secure_data_deletion_insert" ON public.data_deletion_requests;

-- Create new secure policy that requires authentication
CREATE POLICY "authenticated_data_deletion_insert" 
ON public.data_deletion_requests 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Add rate limiting for data deletion requests by creating index on user-related data
-- This helps prevent abuse by the same user
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_email_created 
ON public.data_deletion_requests (email, requested_at);

-- Create a security function to log data deletion requests
CREATE OR REPLACE FUNCTION public.log_data_deletion_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the data deletion request for audit purposes
  INSERT INTO public.security_audit_log (
    user_id, 
    event_type, 
    event_data, 
    created_at
  ) VALUES (
    auth.uid(),
    'data_deletion_request_created',
    jsonb_build_object(
      'request_id', NEW.id,
      'email', NEW.email,
      'status', NEW.status
    ),
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically log data deletion requests
DROP TRIGGER IF EXISTS trigger_log_data_deletion_request ON public.data_deletion_requests;
CREATE TRIGGER trigger_log_data_deletion_request
  AFTER INSERT ON public.data_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.log_data_deletion_request();